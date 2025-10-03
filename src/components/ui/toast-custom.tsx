import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss: (id: string) => void
}

export function Toast({ id, title, description, variant = 'default', duration, action, onDismiss }: ToastProps) {
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, onDismiss])

  const icons = {
    default: <Info className="h-4 w-4" />,
    destructive: <AlertCircle className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />
  }

  const variants = {
    default: 'bg-white border-gray-200 text-gray-900',
    destructive: 'bg-red-50 border-red-200 text-red-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900'
  }

  return (
    <div
      className={cn(
        'group relative flex w-full items-center justify-between space-x-4 rounded-md border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
        variants[variant]
      )}
    >
      <div className="grid gap-1">
        <div className="flex items-center gap-2">
          {icons[variant]}
          {title && <div className="text-sm font-semibold">{title}</div>}
        </div>
        {description && (
          <div className="text-sm opacity-90 ml-6">{description}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm font-medium underline hover:no-underline"
          >
            {action.label}
          </button>
        )}
        <button
          onClick={() => onDismiss(id)}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function ToastProvider({ children, toasts, onDismiss }: { 
  children: React.ReactNode
  toasts: Array<any>
  onDismiss: (id: string) => void 
}) {
  return (
    <>
      {children}
      {toasts.length > 0 && (
        <div className="fixed top-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
          ))}
        </div>
      )}
    </>
  )
}