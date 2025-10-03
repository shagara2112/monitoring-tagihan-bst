# 🚀 Setup Database Supabase - Panduan Lengkap

## ✅ Status Saat Ini
- ✅ Supabase client terinstall
- ✅ API Keys sudah dikonfigurasi
- ✅ Connection string sudah diatur
- ✅ Schema database sudah dibuat

## 📋 Langkah Setup Database

### 1. **Buka Supabase Dashboard**
- Buka https://app.supabase.com
- Login dan pilih project `lnrkfmcsrzcmjfewlxyz`

### 2. **Jalankan SQL Schema**
1. Klik **SQL Editor** di sidebar kiri
2. Klik **New query**
3. Copy semua SQL dari file `supabase-schema.sql`
4. Paste dan klik **Run**

### 3. **Verifikasi Setup**
1. Klik **Table Editor** di sidebar
2. Pastikan tabel `users` dan `invoices` sudah ada
3. Cek data admin user sudah terbuat

## 🔐 **Default Admin User**
- **Email**: admin@monitoring.com
- **Password**: admin123
- **Role**: SUPER_ADMIN

## 📁 **File Konfigurasi**

### `.env` (Sudah lengkap)
```bash
DATABASE_URL="postgresql://postgres:D%40Danpei2112@db.lnrkfmcsrzcmjfewlxyz.supabase.co:6543/postgres?pgbouncer=true"
NEXT_PUBLIC_SUPABASE_URL="https://lnrkfmcsrzcmjfewlxyz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### `src/lib/db.ts` (Sudah update)
- ✅ Supabase client configuration
- ✅ Prisma fallback
- ✅ Connection testing

## 🚀 **Jalankan Aplikasi**

Setelah setup database selesai:

```bash
# Start development server
npm run dev
```

Aplikasi akan berjalan di http://localhost:3000

## 📊 **Fitur yang Tersedia**

### 🔑 **Authentication**
- Login dengan default admin user
- Multi-role system (SUPER_ADMIN, ADMIN, MANAGER, STAFF)

### 📈 **Invoice Management**
- Create, read, update, delete invoices
- Status tracking (DRAFT → SETTLED)
- Regional filtering (TARAKAN, BALIKPAPAN, SAMARINDA)

### 📊 **Analytics Dashboard**
- Real-time data visualization
- Regional performance metrics
- Payment status analytics

### 🔄 **Real-time Updates**
- Socket.io integration
- Live data synchronization
- Auto-refresh dashboard

## 🛠️ **Troubleshooting**

### Error: Connection failed
- Pastikan SQL schema sudah dijalankan
- Cek API keys di .env
- Restart development server

### Error: Table not found
- Jalankan SQL schema di Supabase Dashboard
- Refresh browser

### Error: Auth failed
- Gunakan default admin user
- Cek JWT secret di .env

## 📚 **Link Penting**

- **Supabase Dashboard**: https://app.supabase.com
- **Project URL**: https://lnrkfmcsrzcmjfewlxyz.supabase.co
- **API Documentation**: https://lnrkfmcsrzcmjfewlxyz.supabase.co/docs

## 🎯 **Next Steps**

1. ✅ Setup database (jalankan SQL schema)
2. ✅ Start development server
3. ✅ Login dengan admin user
4. ✅ Test semua fitur
5. ✅ Customizing data dan users

---

**🎉 Selamat! Sistem Monitoring Tagihan Anda siap digunakan!**