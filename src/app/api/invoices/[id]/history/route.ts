import { NextRequest, NextResponse } from 'next/server'
import { db, dbWithRetry } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(
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
    const invoiceId = id
    
    // Validate ID
    if (!id || id.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid invoice ID' },
        { status: 400 }
      )
    }

    // Check if invoice exists
    const invoice = await dbWithRetry.invoice.findUnique({
      where: { id: invoiceId },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Get history for this invoice
    let history = []
    try {
      // Try to use Prisma if available
      history = await (dbWithRetry as any).invoiceHistory.findMany({
        where: { invoiceId },
        orderBy: { changedAt: 'desc' },
      })
    } catch (error) {
      // If Prisma client doesn't have the InvoiceHistory model yet,
      // use raw query
      try {
        history = await (dbWithRetry as any).$queryRaw`
          SELECT * FROM "InvoiceHistory" WHERE invoiceId = ${invoiceId} ORDER BY changedAt DESC
        `
      } catch (rawError) {
        console.log('History fetching failed:', rawError)
      }
    }

    return NextResponse.json(history)
  } catch (error) {
    console.error('Error fetching invoice history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice history' },
      { status: 500 }
    )
  }
}