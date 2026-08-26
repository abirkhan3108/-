# স্মৃতি সংরক্ষণ — Profile Search App

নীল-সাদা Profile Search App-এর starter version।

## চালু করার ধাপ
1. Supabase-এ একটি project তৈরি করুন।
2. `supabase_schema.sql` চালান।
3. `config.js`-এ Supabase URL এবং publishable/anon key বসান।
4. `index.html` খুলে Web App চালান।
5. `admin.html` থেকে profile যোগ করা যাবে।

## গুরুত্বপূর্ণ
Production-এ `admin.html` ব্যবহারের আগে Supabase Auth এবং কঠোর RLS policy চালু করুন। Secret/service_role key কখনো browser-এর `config.js`-এ রাখবেন না।

## ফ্রি Android APK
এই Web App পরে Capacitor/Android Studio দিয়ে APK-তে প্যাক করা যাবে।


## Profile Photo Upload
Admin page থেকে ফোন/কম্পিউটার থেকে JPG/PNG/WebP ছবি নির্বাচন করা যাবে। ছবি Supabase Storage-এর `profile-photos` bucket-এ যাবে এবং Profile-এর ডান পাশে দেখাবে। সর্বোচ্চ 5 MB রাখা হয়েছে।

**নিরাপত্তা:** এই starter version-এ upload policy public রাখা হয়েছে যাতে প্রথমে সহজে পরীক্ষা করা যায়। Production-এ Admin Login + RLS/Storage policies অবশ্যই admin-only করতে হবে।
