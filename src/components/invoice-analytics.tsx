'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, FileText, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { id } from 'date-fns/locale'

interface AnalyticsData {
  totalInvoices: number
  totalAmount: number
  settledInvoices: number
  settledAmount: number
  pendingInvoices: number
  pendingAmount: number
  overdueInvoices: number
  overdueAmount: number
  regionData?: {
    region: string
    totalInvoices: number
    totalAmount: number
    settledInvoices: number
    settledAmount: number
    pendingInvoices: number
    pendingAmount: number
  }[]
  monthlyData?: {
    month: string
    totalInvoices: number
    totalAmount: number
    settledInvoices: number
    settledAmount: number
    settledInThisMonth: number
    settledInThisMonthAmount: number
    pendingInvoices: number
    pendingAmount: number
  }[]
  positionData?: {
    position: string
    count: number
    totalAmount: number
  }[]
}

const workRegionLabels = {
  TARAKAN: 'Kota Tarakan',
  BALIKPAPAN: 'Balikpapan',
  SAMARINDA: 'Samarinda',
}

const workRegionColors = {
  TARAKAN: 'bg-blue-100 text-blue-800',
  BALIKPAPAN: 'bg-green-100 text-green-800',
  SAMARINDA: 'bg-purple-100 text-purple-800',
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

const positionColors = {
  MITRA: 'bg-purple-100 text-purple-800',
  USER: 'bg-indigo-100 text-indigo-800',
  AREA: 'bg-cyan-100 text-cyan-800',
  REGIONAL: 'bg-teal-100 text-teal-800',
  HEAD_OFFICE: 'bg-emerald-100 text-emerald-800',
  APM: 'bg-amber-100 text-amber-800',
  TERBAYAR: 'bg-green-100 text-green-800',
}

interface InvoiceAnalyticsProps {
  refreshTrigger?: number
}

export function InvoiceAnalytics({ refreshTrigger }: InvoiceAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL')
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [selectedRegion, refreshTrigger])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = selectedRegion === 'ALL' 
        ? '/api/invoices/analytics' 
        : `/api/invoices/analytics?region=${selectedRegion}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      
      const analyticsData = await response.json()
      
      // Ensure regionData exists for ALL regions, default to empty array for specific regions
      if (selectedRegion !== 'ALL' && !analyticsData.regionData) {
        analyticsData.regionData = []
      }
      
      setData(analyticsData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analitik Tagihan</h2>
            <p className="text-gray-600">Ringkasan dan analisis data tagihan berdasarkan wilayah</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter Wilayah:</label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Wilayah</SelectItem>
                <SelectItem value="TARAKAN">Kota Tarakan</SelectItem>
                <SelectItem value="BALIKPAPAN">Balikpapan</SelectItem>
                <SelectItem value="SAMARINDA">Samarinda</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analitik Tagihan</h2>
            <p className="text-gray-600">Ringkasan dan analisis data tagihan berdasarkan wilayah</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter Wilayah:</label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Wilayah</SelectItem>
                <SelectItem value="TARAKAN">Kota Tarakan</SelectItem>
                <SelectItem value="BALIKPAPAN">Balikpapan</SelectItem>
                <SelectItem value="SAMARINDA">Samarinda</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>{error || 'No data available'}</p>
              <Button onClick={fetchAnalytics} className="mt-4">
                Coba Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const completionRate = data.totalInvoices > 0 
    ? Math.round((data.settledInvoices / data.totalInvoices) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analitik Tagihan</h2>
          <p className="text-gray-600">Ringkasan dan analisis data tagihan berdasarkan wilayah</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filter Wilayah:</label>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Wilayah</SelectItem>
              <SelectItem value="TARAKAN">Kota Tarakan</SelectItem>
              <SelectItem value="BALIKPAPAN">Balikpapan</SelectItem>
              <SelectItem value="SAMARINDA">Samarinda</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="monthly">Tren Bulanan</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="position">Posisi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tagihan</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(data.totalAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lunas</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.settledInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(data.settledAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(data.pendingAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jatuh Tempo</CardTitle>
            <BarChart3 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.overdueInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(data.overdueAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tingkat Penyelesaian</CardTitle>
          <CardDescription>
            Persentase tagihan yang telah lunas
            {selectedRegion !== 'ALL' && (
              <Badge className={`ml-2 ${workRegionColors[selectedRegion as keyof typeof workRegionColors]}`}>
                {workRegionLabels[selectedRegion as keyof typeof workRegionLabels]}
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress Penyelesaian</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
              <div className="text-xs text-gray-500">
                {data.settledInvoices} dari {data.totalInvoices} tagihan
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Breakdown */}
          {/* Regional Breakdown */}
          {selectedRegion === 'ALL' && data.regionData && data.regionData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analisis per Wilayah</CardTitle>
                <CardDescription>
                  Perbandingan data tagihan antar wilayah kerja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Bar Chart Visualization */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">Visualisasi Jumlah Tagihan per Wilayah</h4>
                    <div className="space-y-3">
                      {data.regionData.map((region) => {
                        const maxInvoices = Math.max(...data.regionData!.map(r => r.totalInvoices))
                        const percentage = maxInvoices > 0 ? (region.totalInvoices / maxInvoices) * 100 : 0
                         
                        return (
                          <div key={region.region} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Badge className={workRegionColors[region.region as keyof typeof workRegionColors]}>
                                  {workRegionLabels[region.region as keyof typeof workRegionLabels]}
                                </Badge>
                                <span className="text-sm font-medium">{region.totalInvoices} tagihan</span>
                              </div>
                              <span className="text-sm text-gray-600">{formatCurrency(region.totalAmount)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  region.region === 'TARAKAN' ? 'bg-blue-500' :
                                  region.region === 'BALIKPAPAN' ? 'bg-green-500' :
                                  'bg-purple-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              >
                                <span className="text-white text-xs font-medium flex items-center justify-center h-full">
                                  {percentage > 10 && `${percentage.toFixed(0)}%`}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Detailed Regional Data */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.regionData.map((region) => {
                      const regionCompletionRate = region.totalInvoices > 0
                        ? Math.round((region.settledInvoices / region.totalInvoices) * 100)
                        : 0

                      return (
                        <div key={region.region} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge className={workRegionColors[region.region as keyof typeof workRegionColors]}>
                              {workRegionLabels[region.region as keyof typeof workRegionLabels]}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{region.totalInvoices}</div>
                              <div className="text-xs text-gray-500">Total Tagihan</div>
                              <div className="text-lg font-semibold text-blue-600 mt-1">
                                {formatCurrency(region.totalAmount)}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-center p-2 bg-green-50 rounded">
                                <div className="text-green-600 font-bold">{region.settledInvoices}</div>
                                <div className="text-gray-600 text-xs">Lunas</div>
                                <div className="text-green-700 text-xs font-medium">
                                  {formatCurrency(region.settledAmount)}
                                </div>
                              </div>
                              <div className="text-center p-2 bg-orange-50 rounded">
                                <div className="text-orange-600 font-bold">{region.pendingInvoices}</div>
                                <div className="text-gray-600 text-xs">Menunggu</div>
                                <div className="text-orange-700 text-xs font-medium">
                                  {formatCurrency(region.pendingAmount)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="pt-2 border-t">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600">Tingkat Lunas</span>
                                <span className="text-sm font-bold text-green-600">{regionCompletionRate}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${regionCompletionRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="monthly" className="space-y-6">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tren Tagihan 6 Bulan Terakhir
              </CardTitle>
              <CardDescription>
                Perkembangan jumlah dan nilai tagihan per bulan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.monthlyData && data.monthlyData.length > 0 ? (
                  <>
                    {/* Monthly Bar Chart */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Jumlah Tagihan per Bulan</h4>
                      <div className="space-y-2">
                        {data.monthlyData.map((month) => {
                          const maxInvoices = Math.max(...data.monthlyData!.map(m => m.totalInvoices))
                          const percentage = maxInvoices > 0 ? (month.totalInvoices / maxInvoices) * 100 : 0
                          
                          return (
                            <div key={month.month} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{month.month}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold">{month.totalInvoices} tagihan</span>
                                  <span className="text-sm text-gray-600">{formatCurrency(month.totalAmount)}</span>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                                <div
                                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                >
                                  <span className="text-white text-xs font-medium flex items-center justify-center h-full">
                                    {percentage > 10 && `${percentage.toFixed(0)}%`}
                                  </span>
                                </div>
                              </div>
                              {month.settledInvoices > 0 && (
                                <div className="flex items-center gap-2 text-xs text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>{month.settledInvoices} lunas ({formatCurrency(month.settledAmount)})</span>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Belum ada data bulanan</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Monthly Settlement Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Analisis Pelunasan Bulanan
              </CardTitle>
              <CardDescription>
                Rincian tagihan yang dilunasi setiap bulan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.monthlyData && data.monthlyData.length > 0 ? (
                  <>
                    {/* Settlement Bar Chart */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Tagihan Dilunasi per Bulan</h4>
                      <div className="space-y-2">
                        {data.monthlyData.map((month) => {
                          const maxSettlements = Math.max(...data.monthlyData!.map(m => m.settledInThisMonth))
                          const percentage = maxSettlements > 0 ? (month.settledInThisMonth / maxSettlements) * 100 : 0
                          
                          return (
                            <div key={month.month} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{month.month}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-green-600">{month.settledInThisMonth} lunas</span>
                                  <span className="text-sm text-gray-600">{formatCurrency(month.settledInThisMonthAmount)}</span>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                                <div
                                  className="bg-green-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                >
                                  <span className="text-white text-xs font-medium flex items-center justify-center h-full">
                                    {percentage > 10 && `${percentage.toFixed(0)}%`}
                                  </span>
                                </div>
                              </div>
                              {month.settledInThisMonth > 0 && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <TrendingUp className="h-3 w-3" />
                                  <span>Tingkat pelunasan: {month.totalInvoices > 0 ? Math.round((month.settledInThisMonth / month.totalInvoices) * 100) : 0}%</span>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    {/* Monthly Settlement Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="border rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {data.monthlyData.reduce((sum, month) => sum + month.settledInThisMonth, 0)}
                          </div>
                          <div className="text-sm text-gray-600">Total Tagihan Lunas</div>
                          <div className="text-lg font-semibold text-green-700 mt-1">
                            {formatCurrency(data.monthlyData.reduce((sum, month) => sum + month.settledInThisMonthAmount, 0))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {data.monthlyData.reduce((sum, month) => sum + month.pendingInvoices, 0)}
                          </div>
                          <div className="text-sm text-gray-600">Total Menunggu Pembayaran</div>
                          <div className="text-lg font-semibold text-blue-700 mt-1">
                            {formatCurrency(data.monthlyData.reduce((sum, month) => sum + month.pendingAmount, 0))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {data.monthlyData.length > 0
                              ? Math.round(
                                  (data.monthlyData.reduce((sum, month) => sum + month.settledInThisMonth, 0) /
                                  data.monthlyData.reduce((sum, month) => sum + month.totalInvoices, 0)) * 100
                                )
                              : 0}%
                          </div>
                          <div className="text-sm text-gray-600">Rata-rata Tingkat Pelunasan</div>
                          <div className="text-lg font-semibold text-purple-700 mt-1">
                            6 bulan terakhir
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Belum ada data pelunasan bulanan</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="position" className="space-y-6">
          {/* Position Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analisis Posisi Tagihan</CardTitle>
              <CardDescription>
                Distribusi tagihan berdasarkan posisi saat ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.positionData && data.positionData.length > 0 ? (
                  <>
                    {/* Position Bar Chart */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Distribusi Posisi Tagihan</h4>
                      <div className="space-y-2">
                        {data.positionData.map((position) => {
                          const maxCount = Math.max(...data.positionData!.map(p => p.count))
                          const percentage = maxCount > 0 ? (position.count / maxCount) * 100 : 0
                          
                          return (
                            <div key={position.position} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Badge className={positionColors[position.position as keyof typeof positionColors] || 'bg-gray-100 text-gray-800'}>
                                    {positionLabels[position.position as keyof typeof positionLabels] || position.position}
                                  </Badge>
                                  <span className="text-sm font-medium">{position.count} tagihan</span>
                                </div>
                                <span className="text-sm text-gray-600">{formatCurrency(position.totalAmount)}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                >
                                  <span className="text-white text-xs font-medium flex items-center justify-center h-full">
                                    {percentage > 10 && `${percentage.toFixed(0)}%`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    {/* Position Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      {data.positionData.map((position) => (
                        <div key={position.position} className="border rounded-lg p-4 text-center">
                          <Badge className={`mb-2 ${positionColors[position.position as keyof typeof positionColors] || 'bg-gray-100 text-gray-800'}`}>
                            {positionLabels[position.position as keyof typeof positionLabels] || position.position}
                          </Badge>
                          <div className="text-2xl font-bold text-gray-900">{position.count}</div>
                          <div className="text-sm text-gray-600">{formatCurrency(position.totalAmount)}</div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Belum ada data posisi</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}