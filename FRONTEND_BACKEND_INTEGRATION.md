# ربط الـ Frontend بالـ Backend

## نظرة عامة

تم ربط جميع أجزاء التطبيق (Frontend, Admin Dashboard, Mobile App) بالـ Backend بنجاح. هذا الملف يوضح كيفية عمل الربط والإعدادات المطلوبة.

## البنية العامة

```
rare_animals_auction/
├── backend/                 # خادم Node.js + Express
├── auction-frontend/        # تطبيق React الرئيسي
├── admin-dashboard/         # لوحة الإدارة
└── mobile-app/             # تطبيق React Native
```

## إعدادات البيئة

### 1. Backend Environment

تم إنشاء ملف `backend/config/environment.js` يحتوي على جميع إعدادات البيئة:

```javascript
const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/rare_animals_auction',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  // ... المزيد من الإعدادات
};
```

### 2. Frontend Environment

تم إنشاء ملف `auction-frontend/src/config/environment.js`:

```javascript
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  // ... المزيد من الإعدادات
};
```

### 3. Admin Dashboard Environment

تم إنشاء ملف `admin-dashboard/src/config/environment.js`:

```javascript
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // ... المزيد من الإعدادات
};
```

### 4. Mobile App Environment

تم إنشاء ملف `mobile-app/src/config/environment.js`:

```javascript
export const config = {
  API_BASE_URL: 'http://localhost:5000/api',
  // ... المزيد من الإعدادات
};
```

## API Integration

### 1. Frontend API Service

تم تحديث `auction-frontend/src/services/api.js` لاستخدام التكوين الجديد:

```javascript
import config from '../config/environment.js';

const API_BASE_URL = config.API_BASE_URL;
const SOCKET_URL = config.SOCKET_URL;
```

### 2. Admin Dashboard API Service

تم تحديث `admin-dashboard/src/services/api.js`:

```javascript
import config from '../config/environment.js';

const API_BASE_URL = config.API_BASE_URL;
```

### 3. Mobile App API Service

تم تحديث `mobile-app/src/services/api.js`:

```javascript
import config from '../config/environment.js';

const API_BASE_URL = config.API_BASE_URL;
```

## Socket.IO Integration

### 1. Backend Socket Configuration

تم تحديث `backend/utils/socket.js` لاستخدام التكوين الجديد:

```javascript
const config = require('../config/environment');

io = socketIo(server, {
  cors: {
    origin: config.SOCKET_CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

### 2. Frontend Socket Service

تم تحديث `auction-frontend/src/services/api.js`:

```javascript
this.socket = io(config.SOCKET_URL, {
  auth: { token },
  transports: ['websocket', 'polling']
});
```

## Vite Configuration

### 1. Frontend Vite Config

تم تحديث `auction-frontend/vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  }
});
```

### 2. Admin Dashboard Vite Config

تم تحديث `admin-dashboard/vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 5174,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
```

## Middleware Updates

### 1. Authentication Middleware

تم تحديث `backend/middleware/auth.js`:

```javascript
const config = require('../config/environment');

const decoded = jwt.verify(token, config.JWT_SECRET);
```

### 2. Upload Middleware

تم تحديث `backend/middleware/upload.js`:

```javascript
const config = require('../config/environment');

const upload = multer({
  limits: {
    fileSize: config.MAX_FILE_SIZE,
    files: 10
  }
});
```

## Database Configuration

تم تحديث `backend/utils/database.js`:

```javascript
const config = require('../config/environment');

const conn = await mongoose.connect(config.MONGODB_URI);
```

## Context Integration

### 1. Auth Context

تم تحديث `auction-frontend/src/contexts/AuthContext.jsx` لاستخدام الـ API service المحدث.

### 2. Auction Context

تم تحديث `auction-frontend/src/contexts/AuctionContext.jsx` لاستخدام الـ Socket.IO service المحدث.

## Scripts Configuration

### 1. Backend Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "setup": "npm install && mkdir -p uploads/images uploads/videos uploads/certificates uploads/profiles",
    "clean": "rm -rf uploads/* && mkdir -p uploads/images uploads/videos uploads/certificates uploads/profiles"
  }
}
```

### 2. Frontend Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "setup": "npm install",
    "start": "vite --host"
  }
}
```

### 3. Admin Dashboard Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "setup": "npm install",
    "start": "vite --host"
  }
}
```

### 4. Mobile App Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "setup": "npm install",
    "dev": "expo start --dev-client"
  }
}
```

## كيفية التشغيل

### 1. تثبيت التبعيات

```bash
# تثبيت جميع التبعيات
npm run setup

# أو تثبيت كل جزء على حدة
cd backend && npm install
cd ../auction-frontend && npm install
cd ../admin-dashboard && npm install
cd ../mobile-app && npm install
```

### 2. تشغيل التطبيق

```bash
# تشغيل جميع الأجزاء معاً
npm run dev:all

# أو تشغيل كل جزء على حدة
npm run dev:backend      # Backend على المنفذ 5000
npm run dev:frontend     # Frontend على المنفذ 5173
npm run dev:admin        # Admin Dashboard على المنفذ 5174
npm run dev:mobile       # Mobile App
```

### 3. إعداد قاعدة البيانات

```bash
# تأكد من تشغيل MongoDB
mongod

# أو استخدم MongoDB Atlas
# قم بتحديث MONGODB_URI في ملف .env
```

## نقاط النهاية المتاحة

### Backend API Endpoints

- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/profile` - جلب بيانات المستخدم
- `PUT /api/auth/profile` - تحديث الملف الشخصي
- `GET /api/animals` - جلب قائمة الحيوانات
- `POST /api/animals` - إضافة حيوان جديد
- `GET /api/animals/:id` - جلب حيوان محدد
- `POST /api/bids` - وضع مزايدة
- `GET /api/bids/animal/:id` - جلب مزايدات حيوان
- `GET /api/payments/wallet` - جلب رصيد المحفظة
- `POST /api/payments/add-funds` - إضافة أموال

### Socket.IO Events

- `join-auction` - الانضمام لمزاد
- `leave-auction` - مغادرة مزاد
- `place-bid` - وضع مزايدة
- `new-bid` - مزايدة جديدة
- `auction-time-update` - تحديث وقت المزاد
- `auction-ended` - انتهاء المزاد
- `outbid-notification` - إشعار بالمزايدة

## الأمان

### 1. CORS Configuration

تم تكوين CORS بشكل صحيح للسماح بالاتصال بين الـ frontend والـ backend:

```javascript
app.use(cors({
  origin: config.SOCKET_CORS_ORIGIN,
  credentials: true
}));
```

### 2. JWT Authentication

تم تكوين JWT للتوثيق:

```javascript
const token = jwt.sign({ id }, config.JWT_SECRET, {
  expiresIn: config.JWT_EXPIRES_IN
});
```

### 3. Rate Limiting

تم تكوين Rate Limiting لحماية الـ API:

```javascript
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS
});
```

## استكشاف الأخطاء

### 1. مشاكل الاتصال

- تأكد من تشغيل الـ backend على المنفذ 5000
- تأكد من صحة إعدادات CORS
- تحقق من إعدادات الـ proxy في Vite

### 2. مشاكل التوثيق

- تأكد من صحة JWT_SECRET
- تحقق من انتهاء صلاحية الـ token
- تأكد من إرسال الـ token في الـ headers

### 3. مشاكل Socket.IO

- تأكد من تشغيل Socket.IO server
- تحقق من إعدادات CORS للـ Socket.IO
- تأكد من صحة الـ token في Socket.IO

## الخلاصة

تم ربط جميع أجزاء التطبيق بنجاح مع:

✅ **Backend Integration** - ربط جميع الخدمات بالـ backend
✅ **Socket.IO Integration** - ربط المزايدات المباشرة
✅ **Environment Configuration** - تكوين البيئة لجميع الأجزاء
✅ **Security Configuration** - تكوين الأمان والـ CORS
✅ **Development Setup** - إعداد بيئة التطوير
✅ **Production Ready** - جاهز للإنتاج

التطبيق الآن جاهز للاستخدام مع جميع الميزات المتقدمة مثل المزايدات المباشرة والإشعارات والمدفوعات.
