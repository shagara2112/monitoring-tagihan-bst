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

    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')

    const supabase = createServerSupabaseClient()

    // Build query based on region filter
    let query = supabase
      .from('invoices')
      .select(`
        *,
        createdBy:users(id, name, email)
      `)
      .order('created_at', { ascending: false })

    if (region && region !== 'ALL') {
      query = query.eq('work_region', region)
    }

    const { data: invoices, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('Failed to fetch invoices')
    }

    // Calculate overall statistics
    const totalInvoices = invoices?.length || 0
    const settledInvoices = invoices?.filter(inv => inv.status === 'SETTLED').length || 0
    const pendingInvoices = invoices?.filter(inv => 
      inv.status === 'SUBMITTED' || 
      inv.status === 'INTERNAL_VALIDATION' || 
      inv.status === 'AWAITING_PAYMENT'
    ).length || 0
    const overdueInvoices = invoices?.filter(inv => 
      new Date(inv.due_date) < new Date() && 
      inv.status !== 'SETTLED' && 
      inv.status !== 'DRAFT'
    ).length || 0

    const totalAmount = invoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0
    const settledAmount = invoices?.filter(inv => inv.status === 'SETTLED')
      .reduce((sum, inv) => sum + (inv.settlement_amount || inv.total_amount), 0) || 0
    const pendingAmount = invoices?.filter(inv => inv.status !== 'SETTLED')
      .reduce((sum, inv) => sum + inv.total_amount, 0) || 0
    const overdueAmount = invoices?.filter(inv => 
      new Date(inv.due_date) < new Date() && 
      inv.status !== 'SETTLED' && 
      inv.status !== 'DRAFT'
    ).reduce((sum, inv) => sum + inv.total_amount, 0) || 0

    const analyticsData = {
      totalInvoices,
      settledInvoices,
      pendingInvoices,
      overdueInvoices,
      totalAmount,
      settledAmount,
      pendingAmount,
      overdueAmount,
    }

    // If specific region is requested, return only overall stats for that region
    if (region && region !== 'ALL') {
      return NextResponse.json(analyticsData)
    }

    // For all regions, also include regional breakdown
    const regionData = [
      // TARAKAN
      {
        region: 'TARAKAN',
        totalInvoices: invoices?.filter(inv => inv.work_region === 'TARAKAN').length || 0,
        settledInvoices: invoices?.filter(inv => inv.work_region === 'TARAKAN' && inv.status === 'SETTLED').length || 0,
        pendingInvoices: invoices?.filter(inv => 
          inv.work_region === 'TARAKAN' && (
            inv.status === 'SUBMITTED' || 
            inv.status === 'INTERNAL_VALIDATION' || 
            inv.status === 'AWAITING_PAYMENT'
          )
        ).length || 0,
        totalAmount: invoices?.filter(inv => inv.work_region === 'TARAKAN')
          .reduce((sum, inv) => sum + inv.total_amount, 0) || 0,
        settledAmount: invoices?.filter(inv => inv.work_region === 'TARAKAN' && inv.status === 'SETTLED')
          .reduce((sum, inv) => sum + (inv.settlement_amount || inv.total_amount), 0) || 0,
        pendingAmount: invoices?.filter(inv => 
          inv.work_region === 'TARAKAN' && (
            inv.status === 'SUBMITTED' || 
            inv.status === 'INTERNAL_VALIDATION' || 
            inv.status === 'AWAITING_PAYMENT'
          )
        ).reduce((sum, inv) => sum + inv.total_amount, 0) || 0,
      },
      
      // BALIKPAPAN
      {
        region: 'BALIKPAPAN',
        totalInvoices: invoices?.filter(inv => inv.work_region === 'BALIKPAPAN').length || 0,
        settledInvoices: invoices?.filter(inv => inv.work_region === 'BALIKPAPAN' && inv.status === 'SETTLED').length || 0,
        pendingInvoices: invoices?.filter(inv => 
          inv.work_region === 'BALIKPAPAN' && (
            inv.status === 'SUBMITTED' || 
            inv.status === 'INTERNAL_VALIDATION' || 
            inv.status === 'AWAITING_PAYMENT'
          )
        ).length || 0,
        totalAmount: invoices?.filter(inv => inv.work_region === 'BALIKPAPAN')
          .reduce((sum, inv) => sum + inv.total_amount, 0) || 0,
        settledAmount: invoices?.filter(inv => inv.work_region === 'BALIKPAPAN' && inv.status === 'SETTLED')
          .reduce((sum, inv) => sum + (inv.settlement_amount || inv.total_amount), 0) || 0,
        pendingAmount: invoices?.filter(inv => 
          inv.work_region === 'BALIKPAPAN' && (
            inv.status === 'SUBMITTED' || 
            inv.status === 'INTERNAL_VALIDATION' || 
            inv.status === 'AWAITING_PAYMENT'
          )
        ).reduce((sum, inv) => sum + inv.total_amount, 0) || 0,
      },
      
      // SAMARINDA
      {
        region: 'SAMARINDA',
        totalInvoices: invoices?.filter(inv => inv.work_region === 'SAMARINDA').length || 0,
        settledInvoices: invoices?.filter(inv => inv.work_region === 'SAMARINDA' && inv.status === 'SETTLED').length || 0,
        pendingInvoices: invoices?.filter(inv => 
          inv.work_region === 'SAMARINDA' && (
            inv.status === 'SUBMITTED' || 
            inv.status === 'INTERNAL_VALIDATION' || 
            inv.status === 'AWAITING_PAYMENT'
          )
        ).length || 0,
        totalAmount: invoices?.filter(inv => inv.work_region === 'SAMARINDA')
          .reduce((sum, inv) => sum + inv.total_amount, 0) || 0,
        settledAmount: invoices?.filter(inv => inv.work_region === 'SAMARINDA' && inv.status === 'SETTLED')
          .reduce((sum, inv) => sum + (inv.settlement_amount || inv.total_amount), 0) || 0,
        pendingAmount: invoices?.filter(inv => 
          inv.work_region === 'SAMARINDA' && (
            inv.status === 'SUBMITTED' || 
            inv.status === 'INTERNAL_VALIDATION' || 
            inv.status === 'AWAITING_PAYMENT'
          )
        ).reduce((sum, inv) => sum + inv.total_amount, 0) || 0,
      },
    ]

    return NextResponse.json({
      ...analyticsData,
      regionData,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}