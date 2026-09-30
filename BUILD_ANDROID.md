# Android Play Store Packaging & Release Guide

This document outlines the step-by-step process for building, packaging, and publishing the **திருக்குறள் (Thirukkural)** mobile app to the **Google Play Store**.

---

## 1. Quick Start Commands

The build script [`scripts/build-android.sh`](file:///Users/ravij/AntiGravityProjects/kurals/scripts/build-android.sh) automates configuration validation, TypeScript typechecking, test execution, and packaging.

| Command | Action | Output Format |
|---|---|---|
| `npm run build:android` | **Production build for Google Play Store** | `.aab` (Android App Bundle) |
| `npm run build:android:prod` | Explicit production build (EAS Cloud) | `.aab` (Android App Bundle) |
| `npm run build:android:preview` | Preview build for internal testing | `.apk` (Direct device install) |
| `npm run build:android:local` | Local offline build with Gradle | `.aab` (via local Android SDK) |
| `npm run submit:android` | Automated submission to Play Console | Direct upload to Play Console track |

---

## 2. Configuration Overview

### Android Package Configuration ([`app.json`](file:///Users/ravij/AntiGravityProjects/kurals/app.json))
```json
{
  "expo": {
    "name": "திருக்குறள் - Thirukkural",
    "slug": "thirukkural",
    "version": "1.0.0",
    "android": {
      "package": "com.nltsravi.kurals",
      "versionCode": 1,
      "adaptiveIcon": {
        "backgroundColor": "#FFF2E5",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      }
    }
  }
}
```
*Note: For subsequent app updates, increment `"versionCode"` (e.g. `2`, `3`) and `"version"` (e.g. `1.0.1`).*

### EAS Build Profiles ([`eas.json`](file:///Users/ravij/AntiGravityProjects/kurals/eas.json))
- **`production`**: Configured with `"buildType": "app-bundle"` as mandated by Google Play Store guidelines since August 2021.
- **`preview`**: Configured with `"buildType": "apk"` and `"distribution": "internal"` for direct sideloading and physical device testing.

---

## 3. Step-by-Step Google Play Store Release Workflow

### Step 1: Pre-Build Quality Assurance
Before packaging, the build script automatically verifies:
1. `app.json` has a valid Android package name (`com.nltsravi.kurals`) and `versionCode`.
2. TypeScript compilation passes with zero errors (`npx tsc --noEmit`).
3. All unit and regression tests pass (`npm test`).

### Step 2: Trigger the Production Build
Run:
```bash
npm run build:android
```
1. If not already logged into Expo, the script will prompt you:
   ```bash
   npx eas-cli@latest login
   ```
2. EAS will ask: `Generate a new Android Keystore? [Y/n]`.
   - Select **Yes** (Recommended). EAS securely generates and stores your keystore in cloud credentials.
3. The build will execute on the EAS cloud infrastructure.
4. When finished, a download link and QR code for the `.aab` file will appear in your terminal and on your [Expo Dashboard](https://expo.dev).

### Step 3: Google Play Console Setup
1. Log in to [Google Play Console](https://play.google.com/console).
2. Click **Create app**:
   - **App name**: `திருக்குறள் - Thirukkural`
   - **Default language**: Tamil (ta-IN) or English (United States)
   - **App or game**: App
   - **Free or paid**: Free
3. Navigate to **Testing -> Internal testing** (or **Production**).
4. Click **Create new release**.
5. Upload the downloaded `.aab` file.
6. Complete the mandatory Store Listing sections:
   - Short description (up to 80 chars): `1330 திருக்குறள், விளக்கவுரைகள், ஆங்கில மொழிபெயர்ப்பு & தேடல் வசதியுடன்.`
   - Full description: Comprehensive overview of Thirukkural features, commentaries (Mu. Va, Solomon Pappaiah, Kalaignar), offline access, collections, and export.
   - Screenshots: Mobile screenshots captured from the app.
   - Privacy Policy & Content Rating questionnaires.
7. Click **Review release** and **Start rollout**.
