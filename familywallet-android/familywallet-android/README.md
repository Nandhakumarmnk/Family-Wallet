# FamilyWallet — Build Your Android APK

A complete React + Capacitor project that becomes a real installable Android app. Follow this guide step by step. Total time: about 1–2 hours the first time, then ~5 minutes for any future code changes.

---

## ⚙️ Tools You Need to Install (one-time only)

### 1. Node.js (for the React build tools)

Download from **https://nodejs.org** — choose the **LTS** version (the green button on the left). Install with default settings.

To verify, open Command Prompt (Windows) or Terminal (Mac/Linux) and type:
```
node --version
npm --version
```
Both should show a version number.

### 2. Android Studio (for building the APK)

Download from **https://developer.android.com/studio** — install with default settings. On first launch it will download the Android SDK (~3 GB) — let it finish. This includes Java, so you don't need to install that separately.

### 3. Set the ANDROID_HOME environment variable

This tells command-line tools where Android SDK is located.

**On Windows:**
1. Press Windows key → search **"Environment Variables"** → click *Edit the system environment variables*
2. Click **Environment Variables** button at the bottom
3. Under *System variables*, click **New** and add:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk` (replace YOUR_USERNAME)
4. Find `Path` in the list, click Edit → New → add: `%ANDROID_HOME%\platform-tools`
5. Click OK on all windows. **Restart Command Prompt** for changes to take effect.

**On Mac:** Add these lines to `~/.zshrc` (or `~/.bash_profile`):
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```
Then run `source ~/.zshrc` and restart Terminal.

**On Linux:** Add these to `~/.bashrc`:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```
Then run `source ~/.bashrc` and restart Terminal.

---

## 📦 Build the Android App

Open Command Prompt / Terminal and `cd` into this `familywallet-android` folder. Then run these commands one by one.

### Step 1 — Install all packages
```
npm install
```
This downloads React, Capacitor, and dependencies. Takes 2–5 minutes. You'll see a progress bar.

### Step 2 — Build the React web app
```
npm run build
```
This creates an optimized `dist/` folder. Takes about 10 seconds. You'll see "✓ built in Xms" when done.

### Step 3 — Add the Android platform (FIRST TIME ONLY)
```
npx cap add android
```
This creates an `android/` folder containing the native Android project. Takes 1–2 minutes.

### Step 4 — Sync your code into the Android project
```
npx cap sync android
```
This copies your built React app into the Android project. Takes a few seconds.

### Step 5 — Open it in Android Studio
```
npx cap open android
```
Android Studio will launch. **Wait 1–3 minutes** for "Gradle sync" to finish (look at the bottom status bar). The first time it may download more SDK components — let it.

### Step 6 — Build the APK file
In Android Studio's top menu:

**Build → Build App Bundle(s) / APK(s) → Build APK(s)**

Wait for the build (1–3 minutes). When done, a popup appears at the bottom right saying *"APK(s) generated successfully"*. Click **"locate"** to find it.

Your APK file is at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📱 Install on Your Android Phone

### Method 1 — USB cable
1. On your phone: Settings → About → tap *Build Number* 7 times to enable Developer Mode
2. Settings → Developer Options → enable **USB Debugging**
3. Connect phone to computer via USB
4. In Android Studio, click the green **▶ Run** button at the top — it installs and launches automatically

### Method 2 — Send the APK file directly
1. Email / WhatsApp / Google Drive the `app-debug.apk` file to yourself
2. On your phone, open the file
3. When asked, allow **"Install from unknown sources"**
4. Tap **Install**, then **Open**

---

## 🔄 After You Change the Code

Whenever you edit files in `src/`:
```
npm run build
npx cap sync android
```
Then in Android Studio: **Build → Build APK(s)** again.

That's all — no need to repeat steps 1, 3, or 5.

---

## 🎁 Going Further

### Make a Release APK (for Play Store or stable distribution)
The "debug" APK above works for personal use, but for distribution you need a *signed release APK*. Follow Capacitor's official guide:
**https://capacitorjs.com/docs/android/deploying-to-google-play**

Quick summary:
1. Create a keystore: `keytool -genkey -v -keystore release-key.keystore -alias familywallet -keyalg RSA -keysize 2048 -validity 10000`
2. Configure `android/app/build.gradle` with the keystore details
3. In Android Studio: Build → Generate Signed Bundle / APK → APK
4. Upload to Google Play Console (requires $25 one-time developer account)

### Customize the App Icon
Replace icons in `android/app/src/main/res/mipmap-*/` folders — or use Android Studio's *Image Asset Studio* (right-click `res` folder → New → Image Asset).

### Customize the App Name on Phone
Edit `android/app/src/main/res/values/strings.xml` — change the `app_name` value.

---

## 🐛 Troubleshooting

| Problem | Fix |
|---|---|
| `'npm' is not recognized` / `command not found` | Node.js not installed properly. Reinstall from nodejs.org. Restart terminal. |
| `'npx cap' fails` | Run `npm install` again — Capacitor CLI is missing. |
| Gradle sync error in Android Studio | **File → Invalidate Caches → Invalidate and Restart**. Or **Tools → SDK Manager** → install latest SDK Platform. |
| APK installs but shows blank white screen | You skipped `npm run build` before `npx cap sync`. Run them again. |
| `ANDROID_HOME is not set` | Re-do the environment variable step above. Restart your terminal. |
| Mailto links don't open | Make sure a default email app is set on the phone (Gmail, Outlook, etc.). |
| Build fails with "SDK location not found" | In Android Studio: File → Project Structure → SDK Location → set it manually. |

---

## 📁 Project Structure

```
familywallet-android/
├── src/
│   ├── App.jsx              ← All app logic & UI (edit this)
│   ├── main.jsx             ← React entry point
│   └── index.css            ← Global styles
├── index.html               ← HTML shell
├── package.json             ← Dependencies & scripts
├── vite.config.js           ← Build configuration
├── capacitor.config.json    ← Capacitor (native) configuration
├── README.md                ← This file
├── dist/                    ← Built web app (created by `npm run build`)
└── android/                 ← Native Android project (created by `npx cap add android`)
```

---

## 🔐 What the App Includes

- **Login & Registration** with full name and email
- **Family accounts** — create one or join with a 6-character code
- **Personal & Family wallet** tracking (income & expense)
- **Transaction categories** with icons (Food, Salary, Transport, etc.)
- **Daily backup banner** that prompts you to email yourself a CSV every 24h
- **Per-member status emails** when family transactions are added
- **New device approval** with email OTP verification
- **Trusted device management** in Profile settings
- **Data restore** — sign in on a verified device, all your data is automatically there
- **Export** — email backup or download CSV

All data is stored locally on the device using `localStorage` inside Capacitor's WebView (persistent across app launches). Email features use the device's default email app via `mailto:` links.

---

## 💡 Tips

- The first APK build is slow because Gradle has to download dependencies. Subsequent builds are fast.
- Keep `android/` folder in `.gitignore` if using version control — it's regenerated from your React code.
- For the best look, test on a real Android phone, not just an emulator.
- The included icon is the default Capacitor icon — replace it before publishing!

Good luck with your app! 🚀
