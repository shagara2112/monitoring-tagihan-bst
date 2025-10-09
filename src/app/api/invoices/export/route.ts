import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const client = searchParams.get('client')
    const position = searchParams.get('position')
    const workRegion = searchParams.get('workRegion')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause based on filters
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (client && client !== 'all') {
      where.clientName = client
    }
    
    if (position && position !== 'all') {
      where.position = position
    }
    
    if (workRegion && workRegion !== 'all') {
      where.workRegion = workRegion
    }
    
    if (startDate || endDate) {
      where.issueDate = {}
      if (startDate) {
        where.issueDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.issueDate.lte = new Date(endDate)
      }
    }

    const invoices = await db.invoice.findMany({
      where,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        issueDate: 'desc',
      },
    })

    // Convert to CSV
    const headers = [
      'Nomor Tagihan',
      'Klien',
      'Nama Pekerjaan',
      'Periode Pekerjaan',
      'Tanggal Terbit',
      'Tanggal Jatuh Tempo',
      'Jumlah',
      'Mata Uang',
      'Deskripsi',
      'Status',
      'Posisi',
      'Wilayah Kerja',
      'Catatan',
      'Tanggal Pencairan',
      'Jumlah Diterima',
      'Metode Pembayaran',
      'Catatan Pencairan',
      'Dibuat Oleh',
    ]

    const csvRows = [
      headers.join(','),
      ...invoices.map(invoice => [
        invoice.invoiceNumber,
        `"${invoice.clientName}"`,
        `"${(invoice as any).jobTitle || ''}"`,
        `"${(invoice as any).workPeriod || ''}"`,
        invoice.issueDate.toISOString().split('T')[0],
        invoice.dueDate.toISOString().split('T')[0],
        invoice.totalAmount.toString(),
        invoice.currency,
        `"${invoice.description}"`,
        statusLabels[invoice.status as keyof typeof statusLabels],
        positionLabels[invoice.position as keyof typeof positionLabels],
        workRegionLabels[invoice.workRegion as keyof typeof workRegionLabels],
        `"${invoice.notes || ''}"`,
        invoice.settlementDate ? invoice.settlementDate.toISOString().split('T')[0] : '',
        invoice.settlementAmount?.toString() || '',
        `"${invoice.paymentMethod || ''}"`,
        `"${invoice.settlementNotes || ''}"`,
        `"${invoice.createdBy.name || invoice.createdBy.email}"`,
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="invoices_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting invoices:', error)
    return NextResponse.json(
      { error: 'Failed to export invoices' },
      { status: 500 }
    )
  }
}

const statusLabels = {
  DRAFT: 'Draf',
  SUBMITTED: 'Diajukan ke Klien',
  INTERNAL_VALIDATION: 'Validasi Internal',
  AWAITING_PAYMENT: 'Menunggu Pembayaran',
  SETTLED: 'Lunas',
  DELAYED: 'Ditunda/Bermasalah',
}

const positionLabels = {
  MITRA: 'Mitra',
  USER: 'User',
  AREA: 'Area',
  REGIONAL: 'Regional',
  HEAD_OFFICE: 'Head Office',
  APM: 'APM',
  TERBAYAR: 'Terbayar',
}

const workRegionLabels = {
  TARAKAN: 'Kota Tarakan',
  BALIKPAPAN: 'Balikpapan',
  SAMARINDA: 'Samarinda',
}