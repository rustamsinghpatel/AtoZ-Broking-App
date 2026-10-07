import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard, cx } from '../common'
import { inr } from '../../utils/format'

const RANGES = ['1D', '1W', '1M', '6M', '1Y']
const COLORS = ['#16a34a', '#0f766e', '#64748b', '#a3a3a3', '#86efac']

export function PerformanceChart({ data, className }) {
  const [range, setRange] = useState('1M')
  const tabs = (
    <div className="flex rounded-lg bg-slate-100 p-0.5" role="tablist">
      {RANGES.map((r) => (
        <button key={r} role="tab" aria-selected={range === r} onClick={() => setRange(r)}
          className={cx('rounded-md px-2.5 py-1 text-xs font-medium transition', range === r ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-800')}>{r}</button>
      ))}
    </div>
  )
  return (
    <ChartCard title="Portfolio Performance" action={tabs} className={className}>
      <AreaChart data={data[range]} margin={{ left: 0, right: 8, top: 8 }}>
        <defs><linearGradient id="perf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16a34a" stopOpacity={0.25} /><stop offset="100%" stopColor="#16a34a" stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
        <YAxis domain={['auto', 'auto']} width={52} tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
        <Tooltip formatter={(v) => [inr(v), 'Value']} />
        <Area type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} fill="url(#perf)" />
      </AreaChart>
    </ChartCard>
  )
}

export function AllocationChart({ data, className }) {
  return (
    <ChartCard title="Asset Allocation" className={className} height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => inr(v)} />
        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ChartCard>
  )
}
