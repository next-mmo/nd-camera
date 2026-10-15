# ND Camera development rules

Work in next-mmo/nd-camera. This is an application, not a fork of the Universal Apps monorepo.

- Preserve the upstream source and MIT license in vendor/universal-apps. Record adaptations in universal-starter.json.
- Use local source and relative/@ imports; do not add internal @package/* runtime dependencies.
- Android is the first device validation target. Do not infer stock Pixel Camera parity from a library feature list.
- Never overwrite original photos or label an unfiltered export as styled.
- Do not add uploads, accounts, broad media permissions, background monitoring, or automatic external-editor launches without a product decision.
- Keep platform adapters separate from UI and pure policy logic. Reject remote incoming URIs before resolving/copying.
- Styles need matching preview/full-resolution export, reference-scene validation, and an explicit SDR/HDR policy.
- Run npm run check:starter, npm test, npm run typecheck, and npm run export:android. Report unavailable checks honestly.
- Do not use GitHub Actions, workflows, or remote CI compute. Perform all tests, checks, exports, and native builds locally on the machine to save compute.
- For physical Android device builds, ensure APKs are compiled with ARM64 (`arm64-v8a`) architecture support.
- Keep docs/STATUS.md accurate; source tests are not native/device tests.
