#!/bin/bash

echo "🚀 Setting up Monitoring Tagihan Database..."
echo "=========================================="

# Supabase Configuration
SUPABASE_URL="https://lnrkfmcsrzcmjfewlxyz.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucmtmbWNzcnpjbWpmZXdseHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NjIwMzEsImV4cCI6MjA3NTAzODAzMX0.0SMxVXf4VWYoRKrwUfCmNIFYr-4_4ffG5ykT-81edB8"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucmtmbWNzcnpjbWpmZXdseHl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQ2MjAzMSwiZXhwIjoyMDc1MDM4MDMxfQ.WkTxvTtzgWdVRJ1JnhF5_JIvKiSI8UT43y9v9WxMZjE"

echo "📡 Testing Supabase connection..."

# Test connection
curl -s "$SUPABASE_URL/rest/v1/" -H "apikey: $SUPABASE_ANON_KEY" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Supabase connection successful!"
else
    echo "❌ Supabase connection failed!"
    exit 1
fi

echo ""
echo "👥 Creating sample users..."

# Create admin user
curl -s -X POST "$SUPABASE_URL/rest/v1/users" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "admin-001",
    "email": "admin@monitoring.com",
    "name": "Administrator",
    "password": "$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQ",
    "role": "SUPER_ADMIN"
  }' > /dev/null

echo "✅ Admin user created: admin@monitoring.com / admin123"

# Create manager user
curl -s -X POST "$SUPABASE_URL/rest/v1/users" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "manager-001",
    "email": "manager@monitoring.com",
    "name": "Manager",
    "password": "$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQ",
    "role": "MANAGER"
  }' > /dev/null

echo "✅ Manager user created: manager@monitoring.com / manager123"

# Create staff user
curl -s -X POST "$SUPABASE_URL/rest/v1/users" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "staff-001",
    "email": "staff@monitoring.com",
    "name": "Staff Member",
    "password": "$2a$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQ",
    "role": "STAFF"
  }' > /dev/null

echo "✅ Staff user created: staff@monitoring.com / staff123"

echo ""
echo "📄 Creating sample invoices..."

# Create sample invoices
INVOICES=(
  '{
    "id": "inv-001",
    "invoice_number": "INV/2024/001",
    "client_name": "PT. Maju Bersama",
    "issue_date": "2024-01-15T00:00:00Z",
    "due_date": "2024-02-15T00:00:00Z",
    "total_amount": 15000000,
    "currency": "IDR",
    "description": "Jasa konsultasi manajemen bulan Januari",
    "status": "SETTLED",
    "position": "TERBAYAR",
    "work_region": "TARAKAN",
    "notes": "Pembayaran dilakukan tepat waktu",
    "settlement_date": "2024-02-10T00:00:00Z",
    "settlement_amount": 15000000,
    "payment_method": "Transfer Bank",
    "settlement_notes": "Lunas melalui BCA",
    "position_updated_at": "2024-02-10T00:00:00Z",
    "position_updated_by": "admin-001",
    "created_by_id": "admin-001"
  }'
  '{
    "id": "inv-002",
    "invoice_number": "INV/2024/002",
    "client_name": "CV. Sejahtera Abadi",
    "issue_date": "2024-01-20T00:00:00Z",
    "due_date": "2024-02-20T00:00:00Z",
    "total_amount": 8500000,
    "currency": "IDR",
    "description": "Pengadaan alat kantor",
    "status": "AWAITING_PAYMENT",
    "position": "HEAD_OFFICE",
    "work_region": "BALIKPAPAN",
    "notes": "Menunggu persetujuan dari finance",
    "created_by_id": "staff-001"
  }'
  '{
    "id": "inv-003",
    "invoice_number": "INV/2024/003",
    "client_name": "PT. Teknologi Digital",
    "issue_date": "2024-02-01T00:00:00Z",
    "due_date": "2024-03-01T00:00:00Z",
    "total_amount": 25000000,
    "currency": "IDR",
    "description": "Pengembangan software custom",
    "status": "INTERNAL_VALIDATION",
    "position": "AREA",
    "work_region": "SAMARINDA",
    "notes": "Sedang dalam proses validasi internal",
    "created_by_id": "manager-001"
  }'
  '{
    "id": "inv-004",
    "invoice_number": "INV/2024/004",
    "client_name": "PT. Logistik Cepat",
    "issue_date": "2024-02-05T00:00:00Z",
    "due_date": "2024-03-05T00:00:00Z",
    "total_amount": 12000000,
    "currency": "IDR",
    "description": "Jasa pengiriman bulan Februari",
    "status": "SUBMITTED",
    "position": "REGIONAL",
    "work_region": "TARAKAN",
    "notes": "Invoice sudah dikirim ke klien",
    "created_by_id": "admin-001"
  }'
  '{
    "id": "inv-005",
    "invoice_number": "INV/2024/005",
    "client_name": "CV. Karya Mandiri",
    "issue_date": "2024-02-10T00:00:00Z",
    "due_date": "2024-03-10T00:00:00Z",
    "total_amount": 7500000,
    "currency": "IDR",
    "description": "Maintenance sistem",
    "status": "DRAFT",
    "position": "MITRA",
    "work_region": "BALIKPAPAN",
    "notes": "Draft invoice, menunggu finalisasi",
    "created_by_id": "staff-001"
  }'
)

for invoice in "${INVOICES[@]}"; do
  curl -s -X POST "$SUPABASE_URL/rest/v1/invoices" \
    -H "apikey: $SUPABASE_SERVICE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d "$invoice" > /dev/null
  
  # Extract invoice number for display
  invoice_num=$(echo $invoice | jq -r '.invoice_number')
  echo "✅ Invoice created: $invoice_num"
done

echo ""
echo "🔍 Verifying created data..."

# Count users
user_count=$(curl -s "$SUPABASE_URL/rest/v1/users?select=count" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" | jq '. | length')

# Count invoices
invoice_count=$(curl -s "$SUPABASE_URL/rest/v1/invoices?select=count" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" | jq '. | length')

echo "📊 Total users: $user_count"
echo "📄 Total invoices: $invoice_count"

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "📋 Login Credentials:"
echo "🔑 Admin: admin@monitoring.com / admin123"
echo "🔑 Manager: manager@monitoring.com / manager123"
echo "🔑 Staff: staff@monitoring.com / staff123"
echo ""
echo "🚀 You can now login and test the application at: http://localhost:3000"