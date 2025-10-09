'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronLeft, ChevronRight, CalendarIcon, DollarSign, FileText, AlertCircle, TrendingUp, Users, Clock, Download, LogOut, User, Search, Filter, RefreshCw, Trash2, Edit, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { CreateInvoiceButton } from '@/components/invoice-form'
import { InvoiceDetail } from '@/components/invoice-detail'
import { EditInvoiceButton } from '@/components/invoice-edit'
import { DeleteInvoiceButton } from '@/components/invoice-delete'
import { InvoiceAnalytics } from '@/components/invoice-analytics'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/contexts/auth-context'
import { UserManagement } from '@/components/admin/user-management'
import { DatabaseBackup } from '@/components/admin/database-backup'
import { isSuperAdmin, isAdmin, isManagerOrAdmin } from '@/lib/auth-client'
import { useToast } from '@/hooks/use-toast-custom'
import { useDebounce } from '@/hooks/use-debounce'
import { ToastProvider } from '@/components/ui/toast-custom'

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
  notes?: string
  settlementDate?: string
  settlementAmount?: number
  paymentMethod?: string
  settlementNotes?: string
  positionUpdatedAt?: string
  positionUpdatedBy?: string
  createdById: string
  createdBy?: {
    id: string
    name: string
    email: string
  }
}

interface DashboardStats {
  totalInvoices: number
  totalPositions: number
  settledInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  totalAmount: number
  settledAmount: number
  pendingAmount: number
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

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { toast, toasts, dismiss } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [positionFilter, setPositionFilter] = useState<string>('all')
  const [workRegionFilter, setWorkRegionFilter] = useState<string>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [analyticsRefreshTrigger, setAnalyticsRefreshTrigger] = useState(0)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50
  
  // Bulk actions states
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [isAllSelected, setIsAllSelected] = useState(false)
  
  // Advanced filters
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null
  })
  const [amountRange, setAmountRange] = useState<{ min: string; max: string }>({
    min: '',
    max: ''
  })

  useEffect(() => {
    fetchInvoices()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, statusFilter, clientFilter, positionFilter, workRegionFilter, dateRange, amountRange])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices)
        setStats(data.stats)
        setAnalyticsRefreshTrigger(prev => prev + 1)
        toast({
          title: 'Data berhasil dimuat',
          description: `${data.invoices.length} tagihan berhasil dimuat`,
          variant: 'success',
          duration: 2000
        })
      } else {
        throw new Error('Failed to fetch invoices')
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data tagihan',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invoice.jobTitle && invoice.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (invoice.workPeriod && invoice.workPeriod.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    const matchesClient = clientFilter === 'all' || invoice.clientName === clientFilter
    const matchesPosition = positionFilter === 'all' || invoice.position === positionFilter
    const matchesWorkRegion = workRegionFilter === 'all' || invoice.workRegion === workRegionFilter
    
    return matchesSearch && matchesStatus && matchesClient && matchesPosition && matchesWorkRegion
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex)

  const uniqueClients = Array.from(new Set(invoices.map(inv => inv.clientName)))

  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'SETTLED' && status !== 'DRAFT'
  }

  const handleViewDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsDetailOpen(true)
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (clientFilter !== 'all') params.append('client', clientFilter)
      if (positionFilter !== 'all') params.append('position', positionFilter)
      if (workRegionFilter !== 'all') params.append('workRegion', workRegionFilter)
      
      const response = await fetch(`/api/invoices/export?${params.toString()}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to export data')
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Manajemen Tagihan</h1>
            <p className="text-gray-600">Monitor dan lacak semua tagihan perusahaan Anda</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{user?.name || user?.email}</span>
              <Badge variant="secondary">{user?.role}</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <CreateInvoiceButton onSuccess={fetchInvoices} />
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tagihan</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posisi</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalPositions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Jumlah posisi tagihan
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tagihan Lunas</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.settledInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.settledAmount)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Menunggu Pembayaran</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.pendingAmount)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList>
            <TabsTrigger value="invoices">Daftar Tagihan</TabsTrigger>
            {(isManagerOrAdmin(user as any)) && (
              <TabsTrigger value="analytics">Analitik</TabsTrigger>
            )}
            {isSuperAdmin(user as any) && (
              <TabsTrigger value="users">Manajemen User</TabsTrigger>
            )}
            {isSuperAdmin(user as any) && (
              <TabsTrigger value="backup">Backup Database</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="invoices" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter dan Pencarian</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <Input
                    placeholder="Cari tagihan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="DRAFT">Draf</SelectItem>
                      <SelectItem value="SUBMITTED">Diajukan</SelectItem>
                      <SelectItem value="INTERNAL_VALIDATION">Validasi Internal</SelectItem>
                      <SelectItem value="AWAITING_PAYMENT">Menunggu Pembayaran</SelectItem>
                      <SelectItem value="SETTLED">Lunas</SelectItem>
                      <SelectItem value="DELAYED">Ditunda</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter Klien" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Klien</SelectItem>
                      {uniqueClients.map(client => (
                        <SelectItem key={client} value={client}>{client}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter Posisi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Posisi</SelectItem>
                      <SelectItem value="MITRA">Mitra</SelectItem>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="AREA">Area</SelectItem>
                      <SelectItem value="REGIONAL">Regional</SelectItem>
                      <SelectItem value="HEAD_OFFICE">Head Office</SelectItem>
                      <SelectItem value="APM">APM</SelectItem>
                      <SelectItem value="TERBAYAR">Terbayar</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={workRegionFilter} onValueChange={setWorkRegionFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter Wilayah" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Wilayah</SelectItem>
                      <SelectItem value="TARAKAN">Kota Tarakan</SelectItem>
                      <SelectItem value="BALIKPAPAN">Balikpapan</SelectItem>
                      <SelectItem value="SAMARINDA">Samarinda</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={fetchInvoices}>Refresh</Button>
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Invoices Table */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Tagihan</CardTitle>
                <CardDescription>
                  Menampilkan {paginatedInvoices.length} dari {filteredInvoices.length} tagihan
                  {totalPages > 1 && (
                    <span className="ml-2 text-sm text-gray-500">
                      (Halaman {currentPage} dari {totalPages})
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Tagihan</TableHead>
                        <TableHead>Klien</TableHead>
                        <TableHead>Nama Pekerjaan</TableHead>
                        <TableHead>Periode Pekerjaan</TableHead>
                        <TableHead>Tanggal Terbit</TableHead>
                        <TableHead>Jatuh Tempo</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Posisi</TableHead>
                        <TableHead>Wilayah</TableHead>
                        {isManagerOrAdmin(user as any) && <TableHead>Diinput Oleh</TableHead>}
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedInvoices.map((invoice) => (
                        <TableRow 
                          key={invoice.id} 
                          className={isOverdue(invoice.dueDate, invoice.status) ? 'bg-red-50' : ''}
                        >
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.clientName}</TableCell>
                          <TableCell className="max-w-xs truncate">{invoice.jobTitle || '-'}</TableCell>
                          <TableCell className="max-w-xs truncate">{invoice.workPeriod || '-'}</TableCell>
                          <TableCell>
                            {format(new Date(invoice.issueDate), 'dd MMM yyyy', { locale: id })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {format(new Date(invoice.dueDate), 'dd MMM yyyy', { locale: id })}
                              {isOverdue(invoice.dueDate, invoice.status) && (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(invoice.totalAmount, invoice.currency)}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[invoice.status]}>
                              {statusLabels[invoice.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={positionColors[invoice.position]}>
                              {positionLabels[invoice.position]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={workRegionColors[invoice.workRegion]}>
                              {workRegionLabels[invoice.workRegion]}
                            </Badge>
                          </TableCell>
                          {isManagerOrAdmin(user as any) && (
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">
                                  {invoice.createdBy?.name || 'Unknown'}
                                </div>
                                <div className="text-gray-500">
                                  {invoice.createdBy?.email || 'N/A'}
                                </div>
                              </div>
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" onClick={() => handleViewDetail(invoice)}>
                                Detail
                              </Button>
                              <EditInvoiceButton invoice={invoice} onSuccess={fetchInvoices} />
                              <DeleteInvoiceButton invoice={invoice} onSuccess={fetchInvoices} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Menampilkan {startIndex + 1} hingga {Math.min(endIndex, filteredInvoices.length)} dari {filteredInvoices.length} tagihan
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNumber
                          if (totalPages <= 5) {
                            pageNumber = i + 1
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i
                          } else {
                            pageNumber = currentPage - 2 + i
                          }
                          
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNumber)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNumber}
                            </Button>
                          )
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <InvoiceAnalytics refreshTrigger={analyticsRefreshTrigger} />
          </TabsContent>

          {/* User Management Tab - Super Admin Only */}
          {isSuperAdmin(user as any) && (
            <TabsContent value="users" className="space-y-6">
              <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
                <UserManagement />
              </ProtectedRoute>
            </TabsContent>
          )}

          {/* Database Backup Tab - Super Admin Only */}
          {isSuperAdmin(user as any) && (
            <TabsContent value="backup" className="space-y-6">
              <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
                <DatabaseBackup />
              </ProtectedRoute>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Invoice Detail Dialog */}
      <InvoiceDetail
        invoice={selectedInvoice}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdate={fetchInvoices}
      />
      </div>
    </ProtectedRoute>
  )
}

function fetchInvariants() {
  throw new Error('Function not implemented.')
}