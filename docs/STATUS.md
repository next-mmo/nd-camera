# Implementation and verification status

Updated on 2026-10-15.

## Verified locally

- **Upstream & Starter Verification**: `npm run check:starter` verified against Universal Apps a81fa85 and source hashes.
- **Unit & Policy Test Suite**: `npm test` passed (16 tests passing: photo policy, iOS/Leica camera styles, matrix interpolation, tone/warmth controls, Gray Mode verification, and Snapseed catalog/asset integrity).
- **TypeScript Static Verification**: `npm run typecheck` passed (0 errors).
- **Metro Android Export**: `npm run export:android` passed (bundled 841 modules and 12 Snapseed preset assets).
- **iOS Photographic Styles**: Standard, Rich Contrast, Vibrant, Warm, and Cool styles calibrated with real-time slider controls for Tone (-1.0 to +1.0) and Warmth (-1.0 to +1.0).
- **Leica Camera Profiles**: Authentic Look, Vibrant Look, and Monochrom Look with hardware-accelerated optical radial vignette toggle.
- **Studio Gray Mode**: High-contrast, pure grayscale monochrome (0.299 R, 0.587 G, 0.114 B) for instant filter and Hold to Compare validation.
- **Google Snapseed Integration**: Direct native launch intent (`openApp("com.niksoftware.snapseed")`) configured with Android 11+ `<queries>` package visibility to open Snapseed immediately without redirecting to Play Store when installed, plus 12 curated scannable QR Look cards and step-by-step import guide.
- **Native Android Hardware Acceleration**: `NDFilterModule.kt` registered with `@ReactModule` and `BaseReactPackage` for React Native New Architecture compatibility, compiled via Gradle for `arm64-v8a` architecture (Google Pixel 9 Pro XL target). Handles ColorMatrix transformation, EXIF rotation preservation, and optical gradient vignette.
- **High-Res Photo Memory Management**: Enabled `android:largeHeap="true"` to effortlessly handle 50MP/12.5MP Pixel 9 Pro XL captures without memory exhaustion.
- **Offline Self-Contained APK**: Compiled locally with embedded offline JavaScript bundle and all assets in `apk/nd-camera-debug.apk`.
- **Non-destructive Policy**: Original photos are strictly protected; exports are saved separately with appropriate metadata.

## Not verified on physical hardware

- Physical Pixel 9 Pro XL optical and screen calibration tests under varying lighting conditions.
- Direct camera sensor raw captures vs system HDR pipeline comparisons.

## Next acceptance gates

1. Physical-device testing on Pixel 9 Pro XL: verify APK installation, photo import/share, Gray Mode, and style adjustments.
2. Test Snapseed direct launcher and QR scanning: open Snapseed ➔ Edit Stack ➔ Scan QR Look directly from ND Camera's fullscreen card.
3. Test native filter performance and export latency on 50MP/12MP Pixel camera shots.
