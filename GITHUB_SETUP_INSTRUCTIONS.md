# 🚀 GITHUB SETUP INSTRUCTIONS

## Langkah-langkah Menghubungkan ke GitHub

### 1. Ganti USERNAME dengan username GitHub Anda
```bash
# Ganti USERNAME dengan username GitHub Anda yang sebenarnya
git remote add origin https://github.com/USERNAME/invoice-management-system.git
```

### 2. Push ke GitHub
```bash
# Push ke branch main
git branch -M main
git push -u origin main
```

### 3. Jika menggunakan Personal Access Token
Jika diminta password, gunakan Personal Access Token:
1. Buka GitHub Settings → Developer settings → Personal access tokens
2. Generate new token dengan scope `repo`
3. Gunakan token sebagai password

### 4. Verifikasi Koneksi
```bash
# Cek remote repository
git remote -v

# Cek status
git status

# Pull terbaru dari GitHub
git pull origin main
```

## 📝 Catatan Penting

- **USERNAME**: Ganti dengan username GitHub Anda
- **Repository Name**: Sesuaikan dengan nama repository yang Anda buat
- **Branch**: Aplikasi menggunakan `main` branch
- **Environment Variables**: Jangan lupa setup environment variables di deployment

## 🔄 Perintah Git Berguna

```bash
# Tambahkan semua perubahan
git add .

# Commit dengan pesan
git commit -m "Deskripsi perubahan"

# Push ke GitHub
git push origin main

# Pull dari GitHub
git pull origin main

# Cek status
git status

# Lihat commit history
git log --oneline
```

## 🚀 Deployment Options

Setelah terhubung ke GitHub, Anda bisa deploy ke:
- **Vercel** (recommended untuk Next.js)
- **Netlify**
- **Railway**
- **Heroku**
- **DigitalOcean App Platform**

## 🔐 Environment Variables untuk Deployment

Jangan lupa setup environment variables di platform deployment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`