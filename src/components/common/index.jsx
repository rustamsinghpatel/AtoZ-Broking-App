import { useEffect } from 'react'
import { AlertCircle, Inbox, Loader2, X } from 'lucide-react'
import { ResponsiveContainer } from 'recharts'

export const cx = (...c) => c.filter(Boolean).join(' ')

const variants = {
  primary: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
}
export function Button({ variant = 'primary', loading, className, children, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cx('inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60', variants[variant], className)}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}

export const Card = ({ className, children }) => (
  <div className={cx('rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5', className)}>{children}</div>
)

export function Input({ label, id, error, right, icon: Icon, className, ...props }) {
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        {Icon && <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input
          id={id}
          aria-invalid={!!error}
          {...props}
          className={cx('w-full rounded-lg border bg-white py-2.5 text-sm outline-none transition focus:ring-2', Icon ? 'pl-9' : 'pl-3', right ? 'pr-10' : 'pr-3', error ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:border-green-600 focus:ring-green-100')}
        />
        {right && <div className="absolute right-2 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  )
}

export const Select = ({ label, id, options, className, ...props }) => (
  <div className={className}>
    {label && <label htmlFor={id} className="sr-only">{label}</label>}
    <select id={id} {...props} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100">
      {options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  </div>
)

const badgeTones = {
  green: 'bg-green-50 text-green-700 ring-green-600/20', red: 'bg-red-50 text-red-700 ring-red-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20', slate: 'bg-slate-100 text-slate-700 ring-slate-500/20', blue: 'bg-sky-50 text-sky-700 ring-sky-600/20',
}
export const Badge = ({ tone = 'slate', children }) => (
  <span className={cx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', badgeTones[tone])}>{children}</span>
)

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const EmptyState = ({ title = 'Nothing to show', message = 'Try adjusting your filters.', icon: Icon = Inbox }) => (
  <div className="flex flex-col items-center py-12 text-center">
    <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400"><Icon size={24} /></div>
    <p className="font-medium text-slate-800">{title}</p>
    <p className="mt-1 text-sm text-slate-500">{message}</p>
  </div>
)

export const LoadingSpinner = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-slate-500" role="status">
    <Loader2 className="animate-spin text-green-600" size={22} /> <span className="text-sm">{label}</span>
  </div>
)

export const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-8 text-center" role="alert">
    <AlertCircle className="text-red-500" />
    <p className="text-sm text-red-700">{message}</p>
    {onRetry && <Button variant="outline" onClick={onRetry}>Try again</Button>}
  </div>
)

// Renders loading / error states for a useAsync result, otherwise children(data)
export function Async({ state, children }) {
  if (state.loading && !state.data) return <LoadingSpinner />
  if (state.error) return <ErrorMessage message={state.error} onRetry={state.reload} />
  return children(state.data)
}

export const StatCard = ({ label, value, sub, subTone, icon: Icon }) => (
  <Card>
    <div className="flex items-start justify-between">
      <p className="text-sm text-slate-500">{label}</p>
      {Icon && <span className="rounded-lg bg-green-50 p-2 text-green-600"><Icon size={16} /></span>}
    </div>
    <p className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">{value}</p>
    {sub && <p className={cx('mt-1 text-sm font-medium', subTone)}>{sub}</p>}
  </Card>
)

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {action}
  </div>
)

export const ChartCard = ({ title, action, height = 280, className, children }) => (
  <Card className={className}>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {action}
    </div>
    <div style={{ height }} className="w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
    </div>
  </Card>
)

export const Th = ({ children, right }) => (
  <th className={cx('whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500', right ? 'text-right' : 'text-left')}>{children}</th>
)
export const Table = ({ children }) => (
  <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm">{children}</table></div>
)
