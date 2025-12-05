# صلاحيات الأدمين - Admin Access Documentation

## نظرة عامة
الأدمين لديه وصول كامل لجميع العمليات في جميع الـ routes: رؤية، تعديل، ومراقبة.

## Routes والصلاحيات

### 1. Authentication Routes (`/api/v1/auth`)
- ✅ **GET `/users`** - رؤية جميع المستخدمين (Admin only)
- ✅ **GET `/me`** - رؤية الملف الشخصي
- ✅ جميع عمليات التسجيل/تسجيل الدخول متاحة

### 2. Events Routes (`/api/v1/events`)
- ✅ **GET `/`** - رؤية جميع الأحداث (Public)
- ✅ **GET `/:id`** - رؤية حدث محدد (Public)
- ✅ **POST `/`** - إنشاء حدث جديد
- ✅ **PATCH `/:id`** - تعديل أي حدث (Admin bypass organizer check)
- ✅ **DELETE `/:id`** - حذف أي حدث (Admin bypass organizer check)

### 3. Categories Routes (`/api/v1/categories`)
- ✅ **GET `/`** - رؤية جميع الفئات (Public)
- ✅ **GET `/:id`** - رؤية فئة محددة (Public)
- ✅ **POST `/`** - إنشاء فئة جديدة
- ✅ **PATCH `/:id`** - تعديل أي فئة
- ✅ **DELETE `/:id`** - حذف أي فئة

### 4. Tags Routes (`/api/v1/tags`)
- ✅ **GET `/`** - رؤية جميع العلامات (Public)
- ✅ **GET `/:id`** - رؤية علامة محددة (Public)
- ✅ **POST `/`** - إنشاء علامة جديدة
- ✅ **PATCH `/:id`** - تعديل أي علامة
- ✅ **DELETE `/:id`** - حذف أي علامة

### 5. Favourites Routes (`/api/v1/favourite`)
- ✅ **GET `/`** - رؤية جميع المفضلات (Admin sees all, users see own)
- ✅ **POST `/`** - إضافة إلى المفضلة
- ✅ **DELETE `/`** - حذف جميع المفضلات
- ✅ **DELETE `/:id`** - حذف مفضلة محددة

### 6. Orders Routes (`/api/v1/orders`)
- ✅ **GET `/`** - رؤية جميع الطلبات (Admin only)
- ✅ **GET `/:id`** - رؤية طلب محدد (Admin only)

### 7. Organizers Routes (`/api/v1/organizers`)
- ✅ **GET `/`** - رؤية جميع المنظمين (Public)
- ✅ **GET `/user/:userId`** - رؤية منظمات مستخدم محدد (Public)
- ✅ **GET `/event/:eventId`** - رؤية منظمي حدث محدد (Public)

### 8. Checkout Routes (`/api/v1/checkout`)
- ✅ **POST `/`** - إنشاء جلسة checkout
- ✅ **GET `/complete`** - إكمال الطلب
- ✅ **GET `/cancel`** - إلغاء الطلب

### 9. Upload Routes (`/api/v1/upload`)
- ✅ **POST `/`** - رفع ملف
- ✅ **GET `/file/:key`** - الحصول على رابط الملف

### 10. Password Routes (`/api/v1/password`)
- ✅ **POST `/forget-password`** - نسيان كلمة المرور
- ✅ **GET `/reset-password-link/:userID/:token`** - رابط إعادة تعيين
- ✅ **POST `/reset-password/:userID/:token`** - إعادة تعيين كلمة المرور

## Middleware Modifications

### `authorize-event-middleware.js`
- تم التعديل للسماح للأدمين بتجاوز فحص المنظم
- الأدمين يمكنه تعديل/حذف أي حدث

### `authorize-admin-middleware.js`
- تم إضافة تسجيل العمليات للمراقبة
- تم إضافة `req.isAdmin` flag للاستخدام في controllers

### `favourite-service.js`
- تم التعديل للسماح للأدمين برؤية جميع المفضلات

## Utility Functions

### `utils/admin-utils.js`
- `isAdmin(user)` - التحقق من دور الأدمين
- `isAdminRequest(req)` - التحقق من الطلب
- `hasAdminAccess(req)` - التحقق من الصلاحيات

## Monitoring

جميع عمليات الأدمين يتم تسجيلها في وضع التطوير (development mode):
```
[ADMIN ACTION] METHOD /route - Admin: email (id)
```

## ملاحظات

- الأدمين لديه وصول كامل لجميع العمليات
- لا توجد قيود على الملكية للأدمين
- جميع العمليات قابلة للمراقبة والتسجيل

