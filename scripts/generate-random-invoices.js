#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Random data generators
const clients = [
  'PT. Maju Jaya', 'CV. Mitra Sejahtera', 'PT. Teknologi Digital', 'CV. Karya Mandiri',
  'PT. Global Solution', 'PT. Sukses Makmur', 'CV. Inovasi Teknologi', 'PT. Edukasi Nusantara',
  'PT. Energi Terbarukan', 'CV. Cipta Karya', 'PT. Media Digital', 'PT. Logistik Cepat',
  'CV. Makanan Sehat', 'PT. Edukasi Nusantara', 'CV. Kesehatan Prima', 'PT. Transportasi Indonesia'
];

const descriptions = [
  'Jasa konsultasi manajemen',
  'Pengadaan peralatan kantor',
  'Pengembangan software custom',
  'Maintenance sistem bulanan',
  'Jasa desain grafis',
  'Implementasi sistem ERP',
  'Layanan cloud computing',
  'Training dan pengembangan staff',
  'Pemasangan solar panel sistem',
  'Konstruksi bangunan kantor',
  'Jasa digital marketing',
  'Layanan pengiriman dan logistik',
  'Katering karyawan bulanan',
  'Platform e-learning development',
  'Peralatan medis dan kesehatan',
  'Jasa keamanan dan pengamanan'
];

const statuses = ['DRAFT', 'SUBMITTED', 'INTERNAL_VALIDATION', 'AWAITING_PAYMENT', 'SETTLED', 'DELAYED'];
const positions = ['MITRA', 'USER', 'AREA', 'REGIONAL', 'HEAD_OFFICE', 'APM', 'TERBAYAR'];
const regions = ['TARAKAN', 'BALIKPAPAN', 'SAMARINDA'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomAmount(min = 5000000, max = 35000000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
  return randomDate.toISOString().split('T')[0];
}

async function generateRandomInvoices(count = 5) {
  try {
    console.log(`🔧 Generating ${count} random invoices...\n`);

    // Get users for assignment
    const { data: users } = await supabase
      .from('users')
      .select('id, name')
      .limit(5);

    if (!users || users.length === 0) {
      console.error('❌ No users found for invoice assignment');
      return;
    }

    const creatorId = users[0].id;

    // Get existing invoice numbers to avoid duplicates
    const { data: existingInvoices } = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (existingInvoices && existingInvoices.length > 0) {
      const lastInvoice = existingInvoices[0].invoice_number;
      const lastNumber = parseInt(lastInvoice.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    const invoices = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < count; i++) {
      const invoiceNumber = `INV-${currentYear}-${String(nextNumber + i).padStart(3, '0')}`;
      const issueDate = getRandomDate('2025-01-01', '2025-03-31');
      const dueDate = getRandomDate(
        new Date(issueDate).getTime() + 15 * 24 * 60 * 60 * 1000, // 15 days after issue
        new Date(issueDate).getTime() + 60 * 24 * 60 * 60 * 1000  // 60 days after issue
      );
      
      const status = getRandomElement(statuses);
      const totalAmount = getRandomAmount();
      
      let settlementDate = null;
      let settlementAmount = null;
      let paymentMethod = null;
      let settlementNotes = null;
      
      if (status === 'SETTLED') {
        settlementDate = getRandomDate(dueDate, new Date());
        settlementAmount = totalAmount; // Full payment for simplicity
        paymentMethod = getRandomElement(['Transfer Bank', 'Virtual Account', 'Tunai', 'Cek']);
        settlementNotes = 'Pembayaran diterima penuh';
      }

      const invoice = {
        invoice_number: invoiceNumber,
        client_name: getRandomElement(clients),
        issue_date: issueDate,
        due_date: dueDate,
        total_amount: totalAmount,
        currency: 'IDR',
        description: getRandomElement(descriptions),
        status: status,
        position: getRandomElement(positions),
        work_region: getRandomElement(regions),
        notes: status === 'SETTLED' ? 'Lunas' : status === 'DELAYED' ? 'Pembayaran terlambat' : 'Sedang diproses',
        settlement_date: settlementDate,
        settlement_amount: settlementAmount,
        payment_method: paymentMethod,
        settlement_notes: settlementNotes,
        created_by_id: creatorId
      };

      invoices.push(invoice);
    }

    // Insert invoices
    let successCount = 0;
    let errorCount = 0;

    for (const invoice of invoices) {
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoice)
        .select();

      if (error) {
        console.error(`❌ Error creating invoice ${invoice.invoice_number}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Created invoice: ${invoice.invoice_number} - ${invoice.client_name}`);
        console.log(`   Amount: Rp ${invoice.total_amount.toLocaleString('id-ID')}`);
        console.log(`   Status: ${invoice.status} | Position: ${invoice.position}`);
        successCount++;
      }
    }

    console.log(`\n🎉 Random invoice generation completed!`);
    console.log(`✅ Success: ${successCount} invoices`);
    console.log(`❌ Errors: ${errorCount} invoices`);

    // Show updated totals
    const { data: allInvoices } = await supabase
      .from('invoices')
      .select('total_amount, status');

    if (allInvoices) {
      const totalAmount = allInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
      const statusCount = allInvoices.reduce((acc, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1;
        return acc;
      }, {});

      console.log(`\n📊 Updated Database Summary:`);
      console.log(`   Total Invoices: ${allInvoices.length}`);
      console.log(`   Total Value: Rp ${totalAmount.toLocaleString('id-ID')}`);
      console.log(`   Status Breakdown:`);
      
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`     ${status}: ${count}`);
      });
    }

  } catch (error) {
    console.error('❌ Error generating random invoices:', error.message);
    process.exit(1);
  }
}

// Get count from command line arguments or default to 5
const count = parseInt(process.argv[2]) || 5;

console.log(`🎲 Random Invoice Generator`);
console.log(`============================`);
console.log(`Generating ${count} random invoices...\n`);

generateRandomInvoices(count);