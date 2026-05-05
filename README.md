# S.A.M.A Group — Mamdouh Shaykoon Investment
## موقع الاستثمار العقاري الرسمي

---

## 📁 هيكل المشروع

```
موقع سما/
├── server/          ← الخادم (Node.js + Express + MongoDB)
├── client/          ← الواجهة الأمامية (React + Vite)
└── README.md
```

---

## ✅ المتطلبات الأساسية

- **Node.js** v18 أو أحدث — https://nodejs.org
- **MongoDB** — إما local أو MongoDB Atlas (للسيرفر)

---

## 🖥️ تشغيل محلياً (Development)

### 1 — تثبيت الـ packages

```bash
# في مجلد server
cd server
npm install

# في مجلد client (terminal ثاني)
cd client
npm install
```

### 2 — إنشاء حساب الأدمن (مرة واحدة فقط)

```bash
cd server
npm run seed
```

### 3 — تشغيل الخادم

```bash
cd server
npm run dev
```
يعمل على: `http://localhost:5000`

### 4 — تشغيل الواجهة

```bash
cd client
npm run dev
```
يعمل على: `http://localhost:5173`

---

## 🌐 النشر على الإنترنت (Production)

### الطريقة الأسهل: VPS (DigitalOcean / Hostinger / Contabo)

#### الخطوة 1: إعداد السيرفر (Ubuntu)

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت MongoDB
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# تثبيت PM2 (لإبقاء السيرفر يعمل)
sudo npm install -g pm2

# تثبيت Nginx
sudo apt install -y nginx
```

#### الخطوة 2: رفع الكود

```bash
# على السيرفر
cd /var/www
git clone <رابط الريبو> sama-group
cd sama-group
```

أو ارفع الملفات بـ FileZilla/SCP.

#### الخطوة 3: إعداد ملف .env على السيرفر

```bash
nano /var/www/sama-group/server/.env
```

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sama-group
JWT_SECRET=your_very_strong_secret_here_change_this
ADMIN_EMAIL=admin@samagroup.com
ADMIN_PASSWORD=YourStrongPassword123
CLIENT_URL=https://www.samagroup.com
NODE_ENV=production
```

#### الخطوة 4: بناء الـ Frontend

```bash
cd /var/www/sama-group/client
npm install
npm run build
# سيتم إنشاء مجلد client/dist/
```

#### الخطوة 5: تثبيت packages السيرفر وتشغيله

```bash
cd /var/www/sama-group/server
npm install
npm run seed
pm2 start server.js --name "sama-group"
pm2 save
pm2 startup
```

#### الخطوة 6: إعداد Nginx

```bash
sudo nano /etc/nginx/sites-available/sama-group
```

ضع هذا الكونفيج:

```nginx
server {
    listen 80;
    server_name samagroup.com www.samagroup.com;

    # حجم رفع الملفات
    client_max_body_size 200M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/sama-group /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### الخطوة 7: SSL مجاني (HTTPS) مع Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d samagroup.com -d www.samagroup.com
```

---

### خدمات سحابية بديلة

| الخدمة | ماذا تستضيف | السعر |
|--------|-------------|-------|
| **Railway** | Server + MongoDB | مجاني محدود |
| **Render** | Server + MongoDB | مجاني محدود |
| **MongoDB Atlas** | قاعدة البيانات فقط | مجاني (512MB) |
| **DigitalOcean** | كل شيء (VPS) | $6/شهر |

#### MongoDB Atlas (لو عايز تستخدم Cloud DB)

1. اذهب لـ https://cloud.mongodb.com
2. أنشئ Cluster مجاني
3. احصل على Connection String وضعه في `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sama-group
```

---

## 🔑 بيانات الدخول الافتراضية

```
Email:    admin@samagroup.com
Password: Admin@Sama123
```

**غيّر كلمة المرور فور النشر!**

---

## ⚠️ تلخيص المشاكل لو نشرت بدون تعديل

| المشكلة | السبب | الحل |
|---------|-------|------|
| API لا تعمل | الـ proxy بيشتغل فقط في Development | استخدم `NODE_ENV=production` وابن الـ React |
| CORS Error | الدومين مش مسموح | حدّث `CLIENT_URL` في `.env` |
| MongoDB لا يتصل | لازم MongoDB يشتغل على السيرفر | MongoDB Atlas أو Local |
| الصور لا تظهر | `/uploads` مش متهيأ | Nginx يخدم `/uploads` تلقائياً |
