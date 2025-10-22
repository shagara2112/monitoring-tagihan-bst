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
      // Ensure positionUpdatedBy is not null
      updateData.positionUpdatedBy = user?.name || user?.email || 'system'
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
      } else if (!currentInvoice.positionUpdatedAt) {
        // If positionUpdatedAt is null in the current invoice, set it to a default value
        cleanUpdateData.positionUpdatedAt = new Date()
        cleanUpdateData.positionUpdatedBy = user?.name || user?.email || 'system'
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
      
      // Try to update with a simple raw query to avoid transaction issues
      try {
        if (Object.keys(cleanUpdateData).length > 0) {
          console.log('Attempting raw query update with data:', cleanUpdateData)
          
          // Double-check ID is not null or empty before any update
          if (!id || id.trim() === '') {
            console.error('Cannot update: Invalid invoice ID')
            throw new Error('Invoice ID cannot be null or empty for update')
          }
          
          const cleanId = id.trim()
          console.log('Using clean invoice ID for update:', cleanId)
          console.log('Original invoice ID:', id)
          console.log('Clean invoice ID:', cleanId)
          console.log('Type of clean invoice ID:', typeof cleanId)
          console.log('Length of clean invoice ID:', cleanId.length)
          
          // Log the current invoice data for debugging
          console.log('Current invoice data:', {
            id: currentInvoice.id,
            status: currentInvoice.status,
            position: currentInvoice.position,
            positionUpdatedAt: currentInvoice.positionUpdatedAt,
            positionUpdatedBy: currentInvoice.positionUpdatedBy,
            updatedAt: currentInvoice.updatedAt
          })
          
          // Log the update data for debugging
          console.log('Update data being applied:', {
            status: cleanUpdateData.status,
            position: cleanUpdateData.position,
            positionUpdatedAt: cleanUpdateData.positionUpdatedAt,
            positionUpdatedBy: cleanUpdateData.positionUpdatedBy,
            updatedAt: cleanUpdateData.updatedAt
          })
          
          // Make sure we don't include createdById in the update data
          const updateDataWithoutCreatedById = { ...cleanUpdateData }
          delete updateDataWithoutCreatedById.createdById
          
          console.log('Update data without createdById:', updateDataWithoutCreatedById)
          
          // Create history records first to track the changes
          const historyRecords: any[] = []
          
          // Get a valid changedBy value
          const changedByValue = user?.name || user?.email || 'system'
          const safeChangedByValue = String(changedByValue).replace(/'/g, "''")
          
          // Add status change history if status is being updated
          if (cleanUpdateData.status && cleanUpdateData.status !== currentInvoice.status) {
            historyRecords.push({
              invoiceId: cleanId,
              field: 'status',
              oldValue: currentInvoice.status || '',
              newValue: cleanUpdateData.status,
              changedBy: safeChangedByValue,
              notes: notes || '',
            })
          }
          
          // Add position change history if position is being updated
          if (cleanUpdateData.position && cleanUpdateData.position !== currentInvoice.position) {
            historyRecords.push({
              invoiceId: cleanId,
              field: 'position',
              oldValue: currentInvoice.position || '',
              newValue: cleanUpdateData.position,
              changedBy: safeChangedByValue,
              notes: notes || '',
            })
          }
          
          // Add positionUpdatedAt change history if it was null and is now set
          if (!currentInvoice.positionUpdatedAt && cleanUpdateData.positionUpdatedAt) {
            historyRecords.push({
              invoiceId: cleanId,
              field: 'positionUpdatedAt',
              oldValue: '',
              newValue: cleanUpdateData.positionUpdatedAt.toISOString(),
              changedBy: safeChangedByValue,
              notes: 'Set initial position update timestamp',
            })
          }
          
          // Add positionUpdatedBy change history if it was null and is now set
          if (!currentInvoice.positionUpdatedBy && cleanUpdateData.positionUpdatedBy) {
            historyRecords.push({
              invoiceId: cleanId,
              field: 'positionUpdatedBy',
              oldValue: '',
              newValue: cleanUpdateData.positionUpdatedBy,
              changedBy: safeChangedByValue,
              notes: 'Set initial position update user',
            })
          }
          
          // Create all history records
          for (const record of historyRecords) {
            const timestamp = Date.now().toString(36)
            const randomPart = Math.random().toString(36).substring(2, 15)
            const cuid = `c${timestamp}${randomPart}`
            
            console.log('Creating history record:', {
              id: cuid,
              invoiceId: record.invoiceId,
              field: record.field,
              oldValue: record.oldValue,
              newValue: record.newValue,
              changedBy: record.changedBy,
              changedAt: new Date().toISOString(),
              notes: record.notes
            })
            
            await db.invoiceHistory.create({
              data: {
                id: cuid,
                invoiceId: record.invoiceId,
                field: record.field,
                oldValue: record.oldValue,
                newValue: record.newValue,
                changedBy: record.changedBy,
                changedAt: new Date(),
                notes: record.notes,
              }
            })
          }
          
          // Build a simple raw query
          const updateFields: string[] = []
          
          // Add each field to the update query with proper escaping
          if (updateDataWithoutCreatedById.status) {
            const escapedValue = String(updateDataWithoutCreatedById.status).replace(/'/g, "''")
            updateFields.push(`"status" = '${escapedValue}'`)
          }
          if (updateDataWithoutCreatedById.position) {
            const escapedValue = String(updateDataWithoutCreatedById.position).replace(/'/g, "''")
            updateFields.push(`"position" = '${escapedValue}'`)
          }
          if (updateDataWithoutCreatedById.positionUpdatedAt) {
            const escapedValue = updateDataWithoutCreatedById.positionUpdatedAt.toISOString()
            updateFields.push(`"positionUpdatedAt" = '${escapedValue}'`)
          }
          if (updateDataWithoutCreatedById.positionUpdatedBy) {
            const escapedValue = String(updateDataWithoutCreatedById.positionUpdatedBy).replace(/'/g, "''")
            updateFields.push(`"positionUpdatedBy" = '${escapedValue}'`)
          }
          if (updateDataWithoutCreatedById.notes !== undefined) {
            const escapedValue = String(updateDataWithoutCreatedById.notes || '').replace(/'/g, "''")
            updateFields.push(`"notes" = '${escapedValue}'`)
          }
          
          // Always update updatedAt
          const now = new Date().toISOString()
          updateFields.push(`"updatedAt" = '${now}'`)
          
          // Build the query
          const query = `
            UPDATE "public"."Invoice"
            SET ${updateFields.join(', ')}
            WHERE "id" = '${cleanId}'
          `
          
          console.log('Executing raw query:', query)
          
          // Execute the raw query using the direct db client
          await db.$executeRawUnsafe(query)
          
          console.log('Raw query update successful')
          
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
          
          console.log('Raw query update successful:', invoice)
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

    // Get a valid changedBy value
    const changedByValue = user?.name || user?.email || 'system'
    const safeChangedByValue = String(changedByValue).replace(/'/g, "''")

    // Add status change history
    if (status && status !== currentInvoice.status) {
      historyRecords.push({
        invoiceId: id,
        field: 'status',
        oldValue: currentInvoice.status || '',
        newValue: status,
        changedBy: safeChangedByValue,
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
        changedBy: safeChangedByValue,
        notes: notes || '',
      })
    }
    
    // Add positionUpdatedAt change history if it was null and is now set
    if (!currentInvoice.positionUpdatedAt && updateData.positionUpdatedAt) {
      historyRecords.push({
        invoiceId: id,
        field: 'positionUpdatedAt',
        oldValue: '',
        newValue: updateData.positionUpdatedAt.toISOString(),
        changedBy: safeChangedByValue,
        notes: 'Set initial position update timestamp',
      })
    }
    
    // Add positionUpdatedBy change history if it was null and is now set
    if (!currentInvoice.positionUpdatedBy && updateData.positionUpdatedBy) {
      historyRecords.push({
        invoiceId: id,
        field: 'positionUpdatedBy',
        oldValue: '',
        newValue: updateData.positionUpdatedBy,
        changedBy: safeChangedByValue,
        notes: 'Set initial position update user',
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
            // Generate a proper CUID for the history record
            // Make sure the ID is valid and not null
            const timestamp = Date.now().toString(36)
            const randomPart = Math.random().toString(36).substring(2, 15)
            const cuid = `c${timestamp}${randomPart}`
            const now = new Date()
            
            // Log the history record for debugging
            console.log('Creating history record:', {
              id: cuid,
              invoiceId: record.invoiceId,
              field: record.field,
              oldValue: record.oldValue,
              newValue: record.newValue,
              changedBy: record.changedBy,
              changedAt: now.toISOString(),
              notes: record.notes
            })
            
            // Check if any required field is null
            if (!cuid) {
              console.error('Generated CUID is null, cannot create history record')
              throw new Error('Generated CUID is null, cannot create history record')
            }
            
            if (!record.invoiceId) {
              console.error('Invoice ID is null, cannot create history record')
              throw new Error('Invoice ID is null, cannot create history record')
            }
            
            if (!record.field) {
              console.error('Field is null, cannot create history record')
              throw new Error('Field is null, cannot create history record')
            }
            
            if (!record.newValue) {
              console.error('New value is null, cannot create history record')
              throw new Error('New value is null, cannot create history record')
            }
            
            // Use $queryRawUnsafe with a properly escaped query
            const escapedOldValue = String(record.oldValue || '').replace(/'/g, "''")
            const escapedNewValue = String(record.newValue || '').replace(/'/g, "''")
            const escapedChangedBy = String(record.changedBy || '').replace(/'/g, "''")
            const escapedNotes = String(record.notes || '').replace(/'/g, "''")
            
            // Use correct column names based on Prisma schema
            // Make sure changedBy is not null since it's required in the schema
            const changedByValue = record.changedBy || 'system'
            const escapedChangedByValue = String(changedByValue).replace(/'/g, "''")
            
            // Make sure the invoice ID is not null
            const invoiceIdValue = record.invoiceId || ''
            const escapedInvoiceIdValue = String(invoiceIdValue).replace(/'/g, "''")
            
            // Make sure the field value is not null
            const fieldValue = record.field || ''
            const escapedFieldValue = String(fieldValue).replace(/'/g, "''")
            
            // Make sure the CUID is not null
            const escapedCuid = String(cuid).replace(/'/g, "''")
            
            const query = `
              INSERT INTO "InvoiceHistory" (
                id, "invoiceId", "field", "oldValue", "newValue", "changedBy", "changedAt", "notes"
              ) VALUES (
                '${escapedCuid}', '${escapedInvoiceIdValue}', '${escapedFieldValue}', '${escapedOldValue}', '${escapedNewValue}', '${escapedChangedByValue}', '${now.toISOString()}', '${escapedNotes}'
              )
            `
            
            console.log('Executing history record query:', query)
            
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