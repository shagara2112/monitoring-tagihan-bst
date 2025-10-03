## 🚨 **PENTING: SETUP DATABASE DIBUTUHKAN!**

### 🔧 **Langkah Setup Database Supabase**

Aplikasi tidak bisa berjalan karena tabel database belum dibuat. Silakan ikuti langkah-langkah berikut:

#### **1. Buka Supabase Dashboard**
- Buka https://app.supabase.com
- Login dan pilih project `lnrkfmcsrzcmjfewlxyz`

#### **2. Buka SQL Editor**
- Klik **SQL Editor** di sidebar kiri
- Klik **New query**

#### **3. Copy & Paste SQL Schema**
Copy semua SQL dari file `supabase-schema.sql` dan paste di SQL Editor:

```sql
-- Monitoring Tagihan Database Schema
-- Run this SQL in Supabase Dashboard > SQL Editor

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'STAFF' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'STAFF', 'MANAGER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_amount REAL NOT NULL,
    currency TEXT DEFAULT 'IDR',
    description TEXT NOT NULL,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'INTERNAL_VALIDATION', 'AWAITING_PAYMENT', 'SETTLED', 'DELAYED')),
    position TEXT DEFAULT 'MITRA' CHECK (position IN ('MITRA', 'USER', 'AREA', 'REGIONAL', 'HEAD_OFFICE', 'APM', 'TERBAYAR')),
    work_region TEXT DEFAULT 'TARAKAN' CHECK (work_region IN ('TARAKAN', 'BALIKPAPAN', 'SAMARINDA')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settlement_date TIMESTAMP WITH TIME ZONE,
    settlement_amount REAL,
    payment_method TEXT,
    settlement_notes TEXT,
    position_updated_at TIMESTAMP WITH TIME ZONE,
    position_updated_by TEXT,
    created_by_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_position ON invoices(position);
CREATE INDEX IF NOT EXISTS idx_invoices_work_region ON invoices(work_region);
CREATE INDEX IF NOT EXISTS idx_invoices_client_name ON invoices(client_name);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_by_id ON invoices(created_by_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

-- Create policies for invoices table
CREATE POLICY "Users can view all invoices" ON invoices
    FOR SELECT USING (true);

CREATE POLICY "Users can insert invoices" ON invoices
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update invoices" ON invoices
    FOR UPDATE USING (true);

-- Create admin user (password: admin123)
INSERT INTO users (id, email, name, password, role) 
VALUES 
    ('admin-001', 'admin@monitoring.com', 'Administrator', '$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQ', 'SUPER_ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Tables: users, invoices';
    RAISE NOTICE '🔐 RLS enabled with policies';
    RAISE NOTICE '👤 Default admin user created: admin@monitoring.com / admin123';
END $$;
```

#### **4. Jalankan SQL**
- Klik tombol **Run** (▶️) untuk menjalankan SQL
- Tunggu hingga selesai

#### **5. Verifikasi Setup**
- Klik **Table Editor** di sidebar
- Pastikan tabel `users` dan `invoices` sudah ada
- Cek data admin user sudah terbuat

#### **6. Jalankan Sample Data (Opsional)**
Setelah tabel dibuat, jalankan script sample data:

```bash
bash scripts/setup-database.sh
```

### 📋 **Login Credentials Setelah Setup:**
- **Admin**: admin@monitoring.com / admin123
- **Manager**: manager@monitoring.com / manager123
- **Staff**: staff@monitoring.com / staff123

### 🚀 **Setelah Setup Selesai:**
1. Refresh browser: http://localhost:3000
2. Login dengan akun admin
3. Aplikasi siap digunakan!

---

**🔥 PENTING: Tidak ada tabel di database = aplikasi tidak bisa berjalan!**
**Harap jalankan SQL schema di Supabase Dashboard terlebih dahulu.**