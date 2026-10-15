import { NativeModules, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import type { ImportedPhoto } from '../photos/photo-policy';
import { createEditRecipe, getStyleMatrix, isAvailableProfile, ND_STYLES } from './catalog';

export interface RenderResult {
  readonly uri: string;
  readonly width: number;
  readonly height: number;
  readonly byteSize: number;
  readonly profileId: string;
  readonly strength: number;
  readonly tone: number;
  readonly warmth: number;
  readonly vignette: number;
}

interface NativeNDFilterInterface {
  applyColorMatrix(
    sourcePathOrUri: string,
    matrixValues: number[],
    vignetteIntensity: number,
    quality: number,
  ): Promise<{
    uri: string;
    width: number;
    height: number;
    byteSize: number;
  }>;
}

export function isNativeFilterAvailable(): boolean {
  const mod = NativeModules.NDFilter as NativeNDFilterInterface | undefined;
  return typeof mod?.applyColorMatrix === 'function';
}

/**
 * Render a styled photo using the exact same SDR color matrix recipe for preview and export.
 * Supports iOS Photographic Styles, Leica profiles, tone/warmth adjustments, and optical vignette.
 */
export async function renderStyledPhoto(
  photo: ImportedPhoto,
  profileId: string,
  strength = 1,
  tone = 0,
  warmth = 0,
  vignette?: number,
): Promise<RenderResult> {
  if (profileId === 'original') {
    return {
      uri: photo.uri,
      width: photo.width,
      height: photo.height,
      byteSize: photo.byteSize,
      profileId: 'original',
      strength: 1,
      tone: 0,
      warmth: 0,
      vignette: 0,
    };
  }

  if (!isAvailableProfile(profileId)) {
    throw new Error(`ND style profile "${profileId}" is not implemented.`);
  }

  const def = ND_STYLES.find((s) => s.id === profileId);
  const effectiveVignette = vignette !== undefined ? vignette : (def?.defaultVignette ?? 0);

  const recipe = createEditRecipe(photo.id, profileId, strength, tone, warmth, effectiveVignette);
  const matrix = getStyleMatrix(recipe.profileId, recipe.strength, recipe.tone, recipe.warmth);

  const nativeModule = NativeModules.NDFilter as NativeNDFilterInterface | undefined;

  if (nativeModule?.applyColorMatrix) {
    const rendered = await nativeModule.applyColorMatrix(
      photo.uri,
      matrix,
      recipe.vignette,
      95,
    );
    return {
      ...rendered,
      profileId: recipe.profileId,
      strength: recipe.strength,
      tone: recipe.tone,
      warmth: recipe.warmth,
      vignette: recipe.vignette,
    };
  }

  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    throw new Error(
      'NDFilter native module not detected. Please launch the installed ND Camera APK (nd-camera-debug.apk) instead of Expo Go.',
    );
  }

  // Fallback for web preview
  return {
    uri: photo.uri,
    width: photo.width,
    height: photo.height,
    byteSize: photo.byteSize,
    profileId: recipe.profileId,
    strength: recipe.strength,
    tone: recipe.tone,
    warmth: recipe.warmth,
    vignette: recipe.vignette,
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

  const styleDef = ND_STYLES.find((s) => s.id === rendered.profileId);
  const styleLabel = rendered.profileId === 'original'
    ? 'original'
    : `${styleDef?.name ?? rendered.profileId} (${Math.round(rendered.strength * 100)}%)`;

  await Sharing.shareAsync(rendered.uri, {
    mimeType: photo.mimeType,
    UTI: uti[photo.mimeType] ?? 'public.jpeg',
    dialogTitle: `Share ${styleLabel} photo - choose an editor or another app`,
  });
}
