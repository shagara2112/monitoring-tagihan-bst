#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createMoreInvoices() {
  try {
    console.log('🔧 Creating additional sample invoices...\n');

    // Get users for assignment
    const { data: users } = await supabase
      .from('users')
      .select('id, name')
      .limit(3);

    const creatorId = users[0]?.id;

    // Additional invoice data with more variety
    const additionalInvoices = [
      {
        invoice_number: 'INV-2025-009',
        client_name: 'PT. Energi Terbarukan',
        issue_date: '2025-03-01',
        due_date: '2025-04-01',
        total_amount: 35000000,
        currency: 'IDR',
        description: 'Pemasangan solar panel sistem',
        status: 'SUBMITTED',
        position: 'HEAD_OFFICE',
        work_region: 'BALIKPAPAN',
        notes: 'Proyek energi hijau',
        created_by_id: creatorId
      },
      {
        invoice_number: 'INV-2025-010',
        client_name: 'CV. Cipta Karya',
        issue_date: '2025-03-05',
        due_date: '2025-04-05',
        total_amount: 12500000,
        currency: 'IDR',
        description: 'Konstruksi bangunan kantor',
        status: 'INTERNAL_VALIDATION',
        position: 'AREA',
        work_region: 'SAMARINDA',
        notes: 'Sedang diverifikasi oleh tim finance',
        created_by_id: creatorId
      },
      {
        invoice_number: 'INV-2025-011',
        client_name: 'PT. Media Digital',
        issue_date: '2025-03-10',
        due_date: '2025-04-10',
        total_amount: 8750000,
        currency: 'IDR',
        description: 'Jasa digital marketing',
        status: 'AWAITING_PAYMENT',
        position: 'REGIONAL',
        work_region: 'TARAKAN',
        notes: 'Campaign Q1 2025',
        created_by_id: creatorId
      },
      {
        invoice_number: 'INV-2025-012',
        client_name: 'PT. Logistik Cepat',
        issue_date: '2025-03-12',
        due_date: '2025-04-12',
        total_amount: 18500000,
        currency: 'IDR',
        description: 'Layanan pengiriman dan logistik',
        status: 'SETTLED',
        position: 'TERBAYAR',
        work_region: 'BALIKPAPAN',
        notes: 'Pembayaran via transfer BNI',
        settlement_date: '2025-04-05',
        settlement_amount: 18500000,
        payment_method: 'Transfer BNI',
        settlement_notes: 'Pembayaran diterima',
        created_by_id: creatorId
      },
      {
        invoice_number: 'INV-2025-013',
        client_name: 'CV. Makanan Sehat',
        issue_date: '2025-03-15',
        due_date: '2025-04-15',
        total_amount: 6500000,
        currency: 'IDR',
        description: 'Katering karyawan bulan Maret',
        status: 'DRAFT',
        position: 'USER',
        work_region: 'SAMARINDA',
        notes: 'Menunggu persetujuan manager',
        created_by_id: creatorId
      },
      {
        invoice_number: 'INV-2025-014',
        client_name: 'PT. Edukasi Nusantara',
        issue_date: '2025-03-18',
        due_date: '2025-04-18',
        total_amount: 28000000,
        currency: 'IDR',
        description: 'Platform e-learning development',
        status: 'SUBMITTED',
        position: 'MITRA',
        work_region: 'TARAKAN',
        notes: 'Invoice untuk tahap 2 proyek',
        created_by_id: creatorId
      },
      {
        invoice_number: 'INV-2025-015',
        client_name: 'CV. Kesehatan Prima',
        issue_date: '2025-03-20',
        due_date: '2025-04-20',
        total_amount: 11200000,
        currency: 'IDR',
        description: 'Peralatan medis dan kesehatan',
        status: 'AWAITING_PAYMENT',
        position: 'APM',
        work_region: 'BALIKPAPAN',
        notes: 'Menunggu pembayaran dari BPJS',
        created_by_id: creatorId
      }
    ];

    // Insert additional invoices
    let successCount = 0;
    let errorCount = 0;

    for (const invoice of additionalInvoices) {
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

    console.log(`\n🎉 Additional invoices created!`);
    console.log(`✅ Success: ${successCount} invoices`);
    console.log(`❌ Errors: ${errorCount} invoices`);

    // Show final summary
    const { data: allInvoices } = await supabase
      .from('invoices')
      .select(`
        invoice_number,
        client_name,
        total_amount,
        status,
        position,
        work_region,
        issue_date,
        due_date
      `)
      .order('created_at', { ascending: false });

    if (allInvoices) {
      console.log(`\n📊 Total invoices in database: ${allInvoices.length}`);
      
      // Calculate total amount
      const totalAmount = allInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
      console.log(`💰 Total invoice value: Rp ${totalAmount.toLocaleString('id-ID')}`);

      // Status breakdown
      const statusCount = allInvoices.reduce((acc, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📈 Complete Status Breakdown:');
      const statusLabels = {
        'DRAFT': '📝 Draf',
        'SUBMITTED': '📤 Diajukan',
        'INTERNAL_VALIDATION': '🔍 Validasi Internal',
        'AWAITING_PAYMENT': '⏳ Menunggu Pembayaran',
        'SETTLED': '✅ Lunas',
        'DELAYED': '⚠️ Ditunda'
      };
      
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   ${statusLabels[status] || status}: ${count}`);
      });

      // Position breakdown
      const positionCount = allInvoices.reduce((acc, inv) => {
        acc[inv.position] = (acc[inv.position] || 0) + 1;
        return acc;
      }, {});

      console.log('\n🏢 Invoices by Position:');
      const positionLabels = {
        'MITRA': '🤝 Mitra',
        'USER': '👤 User',
        'AREA': '📍 Area',
        'REGIONAL': '🌐 Regional',
        'HEAD_OFFICE': '🏢 Head Office',
        'APM': '📋 APM',
        'TERBAYAR': '💰 Terbayar'
      };
      
      Object.entries(positionCount).forEach(([position, count]) => {
        console.log(`   ${positionLabels[position] || position}: ${count}`);
      });

      // Show recent invoices
      console.log('\n📋 Recent Invoices (Last 5):');
      allInvoices.slice(0, 5).forEach((inv, index) => {
        console.log(`   ${index + 1}. ${inv.invoice_number} - ${inv.client_name}`);
        console.log(`      Rp ${inv.total_amount.toLocaleString('id-ID')} - ${statusLabels[inv.status] || inv.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error creating additional invoices:', error.message);
    process.exit(1);
  }
}

// Run the script
createMoreInvoices();