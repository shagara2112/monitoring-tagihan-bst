import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = 'https://lnrkfmcsrzcmjfewlxyz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxucmtmbWNzcnpjbWpmZXdseHl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQ2MjAzMSwiZXhwIjoyMDc1MDM4MDMxfQ.WkTxvTtzgWdVRJ1JnhF5_JIvKiSI8UT43y9v9WxMZjE'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createSampleData() {
  try {
    console.log('🚀 Creating sample data for Monitoring Tagihan...')
    
    // Test connection
    console.log('📡 Testing Supabase connection...')
    const { data: testData, error: testError } = await supabase.from('users').select('count').limit(1)
    
    if (testError && testError.code !== 'PGRST116') {
      console.error('❌ Connection failed:', testError)
      return
    }
    
    console.log('✅ Supabase connection successful!')
    
    // Create sample users
    console.log('👥 Creating sample users...')
    
    const users = [
      {
        id: 'admin-001',
        email: 'admin@monitoring.com',
        name: 'Administrator',
        password: await bcrypt.hash('admin123', 10),
        role: 'SUPER_ADMIN'
      },
      {
        id: 'manager-001',
        email: 'manager@monitoring.com',
        name: 'Manager',
        password: await bcrypt.hash('manager123', 10),
        role: 'MANAGER'
      },
      {
        id: 'staff-001',
        email: 'staff@monitoring.com',
        name: 'Staff Member',
        password: await bcrypt.hash('staff123', 10),
        role: 'STAFF'
      },
      {
        id: 'admin-002',
        email: 'finance@monitoring.com',
        name: 'Finance Admin',
        password: await bcrypt.hash('finance123', 10),
        role: 'ADMIN'
      }
    ]
    
    for (const user of users) {
      const { error: userError } = await supabase.from('users').upsert(user, {
        onConflict: 'email'
      })
      
      if (userError) {
        console.error(`❌ Error creating user ${user.email}:`, userError)
      } else {
        console.log(`✅ User created: ${user.email}`)
      }
    }
    
    // Create sample invoices
    console.log('📄 Creating sample invoices...')
    
    const invoices = [
      {
        id: 'inv-001',
        invoice_number: 'INV/2024/001',
        client_name: 'PT. Maju Bersama',
        issue_date: '2024-01-15T00:00:00Z',
        due_date: '2024-02-15T00:00:00Z',
        total_amount: 15000000,
        currency: 'IDR',
        description: 'Jasa konsultasi manajemen bulan Januari',
        status: 'SETTLED',
        position: 'TERBAYAR',
        work_region: 'TARAKAN',
        notes: 'Pembayaran dilakukan tepat waktu',
        settlement_date: '2024-02-10T00:00:00Z',
        settlement_amount: 15000000,
        payment_method: 'Transfer Bank',
        settlement_notes: 'Lunas melalui BCA',
        position_updated_at: '2024-02-10T00:00:00Z',
        position_updated_by: 'admin-001',
        created_by_id: 'admin-001'
      },
      {
        id: 'inv-002',
        invoice_number: 'INV/2024/002',
        client_name: 'CV. Sejahtera Abadi',
        issue_date: '2024-01-20T00:00:00Z',
        due_date: '2024-02-20T00:00:00Z',
        total_amount: 8500000,
        currency: 'IDR',
        description: 'Pengadaan alat kantor',
        status: 'AWAITING_PAYMENT',
        position: 'HEAD_OFFICE',
        work_region: 'BALIKPAPAN',
        notes: 'Menunggu persetujuan dari finance',
        created_by_id: 'staff-001'
      },
      {
        id: 'inv-003',
        invoice_number: 'INV/2024/003',
        client_name: 'PT. Teknologi Digital',
        issue_date: '2024-02-01T00:00:00Z',
        due_date: '2024-03-01T00:00:00Z',
        total_amount: 25000000,
        currency: 'IDR',
        description: 'Pengembangan software custom',
        status: 'INTERNAL_VALIDATION',
        position: 'AREA',
        work_region: 'SAMARINDA',
        notes: 'Sedang dalam proses validasi internal',
        created_by_id: 'manager-001'
      },
      {
        id: 'inv-004',
        invoice_number: 'INV/2024/004',
        client_name: 'PT. Logistik Cepat',
        issue_date: '2024-02-05T00:00:00Z',
        due_date: '2024-03-05T00:00:00Z',
        total_amount: 12000000,
        currency: 'IDR',
        description: 'Jasa pengiriman bulan Februari',
        status: 'SUBMITTED',
        position: 'REGIONAL',
        work_region: 'TARAKAN',
        notes: 'Invoice sudah dikirim ke klien',
        created_by_id: 'admin-002'
      },
      {
        id: 'inv-005',
        invoice_number: 'INV/2024/005',
        client_name: 'CV. Karya Mandiri',
        issue_date: '2024-02-10T00:00:00Z',
        due_date: '2024-03-10T00:00:00Z',
        total_amount: 7500000,
        currency: 'IDR',
        description: 'Maintenance sistem',
        status: 'DRAFT',
        position: 'MITRA',
        work_region: 'BALIKPAPAN',
        notes: 'Draft invoice, menunggu finalisasi',
        created_by_id: 'staff-001'
      },
      {
        id: 'inv-006',
        invoice_number: 'INV/2024/006',
        client_name: 'PT. Sukses Makmur',
        issue_date: '2023-12-15T00:00:00Z',
        due_date: '2024-01-15T00:00:00Z',
        total_amount: 18000000,
        currency: 'IDR',
        description: 'Training dan development',
        status: 'DELAYED',
        position: 'APM',
        work_region: 'SAMARINDA',
        notes: 'Pembayaran terlambat, sedang dalam proses follow-up',
        created_by_id: 'manager-001'
      },
      {
        id: 'inv-007',
        invoice_number: 'INV/2024/007',
        client_name: 'PT. Inovasi Teknologi',
        issue_date: '2024-02-15T00:00:00Z',
        due_date: '2024-03-15T00:00:00Z',
        total_amount: 22000000,
        currency: 'IDR',
        description: 'Implementasi sistem ERP',
        status: 'SETTLED',
        position: 'TERBAYAR',
        work_region: 'TARAKAN',
        notes: 'Proyek selesai, pembayaran lunas',
        settlement_date: '2024-03-10T00:00:00Z',
        settlement_amount: 22000000,
        payment_method: 'Transfer Bank',
        settlement_notes: 'Pembayaran melalui BNI',
        position_updated_at: '2024-03-10T00:00:00Z',
        position_updated_by: 'admin-001',
        created_by_id: 'admin-001'
      },
      {
        id: 'inv-008',
        invoice_number: 'INV/2024/008',
        client_name: 'CV. Mitra Sejati',
        issue_date: '2024-02-20T00:00:00Z',
        due_date: '2024-03-20T00:00:00Z',
        total_amount: 9500000,
        currency: 'IDR',
        description: 'Jasa audit internal',
        status: 'AWAITING_PAYMENT',
        position: 'USER',
        work_region: 'BALIKPAPAN',
        notes: 'Menunggu konfirmasi dari klien',
        created_by_id: 'admin-002'
      }
    ]
    
    for (const invoice of invoices) {
      const { error: invoiceError } = await supabase.from('invoices').upsert(invoice, {
        onConflict: 'invoice_number'
      })
      
      if (invoiceError) {
        console.error(`❌ Error creating invoice ${invoice.invoice_number}:`, invoiceError)
      } else {
        console.log(`✅ Invoice created: ${invoice.invoice_number}`)
      }
    }
    
    // Verify data
    console.log('🔍 Verifying created data...')
    
    const { data: usersData, error: usersError } = await supabase.from('users').select('*')
    if (!usersError) {
      console.log(`✅ Total users: ${usersData.length}`)
    }
    
    const { data: invoicesData, error: invoicesError } = await supabase.from('invoices').select('*')
    if (!invoicesError) {
      console.log(`✅ Total invoices: ${invoicesData.length}`)
    }
    
    console.log('\n🎉 Sample data created successfully!')
    console.log('\n📋 Login Credentials:')
    console.log('🔑 Admin: admin@monitoring.com / admin123')
    console.log('🔑 Manager: manager@monitoring.com / manager123')
    console.log('🔑 Staff: staff@monitoring.com / staff123')
    console.log('🔑 Finance: finance@monitoring.com / finance123')
    console.log('\n🚀 You can now login and test the application!')
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error)
  }
}

createSampleData()