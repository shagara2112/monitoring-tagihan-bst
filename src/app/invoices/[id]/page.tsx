'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Edit, FileText, Calendar, DollarSign, User, MapPin } from 'lucide-react'
import { InvoiceHistory } from '@/components/invoice-history'

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  issueDate: string
  dueDate: string
  totalAmount: number
  currency: string
  description: string
  status: string
  position: string
  workRegion: string
  jobTitle?: string
  workPeriod?: string
  category?: string
  notes?: string
  settlementDate?: string
  settlementAmount?: number
  paymentMethod?: string
  settlementNotes?: string
  positionUpdatedAt?: string
  positionUpdatedBy?: string
  createdAt: string
  updatedAt: string
  createdBy?: {
    id: string
    name: string
    email: string
  }
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { id } = await params
        const response = await fetch(`/api/invoices/${id}`)
        if (response.ok) {
          const data = await response.json()
          setInvoice(data)
        } else {
          console.error('Failed to fetch invoice')
        }
      } catch (error) {
        console.error('Error fetching invoice:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params) {
      fetchInvoice()
    }
  }, [params])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800'
      case 'INTERNAL_VALIDATION':
        return 'bg-yellow-100 text-yellow-800'
      case 'AWAITING_PAYMENT':
        return 'bg-orange-100 text-orange-800'
      case 'SETTLED':
        return 'bg-green-100 text-green-800'
      case 'DELAYED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'MITRA':
        return 'bg-purple-100 text-purple-800'
      case 'USER':
        return 'bg-blue-100 text-blue-800'
      case 'AREA':
        return 'bg-green-100 text-green-800'
      case 'REGIONAL':
        return 'bg-yellow-100 text-yellow-800'
      case 'HEAD_OFFICE':
        return 'bg-red-100 text-red-800'
      case 'APM':
        return 'bg-indigo-100 text-indigo-800'
      case 'TERBAYAR':
        return 'bg-emerald-100 text-emerald-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invoice tidak ditemukan</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Detail Invoice</h1>
        </div>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Edit Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {invoice.invoiceNumber}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                  <Badge className={getPositionColor(invoice.position)}>
                    {invoice.position}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                {invoice.clientName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Deskripsi</h3>
                <p className="text-sm text-muted-foreground">{invoice.description}</p>
              </div>
              
              {invoice.jobTitle && (
                <div>
                  <h3 className="font-semibold mb-2">Nama Pekerjaan</h3>
                  <p className="text-sm text-muted-foreground">{invoice.jobTitle}</p>
                </div>
              )}
              
              {invoice.workPeriod && (
                <div>
                  <h3 className="font-semibold mb-2">Periode Pekerjaan</h3>
                  <p className="text-sm text-muted-foreground">{invoice.workPeriod}</p>
                </div>
              )}
              
              {invoice.category && (
                <div>
                  <h3 className="font-semibold mb-2">Kategori Tagihan</h3>
                  <p className="text-sm text-muted-foreground">{invoice.category}</p>
                </div>
              )}
              
              {invoice.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Catatan</h3>
                  <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                </div>
              )}
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Tanggal Terbit</p>
                    <p className="text-sm text-muted-foreground">{formatDate(invoice.issueDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Jatuh Tempo</p>
                    <p className="text-sm text-muted-foreground">{formatDate(invoice.dueDate)}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Wilayah Kerja</p>
                    <p className="text-sm text-muted-foreground">{invoice.workRegion}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Dibuat Oleh</p>
                    <p className="text-sm text-muted-foreground">{invoice.createdBy?.name || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {invoice.status === 'SETTLED' && (
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Tanggal Pembayaran</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.settlementDate ? formatDate(invoice.settlementDate) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Metode Pembayaran</p>
                    <p className="text-sm text-muted-foreground">{invoice.paymentMethod || '-'}</p>
                  </div>
                </div>
                
                {invoice.settlementNotes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Catatan Pembayaran</p>
                    <p className="text-sm text-muted-foreground">{invoice.settlementNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <InvoiceHistory invoiceId={invoice.id} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Informasi Tagihan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Total Tagihan</p>
                <p className="text-2xl font-bold">{formatCurrency(invoice.totalAmount)}</p>
              </div>
              
              {invoice.status === 'SETTLED' && invoice.settlementAmount && (
                <div>
                  <p className="text-sm font-medium">Jumlah Dibayar</p>
                  <p className="text-xl font-semibold text-green-600">
                    {formatCurrency(invoice.settlementAmount)}
                  </p>
                </div>
              )}
              
              <Separator />
              
              <div className="text-xs text-muted-foreground">
                <p>Dibuat: {formatDate(invoice.createdAt)}</p>
                <p>Diupdate: {formatDate(invoice.updatedAt)}</p>
                {invoice.positionUpdatedAt && (
                  <p>
                    Posisi diupdate: {formatDate(invoice.positionUpdatedAt)} oleh{' '}
                    {invoice.positionUpdatedBy}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}