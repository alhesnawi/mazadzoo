# مشروع مزاد الحيوانات النادرة - دليل التثبيت والنشر

## نظرة عامة

مرحباً بك في مشروع مزاد الحيوانات النادرة! هذا المشروع عبارة عن منصة متكاملة لمزادات الحيوانات النادرة تتضمن:

- **التطبيق الجوال**: React Native مع Expo (iOS & Android)
- **الواجهة الأمامية**: React.js مع Vite و Tailwind CSS
- **لوحة التحكم الإدارية**: React.js مع Material-UI
- **الخادم الخلفي**: Node.js مع Express.js
- **قاعدة البيانات**: MongoDB
- **التحديثات الفورية**: Socket.IO

## متطلبات النظام

### الخادم (VPS/Server)
- **نظام التشغيل**: Ubuntu 20.04+ أو CentOS 8+
- **المعالج**: 2 CPU cores أو أكثر
- **الذاكرة**: 4GB RAM أو أكثر
- **التخزين**: 50GB SSD أو أكثر
- **الشبكة**: اتصال إنترنت مستقر

### البرمجيات المطلوبة
- **Node.js**: الإصدار 18.x أو أحدث
- **MongoDB**: الإصدار 5.x أو أحدث
- **Nginx**: لخادم الويب والـ Reverse Proxy
- **PM2**: لإدارة عمليات Node.js
- **Git**: لإدارة الكود المصدري

## التثبيت خطوة بخطوة

### 1. تحضير الخادم

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت الأدوات الأساسية
sudo apt install -y curl wget git unzip nginx

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt update
sudo apt install -y mongodb-org

# تثبيت PM2
sudo npm install -g pm2
```

### 2. إعداد قاعدة البيانات

```bash
# بدء خدمة MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# إنشاء مستخدم قاعدة البيانات
mongo
use rare_animals_auction
db.createUser({
  user: "auction_user",
  pwd: "secure_password_here",
  roles: [{ role: "readWrite", db: "rare_animals_auction" }]
})
exit
```

### 3. رفع ملفات المشروع

```bash
# إنشاء مجلد المشروع
sudo mkdir -p /var/www/rare-animals-auction
sudo chown $USER:$USER /var/www/rare-animals-auction

# رفع وفك ضغط المشروع
cd /var/www/rare-animals-auction
unzip rare-animals-auction.zip
```

### 4. إعداد الخادم الخلفي

```bash
# الانتقال لمجلد الخادم الخلفي
cd /var/www/rare-animals-auction/backend

# تثبيت التبعيات
npm install

# نسخ ملف متغيرات البيئة
cp .env.example .env

# تحرير متغيرات البيئة
nano .env
```

**محتوى ملف .env:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://auction_user:secure_password_here@localhost:27017/rare_animals_auction
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRE=24h
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SMS_API_KEY=your_sms_api_key
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
LISTING_FEE=10
BIDDING_FEE=40
PLATFORM_COMMISSION=0.05
```

```bash
# بدء الخادم الخلفي مع PM2
pm2 start server.js --name "auction-backend"
pm2 save
pm2 startup
```

### 5. إعداد الواجهة الأمامية

```bash
# الانتقال لمجلد الواجهة الأمامية
cd /var/www/rare-animals-auction/auction-frontend

# تثبيت التبعيات
npm install

# بناء المشروع للإنتاج
npm run build

# نسخ الملفات المبنية
sudo cp -r dist/* /var/www/html/
```

### 6. إعداد لوحة التحكم الإدارية

```bash
# الانتقال لمجلد لوحة التحكم
cd /var/www/rare-animals-auction/admin-dashboard

# تثبيت التبعيات
npm install

# بناء المشروع للإنتاج
npm run build

# إنشاء مجلد للوحة التحكم
sudo mkdir -p /var/www/html/admin
sudo cp -r dist/* /var/www/html/admin/
```

### 7. إعداد Nginx

```bash
# إنشاء ملف تكوين Nginx
sudo nano /etc/nginx/sites-available/rare-animals-auction
```

**محتوى ملف التكوين:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # الواجهة الأمامية
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # لوحة التحكم الإدارية
    location /admin {
        alias /var/www/html/admin;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }

    # API الخادم الخلفي
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ملفات الوسائط
    location /uploads {
        alias /var/www/rare-animals-auction/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/rare-animals-auction /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. إعداد SSL (اختياري ولكن مُوصى به)

```bash
# تثبيت Certbot
sudo apt install -y certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## إعداد التطبيق الجوال

### متطلبات التطوير
- **Node.js**: الإصدار 18.x أو أحدث
- **Expo CLI**: `npm install -g @expo/cli`
- **Android Studio**: لبناء تطبيق Android
- **Xcode**: لبناء تطبيق iOS (macOS فقط)

### بناء التطبيق

```bash
# الانتقال لمجلد التطبيق الجوال
cd /path/to/mobile-app

# تثبيت التبعيات
npm install

# تحديث عنوان API في التطبيق
# تحرير src/services/api.js وتغيير API_BASE_URL

# بناء التطبيق للإنتاج
expo build:android  # لـ Android
expo build:ios      # لـ iOS
```

## اختبار النظام

### 1. اختبار الخادم الخلفي
```bash
curl http://your-domain.com/api/health
```

### 2. اختبار الواجهة الأمامية
افتح المتصفح وانتقل إلى `http://your-domain.com`

### 3. اختبار لوحة التحكم
افتح المتصفح وانتقل إلى `http://your-domain.com/admin`

### 4. اختبار Socket.IO
تحقق من عمل التحديثات الفورية في المزادات

## الصيانة والمراقبة

### مراقبة العمليات
```bash
# عرض حالة العمليات
pm2 status

# عرض سجلات الأخطاء
pm2 logs auction-backend

# إعادة تشغيل الخادم
pm2 restart auction-backend
```

### النسخ الاحتياطي
```bash
# نسخ احتياطي لقاعدة البيانات
mongodump --db rare_animals_auction --out /backup/$(date +%Y%m%d)

# نسخ احتياطي للملفات المرفوعة
tar -czf /backup/uploads-$(date +%Y%m%d).tar.gz /var/www/rare-animals-auction/backend/uploads
```

### التحديثات
```bash
# تحديث الكود
cd /var/www/rare-animals-auction
git pull origin main

# إعادة بناء الواجهة الأمامية
cd auction-frontend
npm run build
sudo cp -r dist/* /var/www/html/

# إعادة تشغيل الخادم الخلفي
pm2 restart auction-backend
```

## استكشاف الأخطاء

### مشاكل شائعة وحلولها

**1. خطأ في الاتصال بقاعدة البيانات**
```bash
# تحقق من حالة MongoDB
sudo systemctl status mongod

# إعادة تشغيل MongoDB
sudo systemctl restart mongod
```

**2. خطأ في الخادم الخلفي**
```bash
# عرض سجلات الأخطاء
pm2 logs auction-backend --lines 50

# إعادة تشغيل الخادم
pm2 restart auction-backend
```

**3. مشاكل في Nginx**
```bash
# اختبار تكوين Nginx
sudo nginx -t

# إعادة تحميل التكوين
sudo systemctl reload nginx
```

**4. مشاكل في الأذونات**
```bash
# إصلاح أذونات الملفات
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

## الأمان

### إعدادات الأمان الموصى بها

1. **جدار الحماية**
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
```

2. **تحديث النظام بانتظام**
```bash
sudo apt update && sudo apt upgrade -y
```

3. **مراقبة السجلات**
```bash
# مراقبة سجلات Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

4. **نسخ احتياطية منتظمة**
إعداد cron job للنسخ الاحتياطية اليومية

## الدعم والمساعدة

للحصول على المساعدة أو الإبلاغ عن مشاكل:

1. تحقق من سجلات الأخطاء أولاً
2. راجع دليل استكشاف الأخطاء
3. تأكد من تحديث جميع التبعيات
4. تحقق من إعدادات الشبكة والجدار الناري

---

**ملاحظة**: هذا الدليل يفترض استخدام Ubuntu 20.04+. قد تحتاج لتعديل بعض الأوامر حسب نظام التشغيل المستخدم.

