const inrFmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
export const inr = (n) => inrFmt.format(n)
export const signedInr = (n) => `${n >= 0 ? '+' : '-'}${inr(Math.abs(n))}`
export const pct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
export const tone = (n) => (n >= 0 ? 'text-green-600' : 'text-red-600')
export const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
export const fmtDateTime = (iso) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
