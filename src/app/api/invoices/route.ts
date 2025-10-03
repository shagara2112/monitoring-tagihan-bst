import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-client'
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

    const supabase = createServerSupabaseClient()
    
    // Fetch invoices with creator information
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        created_by:users!invoices_created_by_id_fkey (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invoices:', error)
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const transformedInvoices = invoices.map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      clientName: inv.client_name,
      issueDate: inv.issue_date,
      dueDate: inv.due_date,
      totalAmount: inv.total_amount,
      currency: inv.currency,
      description: inv.description,
      status: inv.status,
      position: inv.position || 'MITRA',
      workRegion: inv.work_region || 'TARAKAN',
      notes: inv.notes,
      settlementDate: inv.settlement_date,
      settlementAmount: inv.settlement_amount,
      paymentMethod: inv.payment_method,
      settlementNotes: inv.settlement_notes,
      positionUpdatedAt: inv.position_updated_at,
      positionUpdatedBy: inv.position_updated_by,
      createdAt: inv.created_at,
      updatedAt: inv.updated_at,
      createdBy: inv.created_by ? {
        id: inv.created_by.id,
        name: inv.created_by.name,
        email: inv.created_by.email,
      } : null,
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
      notes,
    } = body

    // Validate required fields
    if (!invoiceNumber || !clientName || !issueDate || !dueDate || !totalAmount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Check if invoice number already exists
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('invoice_number', invoiceNumber)
      .single()

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice number already exists' },
        { status: 400 }
      )
    }

    // Create new invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        client_name: clientName,
        issue_date: issueDate,
        due_date: dueDate,
        total_amount: parseFloat(totalAmount),
        currency,
        description,
        status,
        position,
        work_region: workRegion,
        notes,
        created_by_id: user.id,
      })
      .select(`
        *,
        created_by:users!invoices_created_by_id_fkey (
          id,
          name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Error creating invoice:', error)
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      )
    }

    // Transform the response to match expected format
    const transformedInvoice = {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      clientName: invoice.client_name,
      issueDate: invoice.issue_date,
      dueDate: invoice.due_date,
      totalAmount: invoice.total_amount,
      currency: invoice.currency,
      description: invoice.description,
      status: invoice.status,
      position: invoice.position,
      workRegion: invoice.work_region,
      notes: invoice.notes,
      settlementDate: invoice.settlement_date,
      settlementAmount: invoice.settlement_amount,
      paymentMethod: invoice.payment_method,
      settlementNotes: invoice.settlement_notes,
      positionUpdatedAt: invoice.position_updated_at,
      positionUpdatedBy: invoice.position_updated_by,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
      createdBy: invoice.created_by ? {
        id: invoice.created_by.id,
        name: invoice.created_by.name,
        email: invoice.created_by.email,
      } : null,
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