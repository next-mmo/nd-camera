package com.nextdev.ndcamera

import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.RadialGradient
import android.graphics.Shader
import android.net.Uri
import androidx.exifinterface.media.ExifInterface
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.util.UUID

@ReactModule(name = NDFilterModule.NAME)
class NDFilterModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "NDFilter"
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun applyColorMatrix(
        sourcePathOrUri: String,
        matrixValues: ReadableArray,
        vignetteIntensity: Double,
        quality: Int,
        promise: Promise
    ) {
        Thread {
            try {
                val parsedUri = Uri.parse(sourcePathOrUri)
                val cleanPath = if (sourcePathOrUri.startsWith("file://")) {
                    parsedUri.path ?: sourcePathOrUri.substring(7)
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
                    } catch (_: Throwable) {}
                    BitmapFactory.decodeFile(srcFile.absolutePath)
                } else {
                    try {
                        reactContext.contentResolver.openInputStream(parsedUri)?.use { stream ->
                            val exif = ExifInterface(stream)
                            exifOrientation = exif.getAttributeInt(
                                ExifInterface.TAG_ORIENTATION,
                                ExifInterface.ORIENTATION_NORMAL
                            )
                        }
                    } catch (_: Throwable) {}
                    inputStream = reactContext.contentResolver.openInputStream(parsedUri)
                    inputStream?.use { stream ->
                        BitmapFactory.decodeStream(stream)
                    }
                }

                if (bitmap == null) {
                    promise.reject("DECODE_ERROR", "Could not decode source image from: $sourcePathOrUri")
                    return@Thread
                }

                // Handle EXIF orientation
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
                floatArray[4] *= 255f
                floatArray[9] *= 255f
                floatArray[14] *= 255f
                floatArray[19] *= 255f

                val colorMatrix = ColorMatrix(floatArray)
                paint.colorFilter = ColorMatrixColorFilter(colorMatrix)
                canvas.drawBitmap(orientedBitmap, 0f, 0f, paint)

                // Apply optional optical vignette (Leica style)
                if (vignetteIntensity > 0.001) {
                    val clampedVignette = Math.min(1.0, Math.max(0.0, vignetteIntensity))
                    val radius = Math.hypot(width.toDouble(), height.toDouble()).toFloat() * 0.55f
                    val alpha = (clampedVignette * 175).toInt()
                    val vignetteShader = RadialGradient(
                        width * 0.5f,
                        height * 0.5f,
                        radius,
                        intArrayOf(Color.TRANSPARENT, Color.argb(alpha, 0, 0, 0)),
                        floatArrayOf(0.42f, 1.0f),
                        Shader.TileMode.CLAMP
                    )
                    val vPaint = Paint(Paint.ANTI_ALIAS_FLAG)
                    vPaint.shader = vignetteShader
                    canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), vPaint)
                }

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
            } catch (e: Throwable) {
                promise.reject("RENDER_ERROR", "Rendering failed: ${e.message}", e)
            }
        }.start()
    }

    @ReactMethod
    fun isAppInstalled(packageName: String, promise: Promise) {
        try {
            val pm = reactContext.packageManager
            pm.getPackageInfo(packageName, 0)
            promise.resolve(true)
        } catch (_: Throwable) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun openApp(packageName: String, promise: Promise) {
        try {
            val pm = reactContext.packageManager
            val intent = pm.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.resolve(false)
            }
        } catch (e: Throwable) {
            promise.reject("LAUNCH_ERROR", "Failed to launch $packageName: ${e.message}", e)
        }
    }
}
