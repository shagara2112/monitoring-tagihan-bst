'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, User, ArrowRight } from 'lucide-react'

interface HistoryRecord {
  id: string
  field: string
  oldValue?: string
  newValue: string
  changedBy: string
  changedAt: string
  notes?: string
}

interface InvoiceHistoryProps {
  invoiceId: string
}

export function InvoiceHistory({ invoiceId }: InvoiceHistoryProps) {
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/invoices/${invoiceId}/history`)
        if (response.ok) {
          const data = await response.json()
          // Handle both array and object with history property
          const historyData = Array.isArray(data) ? data : (data.history || [])
          setHistory(historyData)
        }
      } catch (error) {
        console.error('Error fetching invoice history:', error)
      } finally {
        setLoading(false)
      }
    }

    if (invoiceId) {
      fetchHistory()
    }
  }, [invoiceId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'status':
        return 'Status'
      case 'position':
        return 'Posisi'
      default:
        return field
    }
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
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Perubahan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Perubahan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Belum ada riwayat perubahan untuk invoice ini.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Riwayat Perubahan
        </CardTitle>
        <CardDescription>
          Track semua perubahan status dan posisi invoice
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((record, index) => (
            <div key={record.id}>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary"></div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {getFieldLabel(record.field)}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      {record.field === 'status' ? (
                        <Badge className={getStatusColor(record.newValue)}>
                          {record.newValue}
                        </Badge>
                      ) : record.field === 'position' ? (
                        <Badge className={getPositionColor(record.newValue)}>
                          {record.newValue}
                        </Badge>
                      ) : (
                        <span className="text-sm">{record.newValue}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      {record.changedBy}
                    </div>
                  </div>
                  
                  {record.oldValue && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Dari:</span>
                      {record.field === 'status' ? (
                        <Badge variant="outline" className={getStatusColor(record.oldValue)}>
                          {record.oldValue}
                        </Badge>
                      ) : record.field === 'position' ? (
                        <Badge variant="outline" className={getPositionColor(record.oldValue)}>
                          {record.oldValue}
                        </Badge>
                      ) : (
                        <span className="text-sm">{record.oldValue}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    {formatDate(record.changedAt)}
                  </div>
                  
                  {record.notes && (
                    <div className="mt-2 rounded-md bg-muted p-2 text-sm">
                      <span className="font-medium">Catatan:</span> {record.notes}
                    </div>
                  )}
                </div>
              </div>
              {index < history.length - 1 && (
                <div className="ml-1 mt-2 h-4 w-0.5 bg-border"></div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}