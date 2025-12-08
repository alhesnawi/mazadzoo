# 📱 دليل تكامل خدمة iSend SMS

## نظرة عامة

تم دمج خدمة **iSend** (الخدمة الليبية) لإرسال الرسائل النصية في المشروع.

---

## 🔧 التكوين

### 1. الحصول على API Token من iSend

1. انتقل إلى [iSend.com.ly](https://isend.com.ly)
2. سجل الدخول أو أنشئ حساب جديد
3. انتقل إلى قسم API
4. احصل على API Token الخاص بك

### 2. إعداد المتغيرات البيئية

في ملف `.env`:

```env
# SMS Service (iSend - Libya)
SMS_ENABLED=true
ISEND_API_URL=https://isend.com.ly/api/v3/sms/send
ISEND_API_TOKEN=94|YourActualTokenHere
ISEND_SENDER_ID=MazadZoo
```

**ملاحظات:**
- `SMS_ENABLED`: تفعيل/تعطيل خدمة SMS (`true` أو `false`)
- `ISEND_API_TOKEN`: استبدل `YourActualTokenHere` بالتوكن الفعلي
- `ISEND_SENDER_ID`: اسم المرسل (حتى 11 حرف، يظهر للمستقبل)

---

## 📋 الوظائف المتاحة

### 1. إرسال رمز التحقق (Verification Code)
```javascript
await smsService.sendVerificationCode(phoneNumber, code);
```

**مثال:**
```javascript
await smsService.sendVerificationCode('+218929000835', '123456');
```

**الرسالة:**
```
رمز التحقق الخاص بك في مزاد الحيوانات هو: 123456
الرمز صالح لمدة 10 دقائق.
```

---

### 2. إشعار مزايدة جديدة
```javascript
await smsService.sendBidNotification(phoneNumber, animalName, bidAmount);
```

**مثال:**
```javascript
await smsService.sendBidNotification('+218929000835', 'نسر ذهبي', 5000);
```

**الرسالة:**
```
مزايدة جديدة على نسر ذهبي!
المبلغ: 5000 دينار ليبي
```

---

### 3. إشعار الفوز بالمزاد
```javascript
await smsService.sendAuctionWinNotification(phoneNumber, animalName, finalPrice);
```

**الرسالة:**
```
تهانينا! فزت بمزاد نسر ذهبي
السعر النهائي: 5000 دينار ليبي
يرجى إتمام الدفع خلال 24 ساعة.
```

---

### 4. إشعار انتهاء المزاد (للبائع)
```javascript
await smsService.sendAuctionEndNotification(phoneNumber, animalName, finalPrice, winnerName);
```

**الرسالة:**
```
انتهى مزاد نسر ذهبي
السعر النهائي: 5000 دينار
الفائز: أحمد محمد
```

---

### 5. إشعار الدفع
```javascript
await smsService.sendPaymentNotification(phoneNumber, amount, type);
```

**أنواع الدفع:**
- `deposit`: إيداع
- `withdrawal`: سحب
- أي نص آخر: دفعة

**الرسالة:**
```
تم إيداع 1000 دينار ليبي في محفظتك بنجاح.
```

---

### 6. إرسال رسالة مخصصة
```javascript
await smsService.sendSMS(phoneNumber, message);
```

**مثال:**
```javascript
await smsService.sendSMS('+218929000835', 'مرحباً بك في مزاد الحيوانات!');
```

---

## 📱 تنسيق رقم الهاتف

الخدمة تقبل الأرقام بصيغ مختلفة وتقوم بتنسيقها تلقائياً:

| الإدخال | الناتج |
|---------|--------|
| `+218929000835` | `218929000835` |
| `0929000835` | `218929000835` |
| `929000835` | `218929000835` |
| `218 92 900 0835` | `218929000835` |

---

## 🔍 اختبار الخدمة

### في Development Mode (SMS_ENABLED=false):
```javascript
const result = await smsService.sendVerificationCode('+218929000835', '123456');
console.log(result);
// Output:
// {
//   success: true,
//   message: 'SMS service disabled in development',
//   dev: true
// }
```

الرسائل تظهر في logs فقط ولا ترسل فعلياً.

### في Production Mode (SMS_ENABLED=true):
```javascript
const result = await smsService.sendVerificationCode('+218929000835', '123456');
console.log(result);
// Output (نجاح):
// {
//   success: true,
//   message: 'SMS sent successfully',
//   data: { ... }
// }

// Output (فشل):
// {
//   success: false,
//   message: 'Failed to send SMS',
//   error: 'error message'
// }
```

---

## 🧪 اختبار الاتصال

```javascript
const connectionTest = await smsService.testConnection();
console.log(connectionTest);
```

**النتائج المحتملة:**

1. **الخدمة معطلة:**
```json
{
  "success": true,
  "message": "SMS service is disabled",
  "configured": false
}
```

2. **Token غير موجود:**
```json
{
  "success": false,
  "message": "SMS API Token not configured",
  "configured": false
}
```

3. **جاهز للاستخدام:**
```json
{
  "success": true,
  "message": "SMS service is configured",
  "configured": true,
  "apiUrl": "https://isend.com.ly/api/v3/sms/send",
  "senderId": "MazadZoo"
}
```

---

## 📊 استخدام الخدمة في المشروع

### 1. التسجيل (Register)
✅ **مُدمج بالفعل**

عند تسجيل مستخدم جديد، يتم إرسال رمز التحقق تلقائياً:

```javascript
// في authController.js
await smsService.sendVerificationCode(user.phoneNumber, verificationCode);
```

---

### 2. المزايدات (Bids)
يمكن إضافة إشعارات SMS في `bidController.js`:

```javascript
// بعد وضع مزايدة ناجحة
await smsService.sendBidNotification(
  seller.phoneNumber, 
  animal.name, 
  bidAmount
);
```

---

### 3. انتهاء المزاد (Auction End)
في `auctionScheduler.js`:

```javascript
// إشعار الفائز
await smsService.sendAuctionWinNotification(
  winner.phoneNumber,
  animal.name,
  animal.currentBid
);

// إشعار البائع
await smsService.sendAuctionEndNotification(
  seller.phoneNumber,
  animal.name,
  animal.currentBid,
  winner.username
);
```

---

### 4. الدفع (Payments)
في `paymentController.js`:

```javascript
// بعد دفع ناجح
await smsService.sendPaymentNotification(
  user.phoneNumber,
  amount,
  'deposit'
);
```

---

## 🔒 الأمان

1. **لا تكشف API Token:**
   - احفظ التوكن في `.env` فقط
   - أضف `.env` إلى `.gitignore`
   - لا ترسل التوكن للعميل أبداً

2. **Rate Limiting:**
   - الخدمة لديها حدود على عدد الرسائل
   - استخدم التخزين المؤقت لتجنب الرسائل المكررة

3. **معالجة الأخطاء:**
   - الخدمة لا تفشل التسجيل إذا فشل إرسال SMS
   - جميع الأخطاء تُسجل في logs

---

## 💰 التكلفة

- السعر يعتمد على باقتك في iSend
- تواصل مع iSend للحصول على الأسعار
- مراقبة استهلاك الرسائل عبر لوحة التحكم

---

## 🐛 استكشاف الأخطاء

### المشكلة: "SMS API Token not configured"
**الحل:** تأكد من إضافة `ISEND_API_TOKEN` في `.env`

### المشكلة: "Failed to send SMS"
**الحل:**
1. تحقق من صحة API Token
2. تأكد من رصيد الحساب في iSend
3. راجع logs للحصول على تفاصيل الخطأ

### المشكلة: الرسائل لا تصل
**الحل:**
1. تحقق من صحة رقم الهاتف (218XXXXXXXXX)
2. تأكد من أن `SMS_ENABLED=true`
3. راجع حالة الخدمة في iSend

---

## 📝 ملاحظات مهمة

1. **اللغة العربية:**
   - الخدمة تدعم Unicode (العربية)
   - جميع الرسائل باللغة العربية افتراضياً

2. **طول الرسالة:**
   - رسالة واحدة = 70 حرف (Unicode)
   - الرسائل الطويلة تُقسم تلقائياً

3. **Sender ID:**
   - حتى 11 حرف
   - يجب الموافقة عليه من iSend أولاً
   - افتراضياً: "MazadZoo"

4. **Development Mode:**
   - عند `SMS_ENABLED=false`، الرسائل تظهر في logs فقط
   - مفيد للتطوير والاختبار
   - لا يستهلك رصيد

---

## 🚀 الخطوات التالية

1. ✅ احصل على API Token من iSend
2. ✅ أضف التوكن إلى `.env`
3. ✅ فعّل الخدمة: `SMS_ENABLED=true`
4. ✅ اختبر الخدمة باستخدام `testConnection()`
5. ✅ أضف إشعارات SMS في باقي المشروع (اختياري)

---

## 📞 الدعم الفني

- **iSend Support:** [support@isend.com.ly](mailto:support@isend.com.ly)
- **الوثائق:** [iSend API Docs](https://isend.com.ly/docs)
- **المشروع:** راجع `backend/services/smsService.js`

---

**تم التكامل بنجاح! ✅**

الخدمة الآن جاهزة للاستخدام في Development وProduction.
