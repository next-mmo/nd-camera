import { Linking, NativeModules, Platform, Share } from 'react-native';
import { SnapseedQRPreset } from './catalog';

const SNAPSEED_PACKAGE = 'com.niksoftware.snapseed';
const PLAY_STORE_URL = `market://details?id=${SNAPSEED_PACKAGE}`;
const WEB_PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${SNAPSEED_PACKAGE}`;
const APP_STORE_URL = 'https://apps.apple.com/app/snapseed/id439438619';
const IOS_SNAPSEED_URL = 'snapseed://';

interface NDFilterNativeInterface {
  isAppInstalled?(packageName: string): Promise<boolean>;
  openApp?(packageName: string): Promise<boolean>;
}

/**
 * Checks whether Google Snapseed is installed on the device.
 */
export async function isSnapseedInstalled(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const ndFilter = NativeModules.NDFilter as NDFilterNativeInterface | undefined;
    if (typeof ndFilter?.isAppInstalled === 'function') {
      try {
        return await ndFilter.isAppInstalled(SNAPSEED_PACKAGE);
      } catch {
        return false;
      }
    }
  } else if (Platform.OS === 'ios') {
    try {
      return await Linking.canOpenURL(IOS_SNAPSEED_URL);
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Attempts to launch Google Snapseed on the device.
 * If installed, launches the app directly. Only navigates to the store if Snapseed is absent.
 */
export async function openSnapseed(): Promise<{ success: boolean; openedStore: boolean }> {
  if (Platform.OS === 'android') {
    const ndFilter = NativeModules.NDFilter as NDFilterNativeInterface | undefined;
    if (typeof ndFilter?.openApp === 'function') {
      try {
        const launched = await ndFilter.openApp(SNAPSEED_PACKAGE);
        if (launched) {
          return { success: true, openedStore: false };
        }
      } catch (err) {
        console.warn('Native openApp for Snapseed failed:', err);
      }
    }

    // Snapseed is not installed or launch failed: fall back to Google Play Store
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
      const canOpenApp = await Linking.canOpenURL(IOS_SNAPSEED_URL);
      if (canOpenApp) {
        await Linking.openURL(IOS_SNAPSEED_URL);
        return { success: true, openedStore: false };
      }
    } catch {
      // Fallback to App Store
    }

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
