import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { id } from 'date-fns/locale'

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
      ? { workRegion: region as 'TARAKAN' | 'BALIKPAPAN' | 'SAMARINDA' }
      : {}

    // Fetch invoices from database
    const invoices = await db.invoice.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
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
    const settledAmount = invoices.filter(inv => inv.status === 'SETTLED')
      .reduce((sum, inv) => sum + (inv.settlementAmount || inv.totalAmount), 0)
    const pendingAmount = invoices.filter(inv => inv.status !== 'SETTLED')
      .reduce((sum, inv) => sum + inv.totalAmount, 0)
    const overdueAmount = invoices.filter(inv =>
      new Date(inv.dueDate) < new Date() &&
      inv.status !== 'SETTLED' &&
      inv.status !== 'DRAFT'
    ).reduce((sum, inv) => sum + inv.totalAmount, 0)

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

    // Calculate monthly data for the last 6 months
    const monthlyData: {
      month: string
      totalInvoices: number
      totalAmount: number
      settledInvoices: number
      settledAmount: number
      settledInThisMonth: number
      settledInThisMonthAmount: number
      pendingInvoices: number
      pendingAmount: number
    }[] = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      
      const monthInvoices = invoices.filter(inv =>
        isWithinInterval(new Date(inv.issueDate), { start: monthStart, end: monthEnd })
      )
      
      const settledInvoices = monthInvoices.filter(inv => inv.status === 'SETTLED')
      const settledInThisMonth = settledInvoices.filter(inv =>
        inv.settlementDate &&
        isWithinInterval(new Date(inv.settlementDate), { start: monthStart, end: monthEnd })
      )
      
      monthlyData.push({
        month: format(monthDate, 'MMM yyyy', { locale: id }),
        totalInvoices: monthInvoices.length,
        totalAmount: monthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        settledInvoices: settledInvoices.length,
        settledAmount: settledInvoices
          .reduce((sum, inv) => sum + (inv.settlementAmount || inv.totalAmount), 0),
        settledInThisMonth: settledInThisMonth.length,
        settledInThisMonthAmount: settledInThisMonth
          .reduce((sum, inv) => sum + (inv.settlementAmount || inv.totalAmount), 0),
        pendingInvoices: monthInvoices.filter(inv =>
          inv.status !== 'SETTLED' && inv.status !== 'DRAFT'
        ).length,
        pendingAmount: monthInvoices.filter(inv =>
          inv.status !== 'SETTLED' && inv.status !== 'DRAFT'
        ).reduce((sum, inv) => sum + inv.totalAmount, 0),
      })
    }

    // Calculate position distribution
    const positionCounts = invoices.reduce((acc, inv) => {
      const position = inv.position
      if (!acc[position]) {
        acc[position] = { count: 0, totalAmount: 0 }
      }
      acc[position].count += 1
      acc[position].totalAmount += inv.totalAmount
      return acc
    }, {} as Record<string, { count: number; totalAmount: number }>)

    const positionData = Object.entries(positionCounts).map(([position, data]) => ({
      position,
      count: data.count,
      totalAmount: data.totalAmount
    }))

    // For all regions, also include regional breakdown
    const regionData = [
      // TARAKAN
      {
        region: 'TARAKAN',
        totalInvoices: invoices.filter(inv => inv.workRegion === 'TARAKAN').length,
        settledInvoices: invoices.filter(inv => inv.workRegion === 'TARAKAN' && inv.status === 'SETTLED').length,
        pendingInvoices: invoices.filter(inv =>
          inv.workRegion === 'TARAKAN' && (
            inv.status === 'SUBMITTED' ||
            inv.status === 'INTERNAL_VALIDATION' ||
            inv.status === 'AWAITING_PAYMENT'
          )
        ).length,
        totalAmount: invoices.filter(inv => inv.workRegion === 'TARAKAN')
          .reduce((sum, inv) => sum + inv.totalAmount, 0),
        settledAmount: invoices.filter(inv => inv.workRegion === 'TARAKAN' && inv.status === 'SETTLED')
          .reduce((sum, inv) => sum + (inv.settlementAmount || inv.totalAmount), 0),
        pendingAmount: invoices.filter(inv =>
          inv.workRegion === 'TARAKAN' && (
            inv.status === 'SUBMITTED' ||
            inv.status === 'INTERNAL_VALIDATION' ||
            inv.status === 'AWAITING_PAYMENT'
          )
        ).reduce((sum, inv) => sum + inv.totalAmount, 0),
      },
      
      // BALIKPAPAN
      {
        region: 'BALIKPAPAN',
        totalInvoices: invoices.filter(inv => inv.workRegion === 'BALIKPAPAN').length,
        settledInvoices: invoices.filter(inv => inv.workRegion === 'BALIKPAPAN' && inv.status === 'SETTLED').length,
        pendingInvoices: invoices.filter(inv =>
          inv.workRegion === 'BALIKPAPAN' && (
            inv.status === 'SUBMITTED' ||
            inv.status === 'INTERNAL_VALIDATION' ||
            inv.status === 'AWAITING_PAYMENT'
          )
        ).length,
        totalAmount: invoices.filter(inv => inv.workRegion === 'BALIKPAPAN')
          .reduce((sum, inv) => sum + inv.totalAmount, 0),
        settledAmount: invoices.filter(inv => inv.workRegion === 'BALIKPAPAN' && inv.status === 'SETTLED')
          .reduce((sum, inv) => sum + (inv.settlementAmount || inv.totalAmount), 0),
        pendingAmount: invoices.filter(inv =>
          inv.workRegion === 'BALIKPAPAN' && (
            inv.status === 'SUBMITTED' ||
            inv.status === 'INTERNAL_VALIDATION' ||
            inv.status === 'AWAITING_PAYMENT'
          )
        ).reduce((sum, inv) => sum + inv.totalAmount, 0),
      },
      
      // SAMARINDA
      {
        region: 'SAMARINDA',
        totalInvoices: invoices.filter(inv => inv.workRegion === 'SAMARINDA').length,
        settledInvoices: invoices.filter(inv => inv.workRegion === 'SAMARINDA' && inv.status === 'SETTLED').length,
        pendingInvoices: invoices.filter(inv =>
          inv.workRegion === 'SAMARINDA' && (
            inv.status === 'SUBMITTED' ||
            inv.status === 'INTERNAL_VALIDATION' ||
            inv.status === 'AWAITING_PAYMENT'
          )
        ).length,
        totalAmount: invoices.filter(inv => inv.workRegion === 'SAMARINDA')
          .reduce((sum, inv) => sum + inv.totalAmount, 0),
        settledAmount: invoices.filter(inv => inv.workRegion === 'SAMARINDA' && inv.status === 'SETTLED')
          .reduce((sum, inv) => sum + (inv.settlementAmount || inv.totalAmount), 0),
        pendingAmount: invoices.filter(inv =>
          inv.workRegion === 'SAMARINDA' && (
            inv.status === 'SUBMITTED' ||
            inv.status === 'INTERNAL_VALIDATION' ||
            inv.status === 'AWAITING_PAYMENT'
          )
        ).reduce((sum, inv) => sum + inv.totalAmount, 0),
      },
    ]

    return NextResponse.json({
      ...analyticsData,
      regionData,
      monthlyData,
      positionData,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}