#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createSampleInvoices() {
  try {
    console.log('🔧 Creating sample invoices...\n');

    // Get users to assign as creators
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .order('created_at', { ascending: false })
      .limit(5);

    if (userError) {
      console.error('❌ Error fetching users:', userError.message);
      return;
    }

    console.log(`✅ Found ${users.length} users for invoice creation`);

    // Sample invoice data
    const sampleInvoices = [
      {
        invoice_number: 'INV-2025-001',
        client_name: 'PT. Maju Bersama',
        issue_date: '2025-01-15',
        due_date: '2025-02-15',
        total_amount: 15000000,
        currency: 'IDR',
        description: 'Jasa konsultasi manajemen bulan Januari',
        status: 'SETTLED',
        position: 'HEAD_OFFICE',
        work_region: 'BALIKPAPAN',
        notes: 'Pembayaran melalui transfer bank BCA',
        settlement_date: '2025-02-10',
        settlement_amount: 15000000,
        payment_method: 'Transfer Bank',
        settlement_notes: 'Lunas tepat waktu',
        created_by_id: users[0]?.id || users[0]?.id
      },
      {
        invoice_number: 'INV-2025-002',
        client_name: 'CV. Mitra Sejati',
        issue_date: '2025-01-20',
        due_date: '2025-02-20',
        total_amount: 8500000,
        currency: 'IDR',
        description: 'Pengadaan peralatan kantor',
        status: 'AWAITING_PAYMENT',
        position: 'MITRA',
        work_region: 'TARAKAN',
        notes: 'Menunggu konfirmasi pembayaran dari client',
        created_by_id: users[1]?.id || users[0]?.id
      },
      {
        invoice_number: 'INV-2025-003',
        client_name: 'PT. Teknologi Indonesia',
        issue_date: '2025-02-01',
        due_date: '2025-03-01',
        total_amount: 25000000,
        currency: 'IDR',
        description: 'Pengembangan software custom',
        status: 'INTERNAL_VALIDATION',
        position: 'AREA',
        work_region: 'SAMARINDA',
        notes: 'Sedang dalam proses validasi internal',
        created_by_id: users[2]?.id || users[0]?.id
      },
      {
        invoice_number: 'INV-2025-004',
        client_name: 'PT. Sukses Makmur',
        issue_date: '2025-02-05',
        due_date: '2025-03-05',
        total_amount: 12000000,
        currency: 'IDR',
        description: 'Maintenance sistem bulanan',
        status: 'SUBMITTED',
        position: 'REGIONAL',
        work_region: 'BALIKPAPAN',
        notes: 'Invoice telah dikirim ke client',
        created_by_id: users[3]?.id || users[0]?.id
      },
      {
        invoice_number: 'INV-2025-005',
        client_name: 'CV. Karya Mandiri',
        issue_date: '2025-02-10',
        due_date: '2025-03-10',
        total_amount: 7500000,
        currency: 'IDR',
        description: 'Jasa desain grafis',
        status: 'DRAFT',
        position: 'USER',
        work_region: 'TARAKAN',
        notes: 'Draft invoice, menunggu persetujuan',
        created_by_id: users[4]?.id || users[0]?.id
      },
      {
        invoice_number: 'INV-2025-006',
        client_name: 'PT. Global Solution',
        issue_date: '2024-12-15',
        due_date: '2025-01-15',
        total_amount: 18000000,
        currency: 'IDR',
        description: 'Implementasi sistem ERP',
        status: 'DELAYED',
        position: 'APM',
        work_region: 'SAMARINDA',
        notes: 'Pembayaran terlambat, sedang dalam proses follow-up',
        created_by_id: users[0]?.id
      },
      {
        invoice_number: 'INV-2025-007',
        client_name: 'PT. Digital Nusantara',
        issue_date: '2025-02-15',
        due_date: '2025-03-15',
        total_amount: 22000000,
        currency: 'IDR',
        description: 'Layanan cloud computing',
        status: 'SETTLED',
        position: 'TERBAYAR',
        work_region: 'BALIKPAPAN',
        notes: 'Pembayaran melalui virtual account',
        settlement_date: '2025-03-05',
        settlement_amount: 22000000,
        payment_method: 'Virtual Account',
        settlement_notes: 'Pembayaran diterima penuh',
        created_by_id: users[1]?.id
      },
      {
        invoice_number: 'INV-2025-008',
        client_name: 'CV. Inovasi Teknologi',
        issue_date: '2025-02-20',
        due_date: '2025-03-20',
        total_amount: 9500000,
        currency: 'IDR',
        description: 'Training dan pengembangan staff',
        status: 'AWAITING_PAYMENT',
        position: 'MITRA',
        work_region: 'TARAKAN',
        notes: 'Menunggu pembayaran dari client',
        created_by_id: users[2]?.id
      }
    ];

    // Insert invoices
    let successCount = 0;
    let errorCount = 0;

    for (const invoice of sampleInvoices) {
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoice)
        .select();

      if (error) {
        console.error(`❌ Error creating invoice ${invoice.invoice_number}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Successfully created invoice: ${invoice.invoice_number}`);
        successCount++;
      }
    }

    console.log(`\n🎉 Invoice creation completed!`);
    console.log(`✅ Success: ${successCount} invoices`);
    console.log(`❌ Errors: ${errorCount} invoices`);

    // Show summary
    const { data: allInvoices, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        invoice_number,
        client_name,
        total_amount,
        status,
        position,
        work_region,
        created_by:users!invoices_created_by_id_fkey (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (!fetchError && allInvoices) {
      console.log(`\n📊 Total invoices in database: ${allInvoices.length}`);
      
      // Group by status
      const statusCount = allInvoices.reduce((acc, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📈 Invoices by Status:');
      Object.entries(statusCount).forEach(([status, count]) => {
        const statusLabels = {
          'DRAFT': 'Draf',
          'SUBMITTED': 'Diajukan',
          'INTERNAL_VALIDATION': 'Validasi Internal',
          'AWAITING_PAYMENT': 'Menunggu Pembayaran',
          'SETTLED': 'Lunas',
          'DELAYED': 'Ditunda'
        };
        console.log(`   ${statusLabels[status] || status}: ${count}`);
      });

      // Group by work region
      const regionCount = allInvoices.reduce((acc, inv) => {
        acc[inv.work_region] = (acc[inv.work_region] || 0) + 1;
        return acc;
      }, {});

      console.log('\n🗺️  Invoices by Region:');
      Object.entries(regionCount).forEach(([region, count]) => {
        const regionLabels = {
          'TARAKAN': 'Kota Tarakan',
          'BALIKPAPAN': 'Balikpapan',
          'SAMARINDA': 'Samarinda'
        };
        console.log(`   ${regionLabels[region] || region}: ${count}`);
      });
    }

  } catch (error) {
    console.error('❌ Error creating sample invoices:', error.message);
    process.exit(1);
  }
}

// Run the script
createSampleInvoices();