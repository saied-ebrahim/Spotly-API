# دليل استخدام Redis في مشروع Spotly API

## 📋 المحتويات
1. [الإعداد الأولي](#الإعداد-الأولي)
2. [الاستخدامات الشائعة](#الاستخدامات-الشائعة)
3. [أمثلة عملية](#أمثلة-عملية)
4. [وظائف متاحة](#وظائف-متاحة)

---

## الإعداد الأولي

### 1. إضافة متغيرات البيئة (.env)
```env
REDIS_URL=redis://localhost:6379
# أو إذا كان لديك Redis على سيرفر آخر:
# REDIS_URL=redis://username:password@host:port
```

### 2. تشغيل Redis محلياً
```bash
# باستخدام Docker
docker run -d -p 6379:6379 redis:latest

# أو باستخدام Redis المثبت محلياً
redis-server
```

---

## الاستخدامات الشائعة

### 1. التخزين المؤقت (Caching) ✅
تم تطبيقه في `event-service.js` كمثال:

```javascript
import { getCache, setCache, deleteCacheByPattern } from '../utils/redis-client.js';

// الحصول من الـ cache أولاً
const cacheKey = `events:${page}:${limit}`;
const cachedData = await getCache(cacheKey);
if (cachedData) {
  return cachedData; // إرجاع البيانات من الـ cache
}

// إذا لم تكن موجودة، جلب من قاعدة البيانات
const events = await eventModel.find(query);

// حفظ في الـ cache لمدة 5 دقائق
await setCache(cacheKey, events, 300);

// عند التحديث أو الحذف، مسح الـ cache
await deleteCacheByPattern('events:*');
```

### 2. حظر التوكنات (Token Blacklisting) ✅
تم تطبيقه في `auth-middleware.js` و `auth-service.js`:

```javascript
import { blacklistToken, isTokenBlacklisted } from '../utils/redis-client.js';

// في middleware - التحقق من التوكن المحظور
const isBlacklisted = await isTokenBlacklisted(token);
if (isBlacklisted) {
  return next(new AppError('Token invalidated', 401));
}

// عند تسجيل الخروج - حظر التوكن
await blacklistToken(accessToken, 604800); // 7 أيام
```

### 3. Rate Limiting (الحد من الطلبات)
```javascript
import { checkRateLimit } from '../utils/redis-client.js';

// في middleware
const rateLimit = await checkRateLimit(
  req.ip,           // أو req.user.id
  100,              // 100 طلب
  60                // في 60 ثانية
);

if (!rateLimit.allowed) {
  return res.status(429).json({
    message: 'Too many requests',
    resetIn: rateLimit.resetIn
  });
}
```

### 4. العدادات (Counters)
```javascript
import { incrementCounter, getCounter } from '../utils/redis-client.js';

// زيادة عداد
await incrementCounter('event:views:123', 1);

// الحصول على قيمة العداد
const views = await getCounter('event:views:123');
```

---

## أمثلة عملية

### مثال 1: تخزين مؤقت لبيانات المستخدم
```javascript
// في user-service.js
import { getCache, setCache, deleteCache } from '../utils/redis-client.js';

export const getUserById = async (userId) => {
  const cacheKey = `user:${userId}`;
  
  // محاولة الحصول من الـ cache
  const cachedUser = await getCache(cacheKey);
  if (cachedUser) {
    return cachedUser;
  }
  
  // جلب من قاعدة البيانات
  const user = await userModel.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  
  // حفظ في الـ cache لمدة ساعة
  await setCache(cacheKey, user, 3600);
  
  return user;
};

// عند تحديث المستخدم
export const updateUser = async (userId, updateData) => {
  const user = await userModel.findByIdAndUpdate(userId, updateData);
  
  // مسح الـ cache
  await deleteCache(`user:${userId}`);
  
  return user;
};
```

### مثال 2: Rate Limiting Middleware
```javascript
// في middlewares/rate-limit-middleware.js
import expressAsyncHandler from 'express-async-handler';
import { checkRateLimit } from '../utils/redis-client.js';
import AppError from '../utils/AppError.js';

export const rateLimitMiddleware = (maxRequests = 100, windowInSeconds = 60) => {
  return expressAsyncHandler(async (req, res, next) => {
    const identifier = req.user?.id || req.ip;
    const rateLimit = await checkRateLimit(identifier, maxRequests, windowInSeconds);
    
    // إضافة معلومات الـ rate limit في الـ headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimit.resetIn * 1000).toISOString());
    
    if (!rateLimit.allowed) {
      throw new AppError(
        `Too many requests. Please try again in ${rateLimit.resetIn} seconds.`,
        429
      );
    }
    
    next();
  });
};

// الاستخدام في routes
router.get('/events', rateLimitMiddleware(50, 60), getAllEventsController);
```

### مثال 3: تخزين مؤقت للنتائج المعقدة
```javascript
// تخزين نتائج البحث المعقدة
export const searchEvents = async (searchQuery) => {
  const cacheKey = `search:${JSON.stringify(searchQuery)}`;
  
  const cached = await getCache(cacheKey);
  if (cached) return cached;
  
  // عملية بحث معقدة
  const results = await performComplexSearch(searchQuery);
  
  // حفظ لمدة 10 دقائق
  await setCache(cacheKey, results, 600);
  
  return results;
};
```

---

## وظائف متاحة

جميع الوظائف موجودة في `src/utils/redis-client.js`:

### التخزين المؤقت
- `setCache(key, value, expirationInSeconds)` - حفظ بيانات في الـ cache
- `getCache(key)` - الحصول على بيانات من الـ cache
- `deleteCache(key)` - حذف مفتاح واحد
- `deleteCacheByPattern(pattern)` - حذف عدة مفاتيح بنمط معين (مثل `events:*`)
- `cacheExists(key)` - التحقق من وجود مفتاح
- `setExpiration(key, expirationInSeconds)` - تحديث وقت انتهاء المفتاح

### حظر التوكنات
- `blacklistToken(token, expirationInSeconds)` - حظر توكن
- `isTokenBlacklisted(token)` - التحقق من حظر التوكن

### Rate Limiting
- `checkRateLimit(identifier, maxRequests, windowInSeconds)` - فحص الحد من الطلبات

### العدادات
- `incrementCounter(key, increment)` - زيادة عداد
- `getCounter(key)` - الحصول على قيمة عداد

---

## نصائح مهمة

1. **استخدم مفاتيح واضحة**: استخدم نمط واضح للمفاتيح مثل `user:123` أو `events:page:1`

2. **حدد وقت انتهاء مناسب**: 
   - بيانات نادراً ما تتغير: ساعات أو أيام
   - بيانات تتغير بشكل متكرر: دقائق
   - بيانات حساسة: ثواني

3. **امسح الـ cache عند التحديث**: دائماً امسح الـ cache عند إنشاء/تحديث/حذف البيانات

4. **معالجة الأخطاء**: جميع الوظائف لا ترمي أخطاء - إذا فشل Redis، التطبيق يستمر في العمل

5. **استخدم Patterns للحذف**: استخدم `deleteCacheByPattern('events:*')` لمسح كل الـ cache المتعلق

---

## استكشاف الأخطاء

### Redis غير متصل
```bash
# التحقق من حالة Redis
redis-cli ping
# يجب أن يرد بـ PONG

# التحقق من الاتصال
redis-cli -h localhost -p 6379
```

### مسح كل الـ cache (للاختبار فقط)
```bash
redis-cli FLUSHALL
```

---

## English Version

# Redis Usage Guide for Spotly API

## Setup

1. Add to `.env`:
```env
REDIS_URL=redis://localhost:6379
```

2. Run Redis:
```bash
docker run -d -p 6379:6379 redis:latest
```

## Common Use Cases

### 1. Caching ✅ (Implemented in event-service.js)
```javascript
import { getCache, setCache, deleteCacheByPattern } from '../utils/redis-client.js';

const cached = await getCache(key);
if (cached) return cached;

const data = await fetchFromDB();
await setCache(key, data, 300); // 5 minutes
```

### 2. Token Blacklisting ✅ (Implemented in auth-middleware.js)
```javascript
import { blacklistToken, isTokenBlacklisted } from '../utils/redis-client.js';

// Check if blacklisted
if (await isTokenBlacklisted(token)) {
  throw new AppError('Token invalidated', 401);
}

// Blacklist on logout
await blacklistToken(token, 604800); // 7 days
```

### 3. Rate Limiting
```javascript
import { checkRateLimit } from '../utils/redis-client.js';

const rateLimit = await checkRateLimit(req.ip, 100, 60);
if (!rateLimit.allowed) {
  return res.status(429).json({ message: 'Too many requests' });
}
```

## Available Functions

All functions are in `src/utils/redis-client.js`:
- `setCache(key, value, expiration)`
- `getCache(key)`
- `deleteCache(key)`
- `deleteCacheByPattern(pattern)`
- `blacklistToken(token, expiration)`
- `isTokenBlacklisted(token)`
- `checkRateLimit(identifier, maxRequests, windowInSeconds)`
- `incrementCounter(key, increment)`
- `getCounter(key)`

