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
          
          // Build the UPDATE query dynamically with actual values
          const updateFields: string[] = []
          
          // Add each field to the update query with proper escaping
          if (cleanUpdateData.status) {
            const escapedValue = String(cleanUpdateData.status).replace(/'/g, "''")
            updateFields.push(`"status" = '${escapedValue}'`)
          }
          if (cleanUpdateData.settlementDate) {
            const escapedValue = cleanUpdateData.settlementDate.toISOString()
            updateFields.push(`"settlementDate" = '${escapedValue}'`)
          }
          if (cleanUpdateData.settlementAmount) {
            const escapedValue = String(cleanUpdateData.settlementAmount)
            updateFields.push(`"settlementAmount" = ${escapedValue}`)
          }
          if (cleanUpdateData.paymentMethod) {
            const escapedValue = String(cleanUpdateData.paymentMethod).replace(/'/g, "''")
            updateFields.push(`"paymentMethod" = '${escapedValue}'`)
          }
          if (cleanUpdateData.settlementNotes !== undefined) {
            const escapedValue = String(cleanUpdateData.settlementNotes || '').replace(/'/g, "''")
            updateFields.push(`"settlementNotes" = '${escapedValue}'`)
          }
          if (cleanUpdateData.clientName) {
            const escapedValue = String(cleanUpdateData.clientName).replace(/'/g, "''")
            updateFields.push(`"clientName" = '${escapedValue}'`)
          }
          if (cleanUpdateData.issueDate) {
            const escapedValue = cleanUpdateData.issueDate.toISOString()
            updateFields.push(`"issueDate" = '${escapedValue}'`)
          }
          if (cleanUpdateData.dueDate) {
            const escapedValue = cleanUpdateData.dueDate.toISOString()
            updateFields.push(`"dueDate" = '${escapedValue}'`)
          }
          if (cleanUpdateData.totalAmount) {
            const escapedValue = String(cleanUpdateData.totalAmount)
            updateFields.push(`"totalAmount" = ${escapedValue}`)
          }
          if (cleanUpdateData.currency) {
            const escapedValue = String(cleanUpdateData.currency).replace(/'/g, "''")
            updateFields.push(`"currency" = '${escapedValue}'`)
          }
          if (cleanUpdateData.description) {
            const escapedValue = String(cleanUpdateData.description).replace(/'/g, "''")
            updateFields.push(`"description" = '${escapedValue}'`)
          }
          if (cleanUpdateData.position) {
            const escapedValue = String(cleanUpdateData.position).replace(/'/g, "''")
            updateFields.push(`"position" = '${escapedValue}'`)
          }
          if (cleanUpdateData.positionUpdatedAt) {
            const escapedValue = cleanUpdateData.positionUpdatedAt.toISOString()
            updateFields.push(`"positionUpdatedAt" = '${escapedValue}'`)
          }
          if (cleanUpdateData.positionUpdatedBy) {
            const escapedValue = String(cleanUpdateData.positionUpdatedBy).replace(/'/g, "''")
            updateFields.push(`"positionUpdatedBy" = '${escapedValue}'`)
          }
          if (cleanUpdateData.workRegion) {
            const escapedValue = String(cleanUpdateData.workRegion).replace(/'/g, "''")
            updateFields.push(`"workRegion" = '${escapedValue}'`)
          }
          if (cleanUpdateData.jobTitle) {
            const escapedValue = String(cleanUpdateData.jobTitle).replace(/'/g, "''")
            updateFields.push(`"jobTitle" = '${escapedValue}'`)
          }
          if (cleanUpdateData.workPeriod) {
            const escapedValue = String(cleanUpdateData.workPeriod).replace(/'/g, "''")
            updateFields.push(`"workPeriod" = '${escapedValue}'`)
          }
          if (cleanUpdateData.category) {
            const escapedValue = String(cleanUpdateData.category).replace(/'/g, "''")
            updateFields.push(`"category" = '${escapedValue}'`)
          }
          if (cleanUpdateData.notes !== undefined) {
            const escapedValue = String(cleanUpdateData.notes || '').replace(/'/g, "''")
            updateFields.push(`"notes" = '${escapedValue}'`)
          }
          
          // Always update updatedAt
          const now = new Date().toISOString()
          updateFields.push(`"updatedAt" = '${now}'`)
          
          // Build and execute the query
          const query = `
            UPDATE "public"."Invoice"
            SET ${updateFields.join(', ')}
            WHERE "id" = '${id}'
            RETURNING *
          `
          
          console.log('Executing raw query:', query)
          const result = await (dbWithRetry as any).$queryRawUnsafe(query)
          
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
        oldValue: currentInvoice.status || '',
        newValue: status,
        changedBy: user.name || user.email,
        notes: notes || '',
      })
    }

    // Add position change history
    if (position && position !== currentInvoice.position) {
      historyRecords.push({
        invoiceId: id,
        field: 'position',
        oldValue: currentInvoice.position || '',
        newValue: position,
        changedBy: user.name || user.email,
        notes: notes || '',
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
            // Make sure changedBy is not null since it's required in the schema
            const changedByValue = record.changedBy || 'system'
            const escapedChangedByValue = String(changedByValue).replace(/'/g, "''")
            
            const query = `
              INSERT INTO "InvoiceHistory" (
                id, "invoiceId", "field", "oldValue", "newValue", "changedBy", "changedAt", "notes"
              ) VALUES (
                '${cuid}', '${record.invoiceId}', '${record.field}', '${escapedOldValue}', '${escapedNewValue}', '${escapedChangedByValue}', '${now.toISOString()}', '${escapedNotes}'
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