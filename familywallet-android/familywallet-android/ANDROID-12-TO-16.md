# Build APK for Android 12 → Android 16

This project is pre-configured for Android 12 (API 31, minimum) through Android 16 (API 36, target). Phones from 2021 onwards will run this app.

## Why these versions?

| Setting | Value | What it means |
|---|---|---|
| `minSdkVersion` | **31** | Won't install on Android 11 or older |
| `targetSdkVersion` | **36** | Optimized for Android 16 (latest) |
| `compileSdkVersion` | **36** | Built using Android 16 SDK |

If you want to **also support Android 7–11**, change `minSdkVersion` from `31` back to `24` in `android-variables.gradle`.

---

## Build Steps

### One-time setup (only first time)

1. **Install Node.js** — https://nodejs.org (LTS version)
2. **Install Android Studio** — https://developer.android.com/studio
3. **Install SDK 36** — In Android Studio: Tools → SDK Manager → SDK Platforms tab → check **Android 16 (API 36)** → Apply
4. **Set ANDROID_HOME** — see the main README.md for your OS

### Build commands

Open terminal in this folder:

```bash
npm install
npm run build
npx cap add android
```

### After `cap add android` runs, do this ONE-TIME tweak:

Copy the values from `android-variables.gradle` (in this folder) into `android/variables.gradle` (the file Capacitor just created). The file should look exactly like the one I provided.

This is the step that locks the version range to Android 12–16.

### Then continue:

```bash
npx cap sync android
npx cap open android
```

In Android Studio, wait for Gradle sync to finish (1–3 minutes), then:

**Build → Build App Bundle(s) / APK(s) → Build APK(s)**

Your APK appears at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## After code changes

```bash
npm run build
npx cap sync android
```
Then rebuild APK in Android Studio. The version settings stay locked.

---

## Why I can't give you a pre-built APK

Building an APK requires running Android Studio + Gradle on a computer with the Android SDK installed (~8 GB of tools). I'm a chat assistant — I don't have those tools available, and even if I built one, the file would be ~5–10 MB and tied to a debug signing key that wouldn't work for distribution.

**This is a one-way street: you must build the APK on your own computer.** That's how it works for every Android developer in the world, including professionals at Google.

The good news: once you do the setup once, every future build only takes 2 minutes.

---

## Need help?

If a step fails, paste the exact error message and I'll help you fix it. The most common issues are:

1. **"SDK location not found"** → Set `ANDROID_HOME` (see main README)
2. **"Failed to find target with hash string 'android-36'"** → Install Android 16 SDK in SDK Manager
3. **Gradle sync fails** → Tools → SDK Manager → install latest Build Tools

I can debug any error you see — just send the message exactly as it appears.
