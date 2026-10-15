import { randomUUID } from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { Image, Platform } from 'react-native';
import {
  assertImageSize, assertLocalUri, displayName, imageExtension,
  normalizeImageMime, type ImportedPhoto, type PhotoInput,
} from './photo-policy';

function dimensions(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => Image.getSize(
    uri, (width, height) => resolve({ width, height }),
    () => reject(new Error('This device could not decode the image. Try a JPEG export from your photo editor.')),
  ));
}

/** Copy, never move or rewrite, the received file. Source-library assets are untouched. */
export async function importLocalPhoto(input: PhotoInput, origin: ImportedPhoto['origin']): Promise<ImportedPhoto> {
  assertLocalUri(input.uri);
  const mimeType = normalizeImageMime(input.mimeType, input.name);
  const extension = imageExtension(mimeType);
  const id = randomUUID();
  if (!FileSystem.cacheDirectory) throw new Error('Photo storage is unavailable on this platform.');
  const directory = `${FileSystem.cacheDirectory}nd-camera/imports/`;
  const uri = `${directory}${id}.${extension}`;

  // Check before copying to avoid accepting an oversized file into our cache.
  const original = await FileSystem.getInfoAsync(input.uri);
  if (!original.exists || original.isDirectory) throw new Error('The shared photo is no longer available. Import it from your gallery.');
  assertImageSize(original.size);
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  try {
    await FileSystem.copyAsync({ from: input.uri, to: uri });
    const copied = await FileSystem.getInfoAsync(uri);
    if (!copied.exists || copied.isDirectory) throw new Error('The photo copy could not be created.');
    assertImageSize(copied.size);
    const size = await dimensions(uri);
    return { ...input, ...size, mimeType, id, uri, byteSize: copied.size, origin, name: displayName(input.name, `Photo.${extension}`) };
  } catch (error) {
    await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
    throw error;
  }
}

export async function pickPhoto(): Promise<ImportedPhoto | null> {
  // The system picker grants access to the selected image, not the whole library.
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'], allowsEditing: false, allowsMultipleSelection: false,
    quality: 1, exif: false, base64: false,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) throw new Error('No photo was returned by the picker.');
  const mimeType = normalizeImageMime(asset.mimeType, asset.fileName ?? asset.uri);
  if (Platform.OS === 'web') {
    // Browser preview only. Never upload a photo to work around web sharing limits.
    const byteSize = asset.fileSize ?? asset.file?.size ?? 0;
    assertImageSize(byteSize);
    return {
      id: randomUUID(), uri: asset.uri, mimeType,
      name: displayName(asset.fileName ?? undefined, `Photo.${imageExtension(mimeType)}`),
      width: asset.width, height: asset.height, byteSize, origin: 'picker',
    };
  }
  return importLocalPhoto({ uri: asset.uri, mimeType, name: asset.fileName ?? undefined }, 'picker');
}

export async function shareOriginal(photo: ImportedPhoto): Promise<void> {
  if (Platform.OS === 'web') throw new Error('Local-file sharing is available in the Android and iOS development builds.');
  if (!await Sharing.isAvailableAsync()) throw new Error('No system share sheet is available on this device.');
  const uti: Record<string, string> = { 'image/jpeg': 'public.jpeg', 'image/png': 'public.png', 'image/heic': 'public.heic', 'image/heif': 'public.heif', 'image/webp': 'org.webmproject.webp' };
  await Sharing.shareAsync(photo.uri, {
    mimeType: photo.mimeType, UTI: uti[photo.mimeType],
    dialogTitle: 'Share original photo - choose an editor or another app',
  });
}
