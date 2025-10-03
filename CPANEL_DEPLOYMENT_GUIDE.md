# 🚀 CPANEL DEPLOYMENT GUIDE

## 📋 DEPLOYMENT KE CPANEL HOSTING

### 🔍 **Cek Kompatibilitas cPanel Anda**

Sebelum mulai, pastikan cPanel Anda memiliki:
- ✅ **Node.js Selector** (Setup Node.js App)
- ✅ **Node.js 18+** support
- ✅ **MySQL Database** (jika tidak menggunakan Supabase)
- ✅ **SSH Access** (recommended)
- ✅ **SSL Certificate**

---

## 🛠 **METODE 1: NODE.JS SELECTOR (RECOMMENDED)**

### **Step 1: Build Aplikasi**
```bash
# Build untuk production
npm run build

# Build berhasil! Output ada di folder .next
```

### **Step 2: Upload ke cPanel**

#### **Opsi A: Menggunakan File Manager**
1. Login ke cPanel
2. Buka **File Manager**
3. Buat folder baru: `invoice-app`
4. Upload semua file kecuali:
   - `node_modules/`
   - `.git/`
   - `.next/` (akan dibuild di server)

#### **Opsi B: Menggunakan SSH**
```bash
# Zip project (kecuali node_modules dan .git)
tar --exclude='node_modules' --exclude='.git' --exclude='.next' -czf invoice-app.tar.gz .

# Upload ke server
scp invoice-app.tar.gz user@yourdomain.com:/home/user/

# Extract di server
ssh user@yourdomain.com
tar -xzf invoice-app.tar.gz
cd invoice-app
```

### **Step 3: Setup Node.js App di cPanel**

1. **Buka cPanel → Setup Node.js App**
2. **Create Application**:
   - **Application Root**: `invoice-app`
   - **Application URL**: `invoice-app.yourdomain.com`
   - **Application Startup File**: `server.js`
   - **Node.js Version**: `18.x` atau terbaru

### **Step 4: Buat Server File**
Buat file `server.js` di root project:

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

### **Step 5: Install Dependencies**
```bash
# Di cPanel Terminal atau SSH
cd invoice-app
npm install --production
```

### **Step 6: Setup Environment Variables**
Di cPanel Node.js App → **Environment Variables**:
```bash
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
```

### **Step 7: Restart Application**
Klik **Restart** di cPanel Node.js App

---

## 🛠 **METODE 2: STATIC EXPORT (Jika Node.js tidak tersedia)**

### **Step 1: Modify next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

### **Step 2: Build Static**
```bash
npm run build
```

### **Step 3: Upload ke cPanel**
1. Upload folder `out/` ke `public_html/invoice-app/`
2. Setup `.htaccess` untuk routing

---

## 🛠 **METODE 3: DOCKER (Advanced)**

### **Step 1: Buat Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### **Step 2: Buat docker-compose.yml**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
```

---

## 🔧 **DATABASE SETUP**

### **Opsi 1: Tetap Gunakan Supabase**
- Tidak perlu setup database di cPanel
- Gunakan Supabase cloud service

### **Opsi 2: MySQL di cPanel**
1. **Buat Database** di cPanel → MySQL Database Wizard
2. **Import Schema**:
   - Export dari Supabase
   - Import ke cPanel MySQL
3. **Update Connection String**:
```javascript
// lib/db-cpanel.js
const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})
```

---

## 🔒 **SSL & SECURITY**

### **Setup SSL Certificate**
1. Buka cPanel → SSL/TLS
2. Install free Let's Encrypt certificate
3. Force HTTPS redirect

### **Security Headers**
Tambahkan di `next.config.js`:
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

---

## 📊 **MONITORING & LOGS**

### **Cek Application Logs**
1. cPanel → Setup Node.js App → **View Logs**
2. Atau via SSH: `tail -f ~/invoice-app/logs/app.log`

### **Setup Error Tracking**
```javascript
// pages/_error.js
function Error({ statusCode, err }) {
  console.error('Error:', err)
  return (
    <p>
      {statusCode
        ? `An error ${statusCode} occurred on server`
        : 'An error occurred on client'}
    </p>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
```

---

## 🚀 **PERFORMANCE OPTIMIZATION**

### **Enable Caching**
```javascript
// next.config.js
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
}
```

### **Setup CDN**
- Gunakan Cloudflare (gratis)
- Setup caching untuk static assets

---

## 🔄 **AUTO-DEPLOYMENT SCRIPT**

### **Buat deploy.sh**
```bash
#!/bin/bash
# Auto-deployment script untuk cPanel

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm install --production

# Build application
npm run build

# Restart application
touch ~/tmp/restart.txt

echo "✅ Deployment completed!"
```

---

## 📋 **CHECKLIST DEPLOYMENT**

### **Pre-Deployment**
- [ ] Build berhasil di local
- [ ] Environment variables siap
- [ ] Database siap (Supabase/MySQL)
- [ ] SSL certificate siap

### **Post-Deployment**
- [ ] Application accessible di URL
- [ ] Database connection working
- [ ] All API endpoints responding
- [ ] Authentication working
- [ ] Static assets loading
- [ ] Mobile responsive

### **Testing**
- [ ] Login/logout functionality
- [ ] Create/edit/delete invoice
- [ ] Analytics dashboard
- [ ] Export functionality
- [ ] Search dan filter

---

## 🆘 **TROUBLESHOOTING**

### **Common Issues**

#### **1. Application not starting**
```bash
# Check logs
tail -f ~/invoice-app/logs/app.log

# Common solutions:
- Check Node.js version compatibility
- Verify environment variables
- Check port conflicts
```

#### **2. Database connection failed**
```bash
# Test connection
mysql -u username -p database_name

# Solutions:
- Check database credentials
- Verify database exists
- Check firewall settings
```

#### **3. Build errors**
```bash
# Clean build
rm -rf .next node_modules
npm install
npm run build
```

#### **4. Permission issues**
```bash
# Fix permissions
chmod -R 755 ~/invoice-app
chown -R user:user ~/invoice-app
```

---

## 📞 **SUPPORT**

Jika mengalami masalah:
1. **Check cPanel logs**: Setup Node.js App → View Logs
2. **Contact hosting support**: Minta bantuan untuk Node.js setup
3. **GitHub Issues**: https://github.com/shagara2112/invoice-management-system/issues

---

## 🎯 **NEXT STEPS**

Setelah berhasil deploy:
1. **Setup custom domain**
2. **Configure email notifications**
3. **Setup backup routine**
4. **Monitor performance**
5. **Setup analytics (Google Analytics)**

---

🎉 **Selamat! Aplikasi Anda siap running di cPanel!**