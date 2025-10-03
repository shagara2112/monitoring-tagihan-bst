# Monitoring Tagihan - Setup Supabase

## 📋 Langkah-Langkah Setup Supabase

### 1. Buat Project Supabase
1. Buka https://supabase.com
2. Sign up / Login
3. Klik **"New Project"**
4. Pilih organization Anda
5. Isi form:
   - **Project Name**: `monitoring-tagihan`
   - **Database Password**: Buat password yang kuat
   - **Region**: Pilih yang terdekat (Singapore/Jakarta)
6. Klik **"Create new project"**

### 2. Dapatkan Kredensial Supabase
Setelah project dibuat, dapatkan:

#### **Database URL**
- Dashboard → Settings → Database
- Copy **Connection string** → **URI**
- Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

#### **API Keys**
- Dashboard → Settings → API
- Copy **Project URL** (https://[PROJECT-REF].supabase.co)
- Copy **anon public** key
- Copy **service_role** key (rahasia!)

### 3. Update File .env
Ganti placeholder di file `.env` dengan kredensial Anda:

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:[PASSWORD_ANDA]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY_ANDA]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_KEY_ANDA]"

# JWT Secret
NEXTAUTH_SECRET="[BUAT_SECRET_KEY_UNIK]"
NEXTAUTH_URL="http://localhost:3000"

# Application Configuration
NODE_ENV="development"
```

### 4. Generate Prisma Client
```bash
npm run db:generate
```

### 5. Push Schema ke Supabase
```bash
npm run db:push
```

### 6. (Opsional) Install Supabase CLI
```bash
npm install -g supabase
```

## 🗄️ Struktur Database

Schema Prisma sudah otomatis membuat tabel:
- `User` - Tabel pengguna dengan role
- `Invoice` - Tabel invoice/tagihan

## 🔐 Konfigurasi Security

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Untuk client-side (aman)
- `SUPABASE_SERVICE_ROLE_KEY` - Untuk server-side (rahasia!)
- `NEXTAUTH_SECRET` - JWT secret untuk auth

### Row Level Security (RLS)
Supabase sudah memiliki RLS enabled by default.

## 🚀 Testing Connection

Setelah setup, test koneksi:

```bash
# Test database connection
npm run db:studio

# Test development server
npm run dev
```

## 📝 Catatan Penting

1. **Jangan commit .env ke GitHub!**
2. **Simpan service_role key dengan aman**
3. **Gunakan environment variables yang berbeda untuk production**
4. **Backup database secara berkala**

## 🆘 Troubleshooting

### Error: Connection refused
- Pastikan DATABASE_URL benar
- Cek password database
- Pastikan project Supabase sudah aktif

### Error: Prisma cannot connect
- Jalankan `npm run db:generate`
- Cek env variables sudah benar
- Restart development server

### Error: Migration failed
- Hapus tabel manual di Supabase Dashboard
- Jalankan `npm run db:push` lagi

## 📚 Link Bermanfaat

- [Supabase Dashboard](https://app.supabase.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/with-nextjs)