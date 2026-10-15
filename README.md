# ND Camera

An Android-first React Native photo companion, initialized from the real
`expo-uniwind` template in [next-mmo/universal-apps](https://github.com/next-mmo/universal-apps).
ND Camera belongs in [next-mmo/nd-camera](https://github.com/next-mmo/nd-camera).

**This is the application starter, not a completed iPhone-style camera.**

## Included

- Expo 57 + React Native 0.86.3 + TypeScript + Uniwind/Tailwind v4.
- ND Camera branding and a responsive, accessible starter screen.
- Single-photo import through the system picker and original-image preview.
- Android image share-in configuration and local-file handling.
- Original-file sharing through the mobile system share sheet; choose Snapseed
  when available, or open the source in Snapseed separately.
- A future ND Styles catalog that explicitly marks every style as unimplemented.
- Validation tests and upstream provenance checks.

No account, ND backend, photo upload, background library watcher, broad photo
library permission, camera permission, or microphone permission is requested.
Received native photos are copied to app cache, never moved or edited in place.
Cache copies are temporary; the source in the user's gallery/editor is untouched.
Original-file sharing may retain metadata, including location.

## Start development

Use Node 24 LTS and npm. Install Android Studio/Android SDK and connect a device
with USB debugging, or start an Android emulator.

```sh
git clone https://github.com/next-mmo/nd-camera.git
cd nd-camera
npm install
npm run check:starter
npm test
npm run check:expo
npm run typecheck
npm run android
```

`npm run android` builds and installs the native development app. On later runs,
use `npm start` to start Metro for the installed development build. Expo Go is
not a substitute for testing ND Camera's own Android share target.

```sh
npm run web              # Browser import/preview, not native app integration
npm run ios              # macOS/Xcode required; picker and share-out only
npm run export:android   # JavaScript bundling check, not an APK build
```

The initial environment could not reach the package registry, so no package
manager lockfile is fabricated. The first successful install creates
`package-lock.json`; review and commit it before relying on reproducible builds.
Use `npm ci` once that lockfile exists and `npm install` beforehand.
Application identifiers are initially `com.nextdev.ndcamera`; finalize them
before store registration or signing setup.

## Test the photo handoff

1. Build ND Camera on the Pixel 9 Pro XL.
2. Take a photo with Pixel Camera, open the image, and share it to ND Camera.
3. Test both a cold launch and a share while ND Camera is already open.
4. Edit in Snapseed, export/share one image, and choose ND Camera when offered.
5. Use **Share original** in ND Camera. Choose Snapseed if it is offered; otherwise
   open the source file from Snapseed. Returning to ND is an explicit share/import.

No automatic Snapseed round trip, embedding, or access to its edit history is
implemented. Sharing is based on standard image files, not a private Snapseed API.

## Current boundaries

**Implemented in source, awaiting native/device validation:** picker import,
Android share-in, original preview, and original share-out. Android receiving
uses Expo's experimental share API. Providers that do not expose a readable size
or local file may require a gallery import instead.

**Not implemented:** calibrated iPhone-inspired styles, full-resolution styled
export, HDR/gain-map handling, in-app camera, stock-camera plug-ins, background
processing, batch editing, persistent project history, and gallery-save output.
iOS share-in is intentionally disabled because the upstream experimental
extension's main-app launch behavior is not an appropriate production baseline.

The browser is a local preview target, not proof of Android/iOS compatibility.
JPEG, PNG, WebP, HEIC, and HEIF inputs under 40 MB are allowed by policy; actual
codec support depends on the device. RAW, GIF, and video are rejected.

## Structure

```text
src/App.tsx                        ND Camera interface
src/features/photos/photo-policy.ts  Pure input validation and contracts
src/features/photos/photo-service.ts Picker, safe copy, original sharing
src/features/photos/use-incoming-photo.ts Android raw share lifecycle
src/features/styles/catalog.ts     Explicitly unavailable future styles
vendor/universal-apps/              Unmodified upstream template + MIT license
universal-starter.json              Source commit, hashes, and adaptations
docs/STATUS.md                     Verification evidence and remaining work
```

## Starter provenance

Source: `next-mmo/universal-apps`, commit
`a81fa859ded50f640da42084156db5b6e2affdc9`, file
`packages/cli/source/templates/expo.mjs`.

The unmodified `getExpoTemplateFiles('nd-camera')` function was executed to create
its nine starter files before ND adaptations. The full upstream CLI was not run.
No Universal monorepo or internal `@package/*` runtime is required by the app.
The upstream MIT license is preserved; see `THIRD_PARTY_NOTICES.md`.

The upstream template mixed Expo 57 with React Native 0.81.4. This application
uses the versions from Expo's `sdk-57` blank TypeScript template and
`bundledNativeModules.json`: React 19.2.3 and React Native 0.86.3. It also removes
the undeclared `oxlint` command, the unnecessary direct Metro dependency, and the
obsolete `newArchEnabled` app-config flag.

See [architecture](docs/ARCHITECTURE.md) and [verification status](docs/STATUS.md).
