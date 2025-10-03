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

    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')

    // Build where clause based on region filter
    const whereClause = region && region !== 'ALL' 
      ? { workRegion: region }
      : {}

    // Get all invoices with optional region filter
    const invoices = await db.invoice.findMany({
      where: whereClause,
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

    // Calculate overall statistics
    const totalInvoices = invoices.length
    const settledInvoices = invoices.filter(inv => inv.status === 'SETTLED').length
    const pendingInvoices = invoices.filter(inv => 
      inv.status === 'SUBMITTED' || 
      inv.status === 'INTERNAL_VALIDATION' || 
      inv.status === 'AWAITING_PAYMENT'
    ).length
    const overdueInvoices = invoices.filter(inv => 
      new Date(inv.dueDate) < new Date() && 
      inv.status !== 'SETTLED' && 
      inv.status !== 'DRAFT'
    ).length

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
    const settledAmount = invoices
      .filter(inv => inv.status === 'SETTLED')
      .reduce((sum, inv) => sum + (inv.settlementAmount || inv.totalAmount), 0)
    const pendingAmount = invoices
      .filter(inv => inv.status !== 'SETTLED')
      .reduce((sum, inv) => sum + inv.totalAmount, 0)
    const overdueAmount = invoices
      .filter(inv => 
        new Date(inv.dueDate) < new Date() && 
        inv.status !== 'SETTLED' && 
        inv.status !== 'DRAFT'
      )
      .reduce((sum, inv) => sum + inv.totalAmount, 0)

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
    const regionData = await Promise.all([
      // TARAKAN
      (() => {
        const tarakanInvoices = invoices.filter(inv => inv.workRegion === 'TARAKAN')
        const settled = tarakanInvoices.filter(inv => inv.status === 'SETTLED')
        const pending = tarakanInvoices.filter(inv => 
          inv.status === 'SUBMITTED' || 
          inv.status === 'INTERNAL_VALIDATION' || 
          inv.status === 'AWAITING_PAYMENT'
        )
        
        return {
          region: 'TARAKAN',
          totalInvoices: tarakanInvoices.length,
          settledInvoices: settled.length,
          pendingInvoices: pending.length,
          totalAmount: tarakanInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
          settledAmount: settled.reduce((sum, inv) => sum + (inv.settlementAmount || inv.totalAmount), 0),
          pendingAmount: pending.reduce((sum, inv) => sum + inv.totalAmount, 0),
        }
      })(),
      
      // BALIKPAPAN
      (() => {
        const balikpapanInvoices = invoices.filter(inv => inv.workRegion === 'BALIKPAPAN')
        const settled = balikpapanInvoices.filter(inv => inv.status === 'SETTLED')
        const pending = balikpapanInvoices.filter(inv => 
          inv.status === 'SUBMITTED' || 
          inv.status === 'INTERNAL_VALIDATION' || 
          inv.status === 'AWAITING_PAYMENT'
        )
        
        return {
          region: 'BALIKPAPAN',
          totalInvoices: balikpapanInvoices.length,
          settledInvoices: settled.length,
          pendingInvoices: pending.length,
          totalAmount: balikpapanInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
          settledAmount: settled.reduce((sum, inv) => sum + (inv.settlementAmount || inv.totalAmount), 0),
          pendingAmount: pending.reduce((sum, inv) => sum + inv.totalAmount, 0),
        }
      })(),
      
      // SAMARINDA
      (() => {
        const samarindaInvoices = invoices.filter(inv => inv.workRegion === 'SAMARINDA')
        const settled = samarindaInvoices.filter(inv => inv.status === 'SETTLED')
        const pending = samarindaInvoices.filter(inv => 
          inv.status === 'SUBMITTED' || 
          inv.status === 'INTERNAL_VALIDATION' || 
          inv.status === 'AWAITING_PAYMENT'
        )
        
        return {
          region: 'SAMARINDA',
          totalInvoices: samarindaInvoices.length,
          settledInvoices: settled.length,
          pendingInvoices: pending.length,
          totalAmount: samarindaInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
          settledAmount: settled.reduce((sum, inv) => sum + (inv.settlementAmount || inv.totalAmount), 0),
          pendingAmount: pending.reduce((sum, inv) => sum + inv.totalAmount, 0),
        }
      })(),
    ])

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