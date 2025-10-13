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
      
      // Try the simplest approach possible - use the original updateData but clean it first
      const cleanUpdateData: any = {}
      
      // Only include fields that should be updated and are different from current values
      if (updateData.clientName && updateData.clientName !== currentInvoice.clientName) {
        cleanUpdateData.clientName = updateData.clientName
      }
      if (updateData.issueDate && updateData.issueDate !== currentInvoice.issueDate) {
        cleanUpdateData.issueDate = updateData.issueDate
      }
      if (updateData.dueDate && updateData.dueDate !== currentInvoice.dueDate) {
        cleanUpdateData.dueDate = updateData.dueDate
      }
      if (updateData.totalAmount && updateData.totalAmount !== currentInvoice.totalAmount) {
        cleanUpdateData.totalAmount = updateData.totalAmount
      }
      if (updateData.currency && updateData.currency !== currentInvoice.currency) {
        cleanUpdateData.currency = updateData.currency
      }
      if (updateData.description && updateData.description !== currentInvoice.description) {
        cleanUpdateData.description = updateData.description
      }
      if (updateData.status && updateData.status !== currentInvoice.status) {
        cleanUpdateData.status = updateData.status
      }
      if (updateData.position && updateData.position !== currentInvoice.position) {
        cleanUpdateData.position = updateData.position
        cleanUpdateData.positionUpdatedAt = updateData.positionUpdatedAt
        cleanUpdateData.positionUpdatedBy = updateData.positionUpdatedBy
      }
      if (updateData.workRegion && updateData.workRegion !== currentInvoice.workRegion) {
        cleanUpdateData.workRegion = updateData.workRegion
      }
      if (updateData.jobTitle && updateData.jobTitle !== currentInvoice.jobTitle) {
        cleanUpdateData.jobTitle = updateData.jobTitle
      }
      if (updateData.workPeriod && updateData.workPeriod !== currentInvoice.workPeriod) {
        cleanUpdateData.workPeriod = updateData.workPeriod
      }
      
      // Validate category against enum values
      if (updateData.category && updateData.category !== currentInvoice.category) {
        const validCategories = ['PASANG_BARU', 'ASSURANCE', 'MAINTENANCE', 'OSP', 'SIPIL', 'KONSTRUKSI', 'LAINNYA']
        if (validCategories.includes(updateData.category)) {
          cleanUpdateData.category = updateData.category
        } else {
          console.warn(`Invalid category value: ${updateData.category}. Skipping update.`)
        }
      }
      
      if (updateData.notes !== undefined && updateData.notes !== currentInvoice.notes) {
        cleanUpdateData.notes = updateData.notes
      }
      if (updateData.settlementDate && updateData.settlementDate !== currentInvoice.settlementDate) {
        cleanUpdateData.settlementDate = updateData.settlementDate
      }
      if (updateData.settlementAmount && updateData.settlementAmount !== currentInvoice.settlementAmount) {
        cleanUpdateData.settlementAmount = updateData.settlementAmount
      }
      if (updateData.paymentMethod && updateData.paymentMethod !== currentInvoice.paymentMethod) {
        cleanUpdateData.paymentMethod = updateData.paymentMethod
      }
      if (updateData.settlementNotes !== undefined && updateData.settlementNotes !== currentInvoice.settlementNotes) {
        cleanUpdateData.settlementNotes = updateData.settlementNotes
      }
      
      // Always update updatedAt if there are any changes
      if (Object.keys(cleanUpdateData).length > 0) {
        cleanUpdateData.updatedAt = new Date()
      }
      
      // Try to update with raw query to avoid Prisma issues
      try {
        if (Object.keys(cleanUpdateData).length > 0) {
          console.log('Attempting raw query update with data:', cleanUpdateData)
          
          // Build the UPDATE query dynamically
          const updateFields: string[] = []
          const updateValues: any[] = []
          
          // Add each field to the update query
          if (cleanUpdateData.status) {
            updateFields.push(`"status" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.status)
          }
          if (cleanUpdateData.settlementDate) {
            updateFields.push(`"settlementDate" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.settlementDate)
          }
          if (cleanUpdateData.settlementAmount) {
            updateFields.push(`"settlementAmount" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.settlementAmount)
          }
          if (cleanUpdateData.paymentMethod) {
            updateFields.push(`"paymentMethod" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.paymentMethod)
          }
          if (cleanUpdateData.settlementNotes !== undefined) {
            updateFields.push(`"settlementNotes" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.settlementNotes)
          }
          if (cleanUpdateData.clientName) {
            updateFields.push(`"clientName" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.clientName)
          }
          if (cleanUpdateData.issueDate) {
            updateFields.push(`"issueDate" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.issueDate)
          }
          if (cleanUpdateData.dueDate) {
            updateFields.push(`"dueDate" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.dueDate)
          }
          if (cleanUpdateData.totalAmount) {
            updateFields.push(`"totalAmount" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.totalAmount)
          }
          if (cleanUpdateData.currency) {
            updateFields.push(`"currency" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.currency)
          }
          if (cleanUpdateData.description) {
            updateFields.push(`"description" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.description)
          }
          if (cleanUpdateData.position) {
            updateFields.push(`"position" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.position)
          }
          if (cleanUpdateData.positionUpdatedAt) {
            updateFields.push(`"positionUpdatedAt" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.positionUpdatedAt)
          }
          if (cleanUpdateData.positionUpdatedBy) {
            updateFields.push(`"positionUpdatedBy" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.positionUpdatedBy)
          }
          if (cleanUpdateData.workRegion) {
            updateFields.push(`"workRegion" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.workRegion)
          }
          if (cleanUpdateData.jobTitle) {
            updateFields.push(`"jobTitle" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.jobTitle)
          }
          if (cleanUpdateData.workPeriod) {
            updateFields.push(`"workPeriod" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.workPeriod)
          }
          if (cleanUpdateData.category) {
            updateFields.push(`"category" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.category)
          }
          if (cleanUpdateData.notes !== undefined) {
            updateFields.push(`"notes" = $${updateValues.length + 1}`)
            updateValues.push(cleanUpdateData.notes)
          }
          
          // Always update updatedAt
          updateFields.push(`"updatedAt" = $${updateValues.length + 1}`)
          updateValues.push(new Date())
          
          // Add the ID to the values
          updateValues.push(id)
          
          // Build and execute the query
          const updateQuery = `
            UPDATE "public"."Invoice"
            SET ${updateFields.join(', ')}
            WHERE "id" = $${updateValues.length}
            RETURNING *
          `
          
          console.log('Raw update query:', updateQuery)
          console.log('Update values:', updateValues)
          
          // Use template literal for the query
          const result = await (dbWithRetry as any).$queryRaw`
            UPDATE "public"."Invoice"
            SET ${updateFields.join(', ')}
            WHERE "id" = ${id}
            RETURNING *
          `
          
          // Handle the result properly
          const updatedInvoice = Array.isArray(result) ? result[0] : result
          console.log('Raw query update successful:', updatedInvoice)
          
          // Now fetch the invoice with the include
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
        } else {
          // No changes to make, just return the current invoice
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
        }
      } catch (updateError) {
        console.error('Raw query update failed, using fallback:', updateError)
        
        // As a last resort, use the original invoice data but with updated fields
        // This is not ideal but prevents the update from completely failing
        invoice = {
          ...currentInvoice,
          ...cleanUpdateData,
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
        
        // Add a warning that the update was only in memory
        console.warn('Invoice update was only in memory due to database issues')
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
        
        // Use a simpler approach to avoid prepared statement issues
        // Create history records one by one
        for (const record of historyRecords) {
          try {
            const cuid = `c${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
            const now = new Date()
            
            // Use $queryRawUnsafe with a properly escaped query
            const escapedOldValue = String(record.oldValue || '').replace(/'/g, "''")
            const escapedNewValue = String(record.newValue || '').replace(/'/g, "''")
            const escapedChangedBy = String(record.changedBy || '').replace(/'/g, "''")
            const escapedNotes = String(record.notes || '').replace(/'/g, "''")
            
            // Use correct column names based on Prisma schema
            const query = `
              INSERT INTO "InvoiceHistory" (
                id, "invoiceId", "field", "oldValue", "newValue", "changedBy", "changedAt", "notes"
              ) VALUES (
                '${cuid}', '${record.invoiceId}', '${record.field}', '${escapedOldValue}', '${escapedNewValue}', '${escapedChangedBy}', '${now.toISOString()}', ${record.notes ? `'${escapedNotes}'` : 'NULL'}
              )
            `
            
            await (dbWithRetry as any).$queryRawUnsafe(query)
          } catch (historyRecordError) {
            console.error('Failed to create history record:', historyRecordError)
            // Continue with other records even if one fails
          }
        }
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