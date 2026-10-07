import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Card, EmptyState, Input, Select, Table, Th } from '../common'
import { inr, pct, signedInr, tone } from '../../utils/format'

export const TYPE_OPTIONS = ['All types', 'Equity', 'Mutual Fund', 'Debt', 'Others']
export const SORT_OPTIONS = [
  { value: 'current', label: 'Sort: Current value' }, { value: 'ret', label: 'Sort: Return %' },
  { value: 'pnl', label: 'Sort: P&L' }, { value: 'name', label: 'Sort: Name' },
]

export function useHoldingFilters(holdings, initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)
  const [type, setType] = useState('All types')
  const [sort, setSort] = useState('current')
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return holdings
      .filter((h) => (type === 'All types' || h.type === type) && (!q || h.name.toLowerCase().includes(q) || h.symbol.toLowerCase().includes(q)))
      .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : b[sort] - a[sort]))
  }, [holdings, query, type, sort])
  return { rows, query, setQuery, type, setType, sort, setSort }
}

export function HoldingFilters({ f, showSort = true }) {
  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_200px]">
      <Input id="holding-search" aria-label="Search holdings" icon={Search} placeholder="Search by name or symbol" value={f.query} onChange={(e) => f.setQuery(e.target.value)} />
      <Select id="holding-type" label="Asset type" options={TYPE_OPTIONS} value={f.type} onChange={(e) => f.setType(e.target.value)} />
      {showSort && <Select id="holding-sort" label="Sort" options={SORT_OPTIONS} value={f.sort} onChange={(e) => f.setSort(e.target.value)} />}
    </div>
  )
}

const Asset = ({ h }) => (
  <div><p className="font-medium text-slate-900">{h.name}</p><p className="text-xs text-slate-500">{h.symbol} · {h.type}</p></div>
)

export default function HoldingTable({ holdings, compact = false }) {
  if (!holdings.length) return <EmptyState title="No holdings found" message="Try a different search or filter." />
  return (
    <>
      <div className="hidden md:block">
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <Th>Asset</Th><Th right>Qty</Th>
              {!compact && <><Th right>Avg Price</Th><Th right>LTP</Th></>}
              <Th right>Invested</Th><Th right>Current</Th>
              {!compact && <Th right>P&L</Th>}<Th right>Return</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {holdings.map((h) => (
              <tr key={h.id} className="hover:bg-slate-50">
                <td className="px-4 py-3"><Asset h={h} /></td>
                <td className="px-4 py-3 text-right">{h.qty.toLocaleString('en-IN')}</td>
                {!compact && <><td className="px-4 py-3 text-right">{inr(h.avg)}</td><td className="px-4 py-3 text-right">{inr(h.price)}</td></>}
                <td className="px-4 py-3 text-right">{inr(h.invested)}</td>
                <td className="px-4 py-3 text-right font-medium">{inr(h.current)}</td>
                {!compact && <td className={`px-4 py-3 text-right font-medium ${tone(h.pnl)}`}>{signedInr(h.pnl)}</td>}
                <td className={`px-4 py-3 text-right font-medium ${tone(h.ret)}`}>{pct(h.ret)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="space-y-3 md:hidden">
        {holdings.map((h) => (
          <Card key={h.id} className="!p-4">
            <div className="flex items-start justify-between gap-2">
              <Asset h={h} />
              <div className="text-right"><p className={`font-semibold ${tone(h.ret)}`}>{pct(h.ret)}</p><p className={`text-xs ${tone(h.pnl)}`}>{signedInr(h.pnl)}</p></div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {[['Quantity', h.qty.toLocaleString('en-IN')], ['Avg price', inr(h.avg)], ['Current price', inr(h.price)], ['Invested', inr(h.invested)], ['Current value', inr(h.current)]].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
          </Card>
        ))}
      </div>
    </>
  )
}
