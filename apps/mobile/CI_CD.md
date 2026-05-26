# Mobile CI/CD

This app uses Expo Application Services (EAS) for over-the-air updates, cloud builds, and store submission.

## What Is Configured

- `.github/workflows/mobile-ci.yml`
  - Runs on pull requests and pushes to `main` when mobile-related files change.
  - Installs dependencies with pnpm.
  - Runs `pnpm --filter @yeu-pet/mobile lint`.

- `.github/workflows/mobile-eas.yml`
  - On pushes to `main`, publishes an EAS Update to the `preview` branch (linked to the `preview` channel).
  - Can be run manually from GitHub Actions for:
    - `update-preview`
    - `update-development`
    - `update-production`
    - `build-preview`
    - `build-development`
    - `build-production`
    - `submit-production`

## Required GitHub Secret

Create this repository secret:

- `EXPO_TOKEN`

To create it:

1. Open https://expo.dev/settings/access-tokens.
2. Create a personal access token for the Expo account that owns `thanhwoe/pet-care`.
3. Open your GitHub repository settings.
4. Go to **Secrets and variables** -> **Actions**.
5. Add a repository secret named `EXPO_TOKEN`.

## Expo/EAS Setup Checklist

The project is already linked to EAS in `app.json`:

- `owner`: `thanhwoe`
- `extra.eas.projectId`: `ece16c3d-7c90-4b45-8744-cdcc47ef5d95`
- `updates.url`: configured
- `runtimeVersion`: `appVersion`

Before relying on CI/CD, run these locally once:

```sh
cd apps/mobile
pnpm eas whoami
pnpm eas build --platform android --profile preview
pnpm eas build --platform ios --profile preview
```

EAS can manage Android keystores and iOS signing credentials for you. For iOS, you need access to an Apple Developer account. For Android store submission, Google Play requires the app to be created in Play Console and uploaded manually at least once before API-based submissions work.

## Release Flow

1. Open a pull request.
2. GitHub runs Mobile CI.
3. Merge to `main`.
4. GitHub publishes an OTA update to the EAS `preview` branch.
5. When native code, permissions, app config, SDK version, or dependencies change, run **Mobile EAS Deploy** manually with `build-preview` or `build-production`.
6. When ready to upload the latest production binary, run **Mobile EAS Deploy** manually with `submit-production`.

## EAS Update: channels vs branches

- **Branch** is where update bundles are published (`eas update --branch preview`).
- **Channel** is what native builds listen to (`channel: "preview"` in `eas.json` build profiles).
- A channel must point at a branch, or `--channel` updates fail with “Channel has no branches associated with it.”

CI publishes to a **branch**, then links the same-named channel with `eas channel:edit`. The app config sets `platforms: ["ios", "android"]` so EAS Update does not bundle web (avoids `@expo/metro-runtime` export errors in CI).

One-time local fix if needed:

```sh
cd apps/mobile
eas channel:edit preview --branch preview
```

## Notes

- OTA updates only reach builds with a compatible runtime version. This project uses `runtimeVersion: "appVersion"`, so changing `expo.version` requires a new binary build before users can receive updates for that version.
- The production build profile has `autoIncrement: true`, so EAS increments native build numbers for production binaries.
- Store submission requires additional Apple App Store Connect and Google Play Console credentials configured in EAS.
