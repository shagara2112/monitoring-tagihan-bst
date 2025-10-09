'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { isSuperAdmin } from '@/lib/auth-client'

interface User {
  id: string
  email: string
  name?: string
  role: string
}

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
  createdById: string
  createdBy?: {
    id: string
    name: string
    email: string
  }
}

interface InvoiceEditProps {
  invoice: Invoice | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function InvoiceEdit({ invoice, isOpen, onClose, onSuccess }: InvoiceEditProps) {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    clientName: '',
    issueDate: new Date(),
    dueDate: new Date(),
    totalAmount: '',
    currency: 'IDR',
    description: '',
    status: 'DRAFT',
    position: 'MITRA',
    workRegion: 'TARAKAN',
    jobTitle: '',
    workPeriod: '',
    category: '',
    customCategory: '',
    notes: '',
    createdById: '',
  })

  useEffect(() => {
    // Only fetch users if super admin
    if (isSuperAdmin(user as any)) {
      fetchUsers()
    }
  }, [user])

  useEffect(() => {
    if (invoice) {
      // Check if category is a predefined category or custom
      const predefinedCategories = ['PASANG_BARU', 'ASSURANCE', 'MAINTENANCE', 'OSP', 'SIPIL', 'KONSTRUKSI'];
      const isPredefinedCategory = invoice.category && predefinedCategories.includes(invoice.category);
      const categoryValue = isPredefinedCategory ? invoice.category || '' : 'LAINNYA';
      const customCategoryValue = isPredefinedCategory ? '' : (invoice.category || '');
      
      setFormData({
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        issueDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
        totalAmount: invoice.totalAmount.toString(),
        currency: invoice.currency,
        description: invoice.description,
        status: invoice.status,
        position: invoice.position,
        workRegion: invoice.workRegion,
        jobTitle: invoice.jobTitle || '',
        workPeriod: invoice.workPeriod || '',
        category: categoryValue,
        customCategory: customCategoryValue,
        notes: invoice.notes || '',
        createdById: invoice.createdById,
      })
    }
  }, [invoice])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const usersData = await response.json()
        setUsers(usersData.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invoice) return
    
    setLoading(true)

    try {
      // Determine the actual category value
      const actualCategory = formData.category === 'LAINNYA' ? formData.customCategory : formData.category;
      
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category: actualCategory,
          issueDate: formData.issueDate.toISOString(),
          dueDate: formData.dueDate.toISOString(),
          totalAmount: parseFloat(formData.totalAmount),
        }),
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update invoice')
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
      alert('Failed to update invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Tagihan</DialogTitle>
          <DialogDescription>
            Perbarui informasi tagihan yang ada
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Nomor Tagihan</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="Contoh: INV-202412-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientName">Nama Klien/Vendor</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="Nama klien atau vendor"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tanggal Terbit</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.issueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.issueDate ? (
                      format(formData.issueDate, "PPP", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.issueDate}
                    onSelect={(date) => date && setFormData({ ...formData, issueDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Jatuh Tempo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? (
                      format(formData.dueDate, "PPP", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => date && setFormData({ ...formData, dueDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAmount">Jumlah Total</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Mata Uang</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IDR">IDR - Rupiah</SelectItem>
                  <SelectItem value="USD">USD - Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
              <Label htmlFor="position">Posisi Tagihan</Label>
              <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
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
              <Label htmlFor="workRegion">Wilayah Kerja</Label>
              <Select value={formData.workRegion} onValueChange={(value) => setFormData({ ...formData, workRegion: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TARAKAN">Kota Tarakan</SelectItem>
                  <SelectItem value="BALIKPAPAN">Balikpapan</SelectItem>
                  <SelectItem value="SAMARINDA">Samarinda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Nama Pekerjaan</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="Nama pekerjaan atau proyek"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workPeriod">Periode Pekerjaan</Label>
              <Input
                id="workPeriod"
                value={formData.workPeriod}
                onChange={(e) => setFormData({ ...formData, workPeriod: e.target.value })}
                placeholder="Contoh: Januari 2024, Q1 2024, dll"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori Tagihan</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value, customCategory: value === 'LAINNYA' ? '' : formData.customCategory })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PASANG_BARU">Pasang Baru</SelectItem>
                  <SelectItem value="ASSURANCE">Assurance</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="OSP">OSP</SelectItem>
                  <SelectItem value="SIPIL">Sipil</SelectItem>
                  <SelectItem value="KONSTRUKSI">Konstruksi</SelectItem>
                  <SelectItem value="LAINNYA">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.category === 'LAINNYA' && (
              <div className="space-y-2">
                <Label htmlFor="customCategory">Kategori Kustom</Label>
                <Input
                  id="customCategory"
                  value={formData.customCategory}
                  onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                  placeholder="Masukkan kategori kustom"
                />
              </div>
            )}

            {isSuperAdmin(user as any) ? (
              <div className="space-y-2">
                <Label htmlFor="createdById">Dibuat Oleh</Label>
                <Select value={formData.createdById} onValueChange={(value) => setFormData({ ...formData, createdById: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pengguna" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((userItem) => (
                      <SelectItem key={userItem.id} value={userItem.id}>
                        {userItem.name || userItem.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Dibuat Oleh</Label>
                <div className="p-2 bg-gray-50 rounded border text-sm text-gray-600">
                  {invoice?.createdBy?.name || invoice?.createdBy?.email || 'Unknown'}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi proyek atau layanan yang ditagihkan"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan tambahan (opsional)"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Update Tagihan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EditInvoiceButton({ invoice, onSuccess }: { invoice: Invoice, onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <InvoiceEdit
        invoice={invoice}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => {
          onSuccess()
          setIsOpen(false)
        }}
      />
    </Dialog>
  )
}