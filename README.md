# Coverly Admin MVP

## تشغيل
1) افتح المشروع
2) نفّذ:
   - npm install
   - npm run dev

## الدخول
- http://localhost:5173/
- الداش: http://localhost:5173/admin

## ملاحظات
- Orders شغالين بـ Mock LocalStorage
- علشان تصفّر الداتا: امسح LocalStorage key: coverly_admin_orders
- بعد ما نخلص، هنبدّل src/admin/services/api.js من mock إلى supabaseApi بدون تغيير UI.
