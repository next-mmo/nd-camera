# Implementation and verification status

Updated on 2026-10-15.

## Verified locally

- **Upstream & Starter Verification**: `npm run check:starter` verified against Universal Apps a81fa85 and source hashes.
- **Unit & Policy Test Suite**: `npm test` passed (15 tests passing: photo policy, iOS/Leica camera styles, matrix interpolation, tone/warmth controls, and Snapseed catalog/asset integrity).
- **TypeScript Static Verification**: `npm run typecheck` passed (0 errors).
- **Metro Android Export**: `npm run export:android` passed (bundled 841 modules and 12 Snapseed preset assets).
- **iOS Photographic Styles**: Standard, Rich Contrast, Vibrant, Warm, and Cool styles calibrated with real-time slider controls for Tone (-1.0 to +1.0) and Warmth (-1.0 to +1.0).
- **Leica Camera Profiles**: Authentic Look, Vibrant Look, and Monochrom Look with hardware-accelerated optical radial vignette toggle.
- **Google Snapseed QR Looks Collection**: 12 curated, scannable QR Look cards (Kodak Portra 400, Kodachrome 64, Retro 35mm, Polaroid Light Leak, Soft Glow, Warm Golden, Moody Portrait, Leica Moody B&W, Urban Contrast B&W, Golden Hour Sunset, Cinematic Cool Blues, Minimal Parisian Beige) with step-by-step Snapseed import guide, recipe highlights, and direct app launcher.
- **Native Android Hardware Acceleration**: `NDFilterModule.kt` registered in `MainApplication.kt` and compiled via Gradle for `arm64-v8a` architecture (Google Pixel 9 Pro XL target). Handles ColorMatrix transformation, EXIF rotation preservation, and optical gradient vignette.
- **Offline Self-Contained APK**: Compiled locally with embedded offline JavaScript bundle and all assets (`debuggableVariants = []`) in `apk/nd-camera-debug.apk` (68.6 MB).
- **Non-destructive Policy**: Original photos are strictly protected; exports are saved separately with appropriate metadata.

## Not verified on physical hardware

- Physical Pixel 9 Pro XL optical and screen calibration tests under varying lighting conditions.
- Direct camera sensor raw captures vs system HDR pipeline comparisons.

## Next acceptance gates

1. Physical-device testing on Pixel 9 Pro XL: verify APK installation, photo import/share, and style adjustments.
2. Test Snapseed QR scanning: open Snapseed ➔ Edit Stack ➔ Scan QR Look directly from ND Camera's fullscreen card.
3. Test native filter performance and export latency on 50MP/12MP Pixel camera shots.
