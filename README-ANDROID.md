# স্মৃতি সংরক্ষণ — Android APK Project

## App icon
`resources/icon.png`-এ আপনার নির্বাচিত **স্মৃতি সংরক্ষণ** আইকনটি সেট করা আছে।

Android launcher icon generate করতে:
1. `npm install`
2. `npm run icons`
3. `npx cap add android` (যদি android folder আগে তৈরি না থাকে)
4. `npx cap sync android`
5. `npx cap open android`
6. Android Studio → **Build → Generate Signed Bundle / APK** অথবা **Build APK(s)**

## App identity
- App name: **স্মৃতি সংরক্ষণ**
- Package ID: `com.smritisangrokkhon.profiles`

## Supabase
`www/config.js`-এ Supabase URL এবং publishable/anon key বসান।
Secret/service_role key কখনো APK-তে রাখবেন না।

## Note
এই ZIP-এ icon source এবং Capacitor icon-generation setup যুক্ত করা হয়েছে। Android platform folder তৈরি করার জন্য `npx cap add android` চালাতে হবে।
