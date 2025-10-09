import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, isManagerOrAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch invoices with creator information using Prisma
    const invoices = await db.invoice.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform the data to match the expected format
    const transformedInvoices = invoices.map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientName,
      issueDate: inv.issueDate.toISOString(),
      dueDate: inv.dueDate.toISOString(),
      totalAmount: inv.totalAmount,
      currency: inv.currency,
      description: inv.description,
      status: inv.status,
      position: inv.position || 'MITRA',
      workRegion: inv.workRegion || 'TARAKAN',
      jobTitle: (inv as any).jobTitle,
      workPeriod: (inv as any).workPeriod,
      category: (inv as any).category,
      notes: inv.notes,
      settlementDate: inv.settlementDate?.toISOString(),
      settlementAmount: inv.settlementAmount,
      paymentMethod: inv.paymentMethod,
      settlementNotes: inv.settlementNotes,
      positionUpdatedAt: inv.positionUpdatedAt?.toISOString(),
      positionUpdatedBy: inv.positionUpdatedBy,
      createdAt: inv.createdAt.toISOString(),
      updatedAt: inv.updatedAt.toISOString(),
      createdBy: inv.createdBy,
    }))

    // Calculate statistics
    const totalInvoices = transformedInvoices.length
    const settledInvoices = transformedInvoices.filter(inv => inv.status === 'SETTLED').length
    const pendingInvoices = transformedInvoices.filter(inv => 
      inv.status === 'SUBMITTED' || 
      inv.status === 'INTERNAL_VALIDATION' || 
      inv.status === 'AWAITING_PAYMENT'
    ).length
    const overdueInvoices = transformedInvoices.filter(inv => 
      new Date(inv.dueDate) < new Date() && 
      inv.status !== 'SETTLED' && 
      inv.status !== 'DRAFT'
    ).length

    const totalAmount = transformedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
    const settledAmount = transformedInvoices
      .filter(inv => inv.status === 'SETTLED')
      .reduce((sum, inv) => sum + (inv.settlementAmount || inv.totalAmount), 0)
    const pendingAmount = transformedInvoices
      .filter(inv => inv.status !== 'SETTLED')
      .reduce((sum, inv) => sum + inv.totalAmount, 0)

    const stats = {
      totalInvoices,
      totalPositions: totalInvoices,
      settledInvoices,
      pendingInvoices,
      overdueInvoices,
      totalAmount,
      settledAmount,
      pendingAmount,
    }

    return NextResponse.json({
      invoices: transformedInvoices,
      stats,
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      invoiceNumber,
      clientName,
      issueDate,
      dueDate,
      totalAmount,
      currency = 'IDR',
      description,
      status = 'DRAFT',
      position = 'MITRA',
      workRegion = 'TARAKAN',
      jobTitle,
      workPeriod,
      category,
      notes,
    } = body

    // Validate required fields
    if (!invoiceNumber || !clientName || !issueDate || !dueDate || !totalAmount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if invoice number already exists using Prisma
    const existingInvoice = await db.invoice.findUnique({
      where: {
        invoiceNumber: invoiceNumber,
      },
    })

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice number already exists' },
        { status: 400 }
      )
    }

    // Create new invoice using Prisma
    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        clientName,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        totalAmount: parseFloat(totalAmount),
        currency,
        description,
        status,
        position,
        workRegion,
        ...(jobTitle && { jobTitle }),
        ...(workPeriod && { workPeriod }),
        ...(category && { category }),
        notes,
        createdById: user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Transform the response to match expected format
    const transformedInvoice = {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      totalAmount: invoice.totalAmount,
      currency: invoice.currency,
      description: invoice.description,
      status: invoice.status,
      position: invoice.position,
      workRegion: invoice.workRegion,
      jobTitle: (invoice as any).jobTitle,
      workPeriod: (invoice as any).workPeriod,
      category: (invoice as any).category,
      notes: invoice.notes,
      settlementDate: invoice.settlementDate?.toISOString(),
      settlementAmount: invoice.settlementAmount,
      paymentMethod: invoice.paymentMethod,
      settlementNotes: invoice.settlementNotes,
      positionUpdatedAt: invoice.positionUpdatedAt?.toISOString(),
      positionUpdatedBy: invoice.positionUpdatedBy,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
      createdBy: (invoice as any).createdBy,
    }

    return NextResponse.json(transformedInvoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}