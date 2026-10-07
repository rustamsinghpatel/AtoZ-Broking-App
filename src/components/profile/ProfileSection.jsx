import { Card } from '../common'

export const ProfileSection = ({ title, icon: Icon, children }) => (
  <Card>
    <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><Icon size={18} className="text-green-600" />{title}</h2>
    {children}
  </Card>
)
export const InfoGrid = ({ items }) => (
  <dl className="grid gap-4 sm:grid-cols-2">
    {items.map(([k, v]) => <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="mt-0.5 break-words text-sm font-medium text-slate-900">{v}</dd></div>)}
  </dl>
)
