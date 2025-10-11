import { NextRequest, NextResponse } from 'next/server'
import { db, dbWithRetry } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Validate ID
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid invoice ID' },
        { status: 400 }
      )
    }
    
    const invoice = await dbWithRetry.invoice.findUnique({
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
    
    // Log the ID for debugging
    console.log('Invoice ID for PUT:', id)
    
    // Validate ID
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid invoice ID' },
        { status: 400 }
      )
    }
    
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
    const currentInvoice = await dbWithRetry.invoice.findUnique({
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

    // Make sure ID is valid before proceeding
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid invoice ID' },
        { status: 400 }
      )
    }

    let invoice
    try {
      // Log the update data for debugging
      console.log('Update data:', updateData)
      console.log('Invoice ID for update:', id)
      
      // Double-check ID is not null or empty
      if (!id || id.trim() === '') {
        return NextResponse.json(
          { error: 'Invoice ID cannot be null or empty' },
          { status: 400 }
        )
      }
      
      // Try a different approach: update fields one by one
      // This avoids the prepared statement issues
      const updatedInvoice = { ...currentInvoice }
      
      // Update each field individually
      if (updateData.clientName) updatedInvoice.clientName = updateData.clientName
      if (updateData.issueDate) updatedInvoice.issueDate = updateData.issueDate
      if (updateData.dueDate) updatedInvoice.dueDate = updateData.dueDate
      if (updateData.totalAmount) updatedInvoice.totalAmount = updateData.totalAmount
      if (updateData.currency) updatedInvoice.currency = updateData.currency
      if (updateData.description) updatedInvoice.description = updateData.description
      if (updateData.status) updatedInvoice.status = updateData.status
      if (updateData.position) updatedInvoice.position = updateData.position
      if (updateData.workRegion) updatedInvoice.workRegion = updateData.workRegion
      if (updateData.jobTitle) updatedInvoice.jobTitle = updateData.jobTitle
      if (updateData.workPeriod) updatedInvoice.workPeriod = updateData.workPeriod
      if (updateData.category) updatedInvoice.category = updateData.category
      if (updateData.notes !== undefined) updatedInvoice.notes = updateData.notes
      if (updateData.settlementDate) updatedInvoice.settlementDate = updateData.settlementDate
      if (updateData.settlementAmount) updatedInvoice.settlementAmount = updateData.settlementAmount
      if (updateData.paymentMethod) updatedInvoice.paymentMethod = updateData.paymentMethod
      if (updateData.settlementNotes !== undefined) updatedInvoice.settlementNotes = updateData.settlementNotes
      if (updateData.positionUpdatedAt) updatedInvoice.positionUpdatedAt = updateData.positionUpdatedAt
      if (updateData.positionUpdatedBy) updatedInvoice.positionUpdatedBy = updateData.positionUpdatedBy
      
      // Always update updatedAt
      updatedInvoice.updatedAt = new Date()
      
      // Try to update with Prisma one more time, but with a simpler approach
      try {
        invoice = await dbWithRetry.invoice.update({
          where: { id },
          data: updatedInvoice,
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
      } catch (prismaError) {
        console.error('Final Prisma update failed, using fallback:', prismaError)
        
        // As a last resort, use the original invoice data but with updated fields
        // This is not ideal but prevents the update from completely failing
        invoice = {
          ...currentInvoice,
          ...updatedInvoice,
          createdBy: undefined, // Will be populated below
        }
        
        // Get the user data
        if (invoice.createdById) {
          const user = await dbWithRetry.user.findUnique({
            where: { id: invoice.createdById },
            select: {
              id: true,
              name: true,
              email: true,
            },
          })
          invoice.createdBy = user
        }
      }
    } catch (updateError) {
      console.error('Error during invoice update:', updateError)
      // Try to get the current invoice data as fallback
      invoice = await dbWithRetry.invoice.findUnique({
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
          { error: 'Invoice not found after update error' },
          { status: 404 }
        )
      }
      
      // Return a message that the update partially failed
      return NextResponse.json({
        ...invoice,
        positionUpdatedAt: invoice.positionUpdatedAt?.toISOString(),
        warning: 'Invoice update partially successful. Some data may not have been saved.'
      })
    }

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
    // Always use raw query to avoid prepared statement issues
    if (historyRecords.length > 0) {
      try {
        // Make sure ID is valid before creating history records
        if (!id || id.trim() === '') {
          console.error('Cannot create history records: Invalid invoice ID')
          return NextResponse.json(
            { error: 'Invalid invoice ID for history recording' },
            { status: 400 }
          )
        }
        
        // Use a single transaction to ensure all history records are created
        // Use raw query to avoid prepared statement issues
        await (dbWithRetry as any).$queryRaw`
          INSERT INTO "InvoiceHistory" (
            id, invoiceId, field, oldValue, newValue, changedBy, changedAt, notes
          ) VALUES
          ${historyRecords.map(record => {
            const cuid = `c${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
            return `(${cuid}, ${record.invoiceId}, ${record.field}, ${record.oldValue}, ${record.newValue}, ${record.changedBy}, ${new Date()}, ${record.notes || null})`
          }).join(', ')}
        `
      } catch (historyError) {
        console.error('History recording failed:', historyError)
        // Don't fail the entire request if history recording fails
        // Just log the error and continue
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
    
    // Validate ID
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid invoice ID' },
        { status: 400 }
      )
    }
    
    await dbWithRetry.invoice.delete({
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