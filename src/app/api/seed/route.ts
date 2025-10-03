import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Create sample users
    const adminUser = await db.user.upsert({
      where: { email: 'admin@company.com' },
      update: {},
      create: {
        email: 'admin@company.com',
        name: 'Admin User',
        role: 'ADMIN',
      },
    })

    const staffUser = await db.user.upsert({
      where: { email: 'staff@company.com' },
      update: {},
      create: {
        email: 'staff@company.com',
        name: 'Staff User',
        role: 'STAFF',
      },
    })

    // Create sample invoices
    const sampleInvoices = [
      {
        invoiceNumber: 'INV-202412-001',
        clientName: 'PT. Maju Bersama',
        issueDate: new Date('2024-12-01'),
        dueDate: new Date('2024-12-15'),
        totalAmount: 15000000,
        currency: 'IDR',
        description: 'Jasa konsultasi proyek website',
        status: 'SETTLED' as const,
        position: 'TERBAYAR' as const,
        workRegion: 'TARAKAN' as const,
        notes: 'Pembayaran lunas tepat waktu',
        settlementDate: new Date('2024-12-14'),
        settlementAmount: 15000000,
        paymentMethod: 'TRANSFER_BANK',
        settlementNotes: 'Transfer dari BCA ke BCA',
        createdById: adminUser.id,
      },
      {
        invoiceNumber: 'INV-202412-002',
        clientName: 'CV. Sukses Mandiri',
        issueDate: new Date('2024-12-05'),
        dueDate: new Date('2024-12-20'),
        totalAmount: 8500000,
        currency: 'IDR',
        description: 'Pengembangan aplikasi mobile',
        status: 'AWAITING_PAYMENT' as const,
        position: 'HEAD_OFFICE' as const,
        workRegion: 'BALIKPAPAN' as const,
        notes: 'Menunggu konfirmasi pembayaran dari klien',
        createdById: staffUser.id,
      },
      {
        invoiceNumber: 'INV-202412-003',
        clientName: 'PT. Teknologi Indonesia',
        issueDate: new Date('2024-12-10'),
        dueDate: new Date('2024-12-25'),
        totalAmount: 25000000,
        currency: 'IDR',
        description: 'Maintenance sistem ERP',
        status: 'INTERNAL_VALIDATION' as const,
        position: 'REGIONAL' as const,
        workRegion: 'SAMARINDA' as const,
        notes: 'Sedang dalam proses approval manajemen',
        createdById: adminUser.id,
      },
      {
        invoiceNumber: 'INV-202411-001',
        clientName: 'PT. Global Solusi',
        issueDate: new Date('2024-11-15'),
        dueDate: new Date('2024-11-30'),
        totalAmount: 12000000,
        currency: 'IDR',
        description: 'Design dan branding',
        status: 'DELAYED' as const,
        position: 'AREA' as const,
        workRegion: 'TARAKAN' as const,
        notes: 'Pembayaran ditunda karena revisi kontrak',
        createdById: staffUser.id,
      },
      {
        invoiceNumber: 'INV-202412-004',
        clientName: 'PT. Kreatif Digital',
        issueDate: new Date('2024-12-12'),
        dueDate: new Date('2024-12-27'),
        totalAmount: 18000000,
        currency: 'IDR',
        description: 'Digital marketing campaign',
        status: 'SUBMITTED' as const,
        position: 'USER' as const,
        workRegion: 'BALIKPAPAN' as const,
        notes: 'Tagihan telah dikirim ke klien',
        createdById: adminUser.id,
      },
      {
        invoiceNumber: 'INV-202412-005',
        clientName: 'CV. Inovasi Teknologi',
        issueDate: new Date('2024-12-08'),
        dueDate: new Date('2024-12-23'),
        totalAmount: 9500000,
        currency: 'IDR',
        description: 'Setup cloud infrastructure',
        status: 'DRAFT' as const,
        position: 'MITRA' as const,
        workRegion: 'SAMARINDA' as const,
        notes: 'Masih dalam proses finalisasi',
        createdById: staffUser.id,
      },
      {
        invoiceNumber: 'INV-202412-006',
        clientName: 'PT. FinTech Indonesia',
        issueDate: new Date('2024-12-11'),
        dueDate: new Date('2024-12-26'),
        totalAmount: 22000000,
        currency: 'IDR',
        description: 'Implementasi payment gateway',
        status: 'SUBMITTED' as const,
        position: 'APM' as const,
        workRegion: 'TARAKAN' as const,
        notes: 'Menunggu approval dari APM',
        createdById: adminUser.id,
      },
    ]

    for (const invoice of sampleInvoices) {
      await db.invoice.upsert({
        where: { invoiceNumber: invoice.invoiceNumber },
        update: invoice,
        create: invoice,
      })
    }

    return NextResponse.json({ 
      message: 'Sample data created successfully',
      users: [adminUser, staffUser],
      invoices: sampleInvoices.length,
    })
  } catch (error) {
    console.error('Error creating sample data:', error)
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    )
  }
}