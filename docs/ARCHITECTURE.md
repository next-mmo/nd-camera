# ND Camera architecture

ND Camera is a photo companion first, not a plug-in hosted inside Pixel Camera
or Snapseed. Android is the first device target. Shared UI is not a guarantee of
identical capabilities on Android, iOS, and web.

## Current path

System picker or Android image share -> local URI/type/size validation ->
UUID-named app-cache copy -> dimension decoding -> original preview ->
original-file sharing through the OS share sheet.

Read raw Expo Sharing payloads, not resolved web URLs. Accept one local photo
per request. External names are sanitized display labels, never output paths.
Check size before copying and again afterward; delete failed copies. Successful
copies stay temporarily in cache so a receiving app can read them. A retention
policy and persistent history are separate work.

The incoming-share hook refreshes on cold start, foregrounding, and linking.
It serializes shares and avoids clearing a newer payload during an older copy.
Real lifecycle/device tests are still required.

## Styles and editors

Use one edit recipe for preview and full-resolution export. Keep source and
rendered output separate. Reject unavailable profiles rather than exporting an
original while claiming a filter was applied. The next rendering milestone is a
native/GPU engine, bounded-memory preview/export, correct orientation, calibrated
reference scenes, and an explicit SDR contract. HDR/gain-map handling needs its
own validation; a LUT is not Apple's capture pipeline.

Snapseed is optional. Exchange rendered image files, not internal edit history.
There is no automatic return-value contract for a completed edit. Share/import
back explicitly. Choose Snapseed in the share sheet when supported; otherwise
open the source from Snapseed.

## Platform boundaries

- Android: development build; single-image receiver enabled (experimental API).
- iOS: picker/share-out only; experimental share-in extension disabled.
- Web: local import/preview; never upload a photo to manufacture share support.
- No camera, microphone, broad-media, watcher, account, or analytics integration.

## References checked during initialization

- Universal Apps expo.mjs and LICENSE at a81fa859ded50f640da42084156db5b6e2affdc9.
- https://expo.dev/changelog/sdk-57
- https://docs.expo.dev/versions/v57.0.0/sdk/sharing/
- https://github.com/expo/expo/blob/sdk-57/packages/expo/bundledNativeModules.json
- https://github.com/expo/expo/blob/sdk-57/templates/expo-template-blank-typescript/package.json
- Expo SDK 57 Sharing.ts and useIncomingShare.ts implementation.
- https://docs.uniwind.dev/quickstart
