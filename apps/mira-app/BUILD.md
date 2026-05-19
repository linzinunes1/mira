# Building Mira for TestFlight + Play Store

## Prerequisites

1. **Expo account** — create one at https://expo.dev if you don't have one
2. **EAS CLI** — `npm install -g eas-cli`
3. **Apple Developer account** — for TestFlight
4. **Google Play Console** — for Android internal testing

## Quick start

```bash
# 1. Authenticate
export EXPO_TOKEN=your_expo_personal_access_token  # from https://expo.dev/accounts/[you]/settings/access-tokens
# OR just run:
eas login

# 2. Link this app to your EAS project (first time only)
cd apps/mira-app
eas project:init

# 3. Build both platforms
eas build --platform all --profile development

# 4. Submit iOS to TestFlight
eas submit --platform ios --latest

# 5. Submit Android to Play internal testing
eas submit --platform android --latest
```

## Step-by-step (first time)

### iOS

1. Run `eas build --platform ios --profile development`
2. EAS will ask for Apple credentials — use your Apple ID
3. It will create provisioning profiles and certificates automatically
4. After build completes (10-15 min), it appears at https://expo.dev
5. Run `eas submit --platform ios` to push to TestFlight
6. Go to App Store Connect → TestFlight → add internal testers

### Android

1. Run `eas build --platform android --profile development`
2. EAS creates a keystore automatically (save it!)
3. Download the `.apk` or `.aab` from expo.dev
4. Run `eas submit --platform android` — needs Google Play service account JSON
5. Or manually upload the `.aab` to Play Console → Internal testing

## Getting your EXPO_TOKEN

1. Go to https://expo.dev/accounts/[your-username]/settings/access-tokens
2. Click "Create Token"
3. Name it "mira-build" and copy the value
4. Set as env var: `export EXPO_TOKEN=expo_xxxxx`

## API URL

The app is pre-configured to hit `https://mira-api-omega.vercel.app` for all build profiles.
The `/api/health` endpoint returns `{ "status": "ok" }` to verify the backend is up.
