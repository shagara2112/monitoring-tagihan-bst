'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, DollarSign, CreditCard, Clock, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  issueDate: string
  dueDate: string
  totalAmount: number
  currency: string
  description: string
  status: 'DRAFT' | 'SUBMITTED' | 'INTERNAL_VALIDATION' | 'AWAITING_PAYMENT' | 'SETTLED' | 'DELAYED'
  position: 'MITRA' | 'USER' | 'AREA' | 'REGIONAL' | 'HEAD_OFFICE' | 'APM' | 'TERBAYAR'
  workRegion: 'TARAKAN' | 'BALIKPAPAN' | 'SAMARINDA'
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
  createdBy?: {
    id: string
    name: string
    email: string
  }
}

interface InvoiceDetailProps {
  invoice: Invoice | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  INTERNAL_VALIDATION: 'bg-yellow-100 text-yellow-800',
  AWAITING_PAYMENT: 'bg-orange-100 text-orange-800',
  SETTLED: 'bg-green-100 text-green-800',
  DELAYED: 'bg-red-100 text-red-800',
}

const statusLabels = {
  DRAFT: 'Draf',
  SUBMITTED: 'Diajukan ke Klien',
  INTERNAL_VALIDATION: 'Validasi Internal',
  AWAITING_PAYMENT: 'Menunggu Pembayaran',
  SETTLED: 'Lunas',
  DELAYED: 'Ditunda/Bermasalah',
}

const positionColors = {
  MITRA: 'bg-purple-100 text-purple-800',
  USER: 'bg-indigo-100 text-indigo-800',
  AREA: 'bg-cyan-100 text-cyan-800',
  REGIONAL: 'bg-teal-100 text-teal-800',
  HEAD_OFFICE: 'bg-emerald-100 text-emerald-800',
  APM: 'bg-amber-100 text-amber-800',
  TERBAYAR: 'bg-green-100 text-green-800',
}

const positionLabels = {
  MITRA: 'Mitra',
  USER: 'User',
  AREA: 'Area',
  REGIONAL: 'Regional',
  HEAD_OFFICE: 'Head Office',
  APM: 'APM',
  TERBAYAR: 'Terbayar',
}

const workRegionColors = {
  TARAKAN: 'bg-blue-100 text-blue-800',
  BALIKPAPAN: 'bg-green-100 text-green-800',
  SAMARINDA: 'bg-purple-100 text-purple-800',
}

const workRegionLabels = {
  TARAKAN: 'Kota Tarakan',
  BALIKPAPAN: 'Balikpapan',
  SAMARINDA: 'Samarinda',
}

export function InvoiceDetail({ invoice, isOpen, onClose, onUpdate }: InvoiceDetailProps) {
  const [loading, setLoading] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    position: '',
    notes: '',
  })
  const [settlementData, setSettlementData] = useState({
    settlementDate: new Date(),
    settlementAmount: '',
    paymentMethod: '',
    settlementNotes: '',
  })

  useEffect(() => {
    if (invoice) {
      setStatusUpdate({
        status: invoice.status,
        position: invoice.position,
        notes: invoice.notes || '',
      })
      setSettlementData({
        settlementDate: invoice.settlementDate ? new Date(invoice.settlementDate) : new Date(),
        settlementAmount: invoice.settlementAmount?.toString() || invoice.totalAmount.toString(),
        paymentMethod: invoice.paymentMethod || '',
        settlementNotes: invoice.settlementNotes || '',
      })
    }
  }, [invoice])

  if (!invoice) return null

  const handleStatusUpdate = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusUpdate),
      })

      if (response.ok) {
        onUpdate()
        onClose()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const handleSettlement = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'SETTLED',
          ...settlementData,
          settlementDate: settlementData.settlementDate.toISOString(),
        }),
      })

      if (response.ok) {
        onUpdate()
        onClose()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to record settlement')
      }
    } catch (error) {
      console.error('Error recording settlement:', error)
      alert('Failed to record settlement')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== 'SETTLED' && invoice.status !== 'DRAFT'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Detail Tagihan</span>
            <Badge className={statusColors[invoice.status]}>
              {statusLabels[invoice.status]}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive">Jatuh Tempo</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap dan manajemen status tagihan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informasi Tagihan</h3>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nomor Tagihan</Label>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Dibuat Oleh</Label>
                  <p className="font-medium">
                    {invoice.createdBy ? invoice.createdBy.name : '-'}
                    {invoice.createdBy && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({invoice.createdBy.email})
                      </span>
                    )}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Klien/Vendor</Label>
                  <p className="font-medium">{invoice.clientName}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Deskripsi</Label>
                  <p className="font-medium">{invoice.description}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Posisi Saat Ini</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={positionColors[invoice.position]}>
                      {positionLabels[invoice.position]}
                    </Badge>
                  </div>
                  {invoice.positionUpdatedAt && (
                    <div className="mt-2 text-xs text-gray-500">
                      <div>Update: {format(new Date(invoice.positionUpdatedAt), 'dd MMM yyyy HH:mm', { locale: id })}</div>
                      {invoice.positionUpdatedBy && (
                        <div>Oleh: {invoice.positionUpdatedBy}</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Wilayah Kerja</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={workRegionColors[invoice.workRegion]}>
                      {workRegionLabels[invoice.workRegion]}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nama Pekerjaan</Label>
                  <p className="font-medium">{invoice.jobTitle || '-'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Periode Pekerjaan</Label>
                  <p className="font-medium">{invoice.workPeriod || '-'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Kategori Tagihan</Label>
                  <p className="font-medium">{invoice.category || '-'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Catatan</Label>
                  <p className="text-sm">{invoice.notes || '-'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informasi Keuangan</h3>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Jumlah Total</Label>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(invoice.totalAmount, invoice.currency)}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tanggal Terbit</Label>
                  <p className="font-medium">
                    {format(new Date(invoice.issueDate), 'dd MMMM yyyy', { locale: id })}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tanggal Jatuh Tempo</Label>
                  <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                    {format(new Date(invoice.dueDate), 'dd MMMM yyyy', { locale: id })}
                  </p>
                </div>

                {invoice.status === 'SETTLED' && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Informasi Pencairan</h4>
                    <div className="space-y-2 text-sm">
                      {invoice.settlementDate && (
                        <div>
                          <Label className="text-xs">Tanggal Pencairan</Label>
                          <p className="font-medium">
                            {format(new Date(invoice.settlementDate), 'dd MMMM yyyy', { locale: id })}
                          </p>
                        </div>
                      )}
                      {invoice.settlementAmount && (
                        <div>
                          <Label className="text-xs">Jumlah Diterima</Label>
                          <p className="font-medium">
                            {formatCurrency(invoice.settlementAmount, invoice.currency)}
                          </p>
                        </div>
                      )}
                      {invoice.paymentMethod && (
                        <div>
                          <Label className="text-xs">Metode Pembayaran</Label>
                          <p className="font-medium">{invoice.paymentMethod}</p>
                        </div>
                      )}
                      {invoice.settlementNotes && (
                        <div>
                          <Label className="text-xs">Catatan Pencairan</Label>
                          <p className="font-medium">{invoice.settlementNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Update Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status Baru</Label>
                  <Select 
                    value={statusUpdate.status} 
                    onValueChange={(value) => setStatusUpdate({ ...statusUpdate, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draf</SelectItem>
                      <SelectItem value="SUBMITTED">Diajukan ke Klien</SelectItem>
                      <SelectItem value="INTERNAL_VALIDATION">Validasi Internal</SelectItem>
                      <SelectItem value="AWAITING_PAYMENT">Menunggu Pembayaran</SelectItem>
                      <SelectItem value="SETTLED">Lunas</SelectItem>
                      <SelectItem value="DELAYED">Ditunda/Bermasalah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Posisi Baru</Label>
                  <Select 
                    value={statusUpdate.position} 
                    onValueChange={(value) => setStatusUpdate({ ...statusUpdate, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MITRA">Mitra</SelectItem>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="AREA">Area</SelectItem>
                      <SelectItem value="REGIONAL">Regional</SelectItem>
                      <SelectItem value="HEAD_OFFICE">Head Office</SelectItem>
                      <SelectItem value="APM">APM</SelectItem>
                      <SelectItem value="TERBAYAR">Terbayar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan Status</Label>
                  <Textarea
                    id="notes"
                    value={statusUpdate.notes}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                    placeholder="Catatan mengenai perubahan status"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleStatusUpdate} 
                  disabled={loading || statusUpdate.status === invoice.status}
                  className="w-full"
                >
                  {loading ? 'Memperbarui...' : 'Update Status'}
                </Button>
              </div>

              {/* Settlement Form - only show if status is SETTLED or will be SETTLED */}
              {(statusUpdate.status === 'SETTLED' || invoice.status === 'SETTLED') && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Informasi Pencairan Dana
                  </h4>
                  
                  <div className="space-y-2">
                    <Label>Tanggal Pencairan</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !settlementData.settlementDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {settlementData.settlementDate ? (
                            format(settlementData.settlementDate, "PPP", { locale: id })
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={settlementData.settlementDate}
                          onSelect={(date) => date && setSettlementData({ ...settlementData, settlementDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="settlementAmount">Jumlah Diterima</Label>
                    <Input
                      id="settlementAmount"
                      type="number"
                      step="0.01"
                      value={settlementData.settlementAmount}
                      onChange={(e) => setSettlementData({ ...settlementData, settlementAmount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                    <Select 
                      value={settlementData.paymentMethod} 
                      onValueChange={(value) => setSettlementData({ ...settlementData, paymentMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih metode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRANSFER_BANK">Transfer Bank</SelectItem>
                        <SelectItem value="CEK">Cek</SelectItem>
                        <SelectItem value="TUNAI">Tunai</SelectItem>
                        <SelectItem value="EWALLET">E-Wallet</SelectItem>
                        <SelectItem value="LAINNYA">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="settlementNotes">Catatan Pencairan</Label>
                    <Textarea
                      id="settlementNotes"
                      value={settlementData.settlementNotes}
                      onChange={(e) => setSettlementData({ ...settlementData, settlementNotes: e.target.value })}
                      placeholder="Catatan mengenai pencairan (potongan, biaya, dll)"
                      rows={2}
                    />
                  </div>

                  <Button 
                    onClick={handleSettlement} 
                    disabled={loading}
                    className="w-full"
                    variant="outline"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {loading ? 'Menyimpan...' : 'Simpan Pencairan'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* History Button */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(`/invoices/${invoice.id}`, '_blank')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Lihat Riwayat Lengkap
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}