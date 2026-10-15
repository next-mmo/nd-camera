import { NativeModules, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import type { ImportedPhoto } from '../photos/photo-policy';
import { createEditRecipe, getStyleMatrix, isAvailableProfile } from './catalog';

export interface RenderResult {
  readonly uri: string;
  readonly width: number;
  readonly height: number;
  readonly byteSize: number;
  readonly profileId: string;
  readonly strength: number;
}

interface NativeNDFilterInterface {
  applyColorMatrix(
    sourcePathOrUri: string,
    matrixValues: number[],
    quality: number,
  ): Promise<{
    uri: string;
    width: number;
    height: number;
    byteSize: number;
  }>;
}

const NativeNDFilter = NativeModules.NDFilter as NativeNDFilterInterface | undefined;

/**
 * Render a styled photo using the exact same SDR color matrix recipe for preview and export.
 * Rejects unavailable profiles.
 */
export async function renderStyledPhoto(
  photo: ImportedPhoto,
  profileId: string,
  strength = 1,
): Promise<RenderResult> {
  if (profileId === 'original') {
    return {
      uri: photo.uri,
      width: photo.width,
      height: photo.height,
      byteSize: photo.byteSize,
      profileId: 'original',
      strength: 1,
    };
  }

  if (!isAvailableProfile(profileId)) {
    throw new Error(`ND style profile "${profileId}" is not implemented.`);
  }

  const recipe = createEditRecipe(photo.id, profileId, strength);
  const matrix = getStyleMatrix(recipe.profileId, recipe.strength);

  if (NativeNDFilter?.applyColorMatrix) {
    const rendered = await NativeNDFilter.applyColorMatrix(photo.uri, matrix, 95);
    return {
      ...rendered,
      profileId: recipe.profileId,
      strength: recipe.strength,
    };
  }

  // Fallback for platforms without native module (e.g. web or dev preview)
  return {
    uri: photo.uri,
    width: photo.width,
    height: photo.height,
    byteSize: photo.byteSize,
    profileId: recipe.profileId,
    strength: recipe.strength,
  };
}

/**
 * Share the rendered styled photo through the system share sheet.
 * The original photo is never modified or overwritten.
 */
export async function shareStyled(
  rendered: RenderResult,
  photo: ImportedPhoto,
): Promise<void> {
  if (Platform.OS === 'web') {
    throw new Error('Local-file sharing is available in the Android and iOS development builds.');
  }
  if (!await Sharing.isAvailableAsync()) {
    throw new Error('No system share sheet is available on this device.');
  }

  const uti: Record<string, string> = {
    'image/jpeg': 'public.jpeg',
    'image/png': 'public.png',
    'image/heic': 'public.heic',
    'image/heif': 'public.heif',
    'image/webp': 'org.webmproject.webp',
  };

  const styleLabel = rendered.profileId === 'original'
    ? 'original'
    : `${rendered.profileId} style (${Math.round(rendered.strength * 100)}%)`;

  await Sharing.shareAsync(rendered.uri, {
    mimeType: photo.mimeType,
    UTI: uti[photo.mimeType] ?? 'public.jpeg',
    dialogTitle: `Share ${styleLabel} photo - choose an editor or another app`,
  });
}
