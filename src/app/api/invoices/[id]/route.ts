import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const invoice = await db.invoice.findUnique({
      where: { id },
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

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...invoice,
      positionUpdatedAt: invoice.positionUpdatedAt?.toISOString(),
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const {
      clientName,
      issueDate,
      dueDate,
      totalAmount,
      currency,
      description,
      status,
      position,
      workRegion,
      jobTitle,
      workPeriod,
      category,
      notes,
      // Settlement information
      settlementDate,
      settlementAmount,
      paymentMethod,
      settlementNotes,
    } = body

    // Get current invoice to check for changes
    const currentInvoice = await db.invoice.findUnique({
      where: { id },
    })

    if (!currentInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Update invoice
    const updateData: any = {
      ...(clientName && { clientName }),
      ...(issueDate && { issueDate: new Date(issueDate) }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(totalAmount && { totalAmount: parseFloat(totalAmount) }),
      ...(currency && { currency }),
      ...(description && { description }),
      ...(workRegion && { workRegion }),
      ...(jobTitle && { jobTitle: (jobTitle as string) }),
      ...(workPeriod && { workPeriod: (workPeriod as string) }),
      ...(category && { category }),
      ...(notes !== undefined && { notes }),
      // Settlement fields
      ...(settlementDate && { settlementDate: new Date(settlementDate) }),
      ...(settlementAmount && { settlementAmount: parseFloat(settlementAmount) }),
      ...(paymentMethod && { paymentMethod }),
      ...(settlementNotes !== undefined && { settlementNotes }),
    }

    // Handle status change
    if (status && status !== currentInvoice.status) {
      updateData.status = status
    }

    // Handle position change
    if (position && position !== currentInvoice.position) {
      updateData.position = position
      updateData.positionUpdatedAt = new Date()
      updateData.positionUpdatedBy = user.name || user.email
    }

    const invoice = await db.invoice.update({
      where: { id },
      data: updateData,
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

    // Create history records for status and position changes
    const historyRecords: any[] = []

    // Add status change history
    if (status && status !== currentInvoice.status) {
      historyRecords.push({
        invoiceId: id,
        field: 'status',
        oldValue: currentInvoice.status,
        newValue: status,
        changedBy: user.name || user.email,
        notes: notes || null,
      })
    }

    // Add position change history
    if (position && position !== currentInvoice.position) {
      historyRecords.push({
        invoiceId: id,
        field: 'position',
        oldValue: currentInvoice.position,
        newValue: position,
        changedBy: user.name || user.email,
        notes: notes || null,
      })
    }

    // Create history records if there are changes
    if (historyRecords.length > 0) {
      try {
        // Try to use Prisma if available
        await (db as any).invoiceHistory.createMany({
          data: historyRecords,
        })
      } catch (error) {
        // If Prisma client doesn't have the InvoiceHistory model yet,
        // use raw query
        try {
          for (const record of historyRecords) {
            await db.$queryRaw`
              INSERT INTO "InvoiceHistory" (
                id, invoiceId, field, oldValue, newValue, changedBy, changedAt, notes
              ) VALUES (
                ${`cmgfzbzj${Math.random().toString(36).substring(2, 15)}`},
                ${record.invoiceId},
                ${record.field},
                ${record.oldValue},
                ${record.newValue},
                ${record.changedBy},
                ${new Date()},
                ${record.notes || null}
              )
            `
          }
        } catch (rawError) {
          console.log('History recording failed:', rawError)
        }
      }
    }

    return NextResponse.json({
      ...invoice,
      positionUpdatedAt: invoice.positionUpdatedAt?.toISOString(),
    })
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.invoice.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}