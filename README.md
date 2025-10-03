# Aplikasi Manajemen dan Pelacakan Tagihan

Aplikasi web berbasis Next.js untuk manajemen dan pelacakan tagihan perusahaan yang lengkap dengan dashboard real-time, workflow status, dan fitur pencairan dana.

## 🚀 Fitur Utama

### 📊 Dashboard Komprehensif
- **Statistik Real-time**: Total tagihan, lunas, menunggu pembayaran, dan jatuh tempo
- **Visualisasi Data**: Grafik distribusi status dan analitik tagihan
- **Monitoring**: Identifikasi tagihan yang mendekati atau melewati jatuh tempo

### 📝 Entri Data Tagihan
- **Form Validasi**: Input data tagihan dengan validasi lengkap
- **Generate Nomor Otomatis**: Pembuatan nomor tagihan unik otomatis
- **Multi-mata Uang**: Support untuk IDR, USD, EUR
- **Informasi Lengkap**: Client, tanggal, jumlah, deskripsi, dan catatan

### 🔄 Sistem Workflow Status
- **6 Status Workflow**:
  - `DRAF`: Tagihan baru dibuat/direvisi
  - `DIAJUKAN KE KLIEN`: Tagihan sudah dikirimkan
  - `VALIDASI INTERNAL`: Proses approval internal
  - `MENUNGGU PEMBAYARAN`: Menunggu transfer dana
  - `LUNAS`: Dana telah diterima
  - `DITUNDA/BERMASALAH`: Ada hambatan

### 📍 Sistem Posisi Tagihan (7 Level Workflow)
- **MITRA**: Tahap awal dari mitra/business partner
- **USER**: Level user/pengguna awal
- **AREA**: Level area/wilayah tertentu
- **REGIONAL**: Level regional yang lebih luas
- **HEAD_OFFICE**: Level kantor pusat
- **APM**: Level Approval/Project Manager
- **TERBAYAR**: Status akhir setelah pembayaran selesai

### 💰 Keterangan Pencairan Dana
- **Detail Pencairan**: Tanggal, jumlah diterima, metode pembayaran
- **Support Pembayaran Parsial**: Antisipasi potongan atau pembayaran sebagian
- **Catatan Tambahan**: Informasi mengenai potongan pajak atau biaya bank

### 🔍 Filter & Pencarian
- **Multi-filter**: Berdasarkan klien, status, posisi, jumlah, tanggal
- **Pencarian Real-time**: Cari berdasarkan nomor tagihan, klien, atau deskripsi
- **Export Data**: Download data dalam format CSV sesuai filter

### 📈 Laporan & Analitik
- **Export CSV/Excel**: Export data berdasarkan filter yang diterapkan
- **Statistik Dashboard**: Visualisasi data yang mudah dipahami
- **Monitoring Jatuh Tempo**: Alert untuk tagihan yang overdue

## 🛠 Teknologi

- **Frontend**: Next.js 15 dengan App Router
- **UI**: Tailwind CSS + shadcn/ui components
- **Database**: SQLite dengan Prisma ORM
- **Language**: TypeScript 5
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📦 Instalasi

1. Clone repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup database:
   ```bash
   npm run db:push
   ```

4. Buat data sample (opsional):
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

5. Jalankan development server:
   ```bash
   npm run dev
   ```

6. Buka [http://localhost:3000](http://localhost:3000)

## 🏗 Struktur Database

### Users
- `id`: Unique identifier
- `email`: Email address (unique)
- `name`: User name
- `role`: ADMIN, STAFF, MANAGER

### Invoices
- `id`: Unique identifier
- `invoiceNumber`: Nomor tagihan unik
- `clientName`: Nama klien/vendor
- `issueDate`: Tanggal terbit
- `dueDate`: Tanggal jatuh tempo
- `totalAmount`: Jumlah total
- `currency`: Mata uang (IDR, USD, EUR)
- `description`: Deskripsi proyek/layanan
- `status`: Status workflow
- `notes`: Catatan tambahan
- `position`: Posisi workflow (MITRA, USER, AREA, REGIONAL, HEAD_OFFICE, APM, TERBAYAR)
- `positionUpdatedAt`: Timestamp update posisi
- `positionUpdatedBy`: User yang update posisi
- `settlementDate`: Tanggal pencairan
- `settlementAmount`: Jumlah diterima
- `paymentMethod`: Metode pembayaran
- `settlementNotes`: Catatan pencairan
- `createdById`: ID user yang membuat

## 📋 API Endpoints

### Invoices
- `GET /api/invoices` - Get all invoices with stats
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/[id]` - Get specific invoice
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice
- `GET /api/invoices/export` - Export invoices to CSV

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

### Seed Data
- `POST /api/seed` - Create sample data

## 🎯 Cara Penggunaan

### 1. Membuat Tagihan Baru
1. Klik tombol "Tagihan Baru" di dashboard
2. Isi form dengan data lengkap:
   - Nomor tagihan (bisa auto-generate)
   - Nama klien/vendor
   - Tanggal terbit dan jatuh tempo
   - Jumlah dan mata uang
   - Deskripsi layanan
   - Status awal (biasanya DRAF)
   - Pilih user yang membuat
3. Klik "Simpan Tagihan"

### 2. Update Status Tagihan
1. Klik "Detail" pada tagihan yang ingin diupdate
2. Pilih status baru dari dropdown
3. Tambahkan catatan jika perlu
4. Klik "Update Status"

### 3. Mencatat Pencairan Dana
1. Buka detail tagihan dengan status "LUNAS"
2. Isi form pencairan:
   - Tanggal pencairan
   - Jumlah diterima (bisa berbeda dari total)
   - Metode pembayaran
   - Catatan pencairan
3. Klik "Simpan Pencairan"

### 4. Filter dan Export Data
1. Gunakan filter di bagian atas tabel
2. Pilih status, klien, atau cari dengan keyword
3. Klik "Export CSV" untuk download data

## 🔒 Keamanan

Aplikasi ini memiliki struktur untuk autentikasi user dengan role-based access control:
- **ADMIN**: Akses penuh
- **MANAGER**: Akses terbatas
- **STAFF**: Akses basic

*(Note: Implementasi autentikasi dapat ditambahkan dengan NextAuth.js)*

## 🚀 Pengembangan

### Menambah Fitur Baru
1. Update schema Prisma di `prisma/schema.prisma`
2. Run `npm run db:push`
3. Buat API route di `src/app/api/`
4. Update UI components

### Custom Component
Aplikasi menggunakan shadcn/ui components. Untuk menambah component:
```bash
npx shadcn-ui@latest add [component-name]
```

## 📝 License

MIT License - lihat file LICENSE untuk detail

## 🤝 Kontribusi

Contributions are welcome! Silakan buat Pull Request untuk improvement.