import { Linking, Platform, Share } from 'react-native';
import { SnapseedQRPreset } from './catalog';

const SNAPSEED_PACKAGE = 'com.niksoftware.snapseed';
const PLAY_STORE_URL = `market://details?id=${SNAPSEED_PACKAGE}`;
const WEB_PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${SNAPSEED_PACKAGE}`;
const APP_STORE_URL = 'https://apps.apple.com/app/snapseed/id439438619';

/**
 * Attempts to launch Google Snapseed on the device, or navigates to the store page.
 */
export async function openSnapseed(): Promise<{ success: boolean; openedStore: boolean }> {
  if (Platform.OS === 'android') {
    // Attempt to open Play Store / app via market link
    try {
      const canOpenMarket = await Linking.canOpenURL(PLAY_STORE_URL);
      if (canOpenMarket) {
        await Linking.openURL(PLAY_STORE_URL);
        return { success: true, openedStore: true };
      }
    } catch {
      // Fallback to web link
    }

    try {
      await Linking.openURL(WEB_PLAY_STORE_URL);
      return { success: true, openedStore: true };
    } catch {
      return { success: false, openedStore: false };
    }
  }

  if (Platform.OS === 'ios') {
    try {
      await Linking.openURL(APP_STORE_URL);
      return { success: true, openedStore: true };
    } catch {
      return { success: false, openedStore: false };
    }
  }

  return { success: false, openedStore: false };
}

/**
 * Shares preset recipe highlights and details so users can save or forward it.
 */
export async function sharePresetRecipe(preset: SnapseedQRPreset): Promise<void> {
  const message = [
    `🌿 Snapseed QR Look: ${preset.title}`,
    `"${preset.tagline}"`,
    '',
    `Best for: ${preset.bestFor}`,
    '',
    'Recipe Highlights:',
    ...preset.recipeHighlights.map((step) => `• ${step}`),
    '',
    'How to scan in Google Snapseed:',
    '1. Open photo in Snapseed',
    '2. Tap Edit Stack icon at top (looks like layers)',
    '3. Choose "QR Look" ➔ "Scan QR Look"',
    '4. Point camera at the QR card in ND Camera!',
  ].join('\n');

  try {
    await Share.share({
      title: `${preset.title} - Snapseed QR Look`,
      message,
    });
  } catch (error) {
    console.warn('Failed to share Snapseed preset:', error);
  }
}
