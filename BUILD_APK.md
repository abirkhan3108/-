# Android APK Build

## Requirements
- Android Studio
- Node.js + npm
- Internet connection for the first dependency download

## 1) Install dependencies
Open Terminal/PowerShell in this project folder and run:

npm install
npx cap add android
npx cap sync android

## 2) Open Android Studio
Run:

npx cap open android

## 3) Build APK
In Android Studio:
Build → Build Bundle(s) / APK(s) → Build APK(s)

The debug APK will normally be under:
android/app/build/outputs/apk/debug/

## 4) Before publishing
- Put the real Supabase URL and publishable/anon key in `config.js`.
- Enable Supabase Auth and secure RLS/Storage policies.
- Change the app icon/name if desired.
- For Play Store, create a signed release build.

This project is prepared as a Capacitor Android wrapper around the current web app.
