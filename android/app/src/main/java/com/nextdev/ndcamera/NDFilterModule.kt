package com.nextdev.ndcamera

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.Matrix
import android.graphics.Paint
import android.net.Uri
import androidx.exifinterface.media.ExifInterface
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.util.UUID

class NDFilterModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "NDFilter"

    @ReactMethod
    fun applyColorMatrix(
        sourcePathOrUri: String,
        matrixValues: ReadableArray,
        quality: Int,
        promise: Promise
    ) {
        Thread {
            try {
                val cleanPath = if (sourcePathOrUri.startsWith("file://")) {
                    sourcePathOrUri.substring(7)
                } else {
                    sourcePathOrUri
                }

                val srcFile = File(cleanPath)
                var inputStream: InputStream? = null
                var exifOrientation = ExifInterface.ORIENTATION_NORMAL

                val bitmap: Bitmap? = if (srcFile.exists()) {
                    try {
                        val exif = ExifInterface(srcFile.absolutePath)
                        exifOrientation = exif.getAttributeInt(
                            ExifInterface.TAG_ORIENTATION,
                            ExifInterface.ORIENTATION_NORMAL
                        )
                    } catch (_: Exception) {}
                    BitmapFactory.decodeFile(srcFile.absolutePath)
                } else {
                    val uri = Uri.parse(sourcePathOrUri)
                    try {
                        reactContext.contentResolver.openInputStream(uri)?.use { stream ->
                            val exif = ExifInterface(stream)
                            exifOrientation = exif.getAttributeInt(
                                ExifInterface.TAG_ORIENTATION,
                                ExifInterface.ORIENTATION_NORMAL
                            )
                        }
                    } catch (_: Exception) {}
                    inputStream = reactContext.contentResolver.openInputStream(uri)
                    inputStream?.use { stream ->
                        BitmapFactory.decodeStream(stream)
                    }
                }

                if (bitmap == null) {
                    promise.reject("DECODE_ERROR", "Could not decode source image from: $sourcePathOrUri")
                    return@Thread
                }

                // Handle orientation if needed
                val rotationMatrix = Matrix()
                when (exifOrientation) {
                    ExifInterface.ORIENTATION_ROTATE_90 -> rotationMatrix.postRotate(90f)
                    ExifInterface.ORIENTATION_ROTATE_180 -> rotationMatrix.postRotate(180f)
                    ExifInterface.ORIENTATION_ROTATE_270 -> rotationMatrix.postRotate(270f)
                    ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> rotationMatrix.postScale(-1f, 1f)
                    ExifInterface.ORIENTATION_FLIP_VERTICAL -> rotationMatrix.postScale(1f, -1f)
                }

                val orientedBitmap = if (!rotationMatrix.isIdentity) {
                    val rotated = Bitmap.createBitmap(
                        bitmap, 0, 0, bitmap.width, bitmap.height, rotationMatrix, true
                    )
                    if (rotated != bitmap) bitmap.recycle()
                    rotated
                } else {
                    bitmap
                }

                val width = orientedBitmap.width
                val height = orientedBitmap.height

                val outputBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                val canvas = Canvas(outputBitmap)
                val paint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)

                // ColorMatrix in Android takes 20 floats
                val floatArray = FloatArray(20)
                for (i in 0 until 20) {
                    floatArray[i] = if (i < matrixValues.size()) {
                        matrixValues.getDouble(i).toFloat()
                    } else {
                        0f
                    }
                }

                // Android ColorMatrix expects offset values in range 0..255 (not 0..1)
                // Normalize 4th, 9th, 14th, 19th indices if in 0..1 scale
                floatArray[4] *= 255f
                floatArray[9] *= 255f
                floatArray[14] *= 255f
                floatArray[19] *= 255f

                val colorMatrix = ColorMatrix(floatArray)
                paint.colorFilter = ColorMatrixColorFilter(colorMatrix)
                canvas.drawBitmap(orientedBitmap, 0f, 0f, paint)

                val exportDir = File(reactContext.cacheDir, "nd-camera/exports")
                if (!exportDir.exists()) {
                    exportDir.mkdirs()
                }

                val outputFile = File(exportDir, "styled_${UUID.randomUUID()}.jpg")
                FileOutputStream(outputFile).use { out ->
                    outputBitmap.compress(
                        Bitmap.CompressFormat.JPEG,
                        if (quality in 1..100) quality else 95,
                        out
                    )
                }

                orientedBitmap.recycle()
                outputBitmap.recycle()

                val result: WritableMap = Arguments.createMap()
                result.putString("uri", "file://${outputFile.absolutePath}")
                result.putInt("width", width)
                result.putInt("height", height)
                result.putDouble("byteSize", outputFile.length().toDouble())

                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("RENDER_ERROR", "Rendering failed: ${e.message}", e)
            }
        }.start()
    }
}
