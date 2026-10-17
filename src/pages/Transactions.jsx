import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Async, Card, cx, Input, PageHeader } from '../components/common'
import TransactionTable from '../components/transactions/TransactionTable'
import useAsync from '../hooks/useAsync'
import { getTransactions } from '../services/api'

const TYPES = ['All', 'Buy', 'Sell', 'Deposit', 'Withdrawal']

// Local calendar day (YYYY-MM-DD) of a date or ISO timestamp, so it can be
// compared with the <input type="date"> values. Comparing the raw ISO string
// ("2026-10-16T05:00:00Z") with "2026-10-16" wrongly drops same-day rows.
const pad = (n) => String(n).padStart(2, '0')
const localDay = (value) => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function TransactionList({ transactions }) {
  const [type, setType] = useState('All')
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return transactions.filter((t) =>
      (type === 'All' || t.type === type) && (!from || localDay(t.date) >= from) && (!to || localDay(t.date) <= to) &&
      (!q || t.asset.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)))
  }, [transactions, type, query, from, to])
  return (
    <>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Transaction type">
        {TYPES.map((t) => (
          <button key={t} role="tab" aria-selected={type === t} onClick={() => setType(t)}
            className={cx('whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition', type === t ? 'border-green-600 bg-green-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50')}>{t}</button>
        ))}
      </div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px]">
        <Input id="txn-search" aria-label="Search transactions" icon={Search} placeholder="Search asset or transaction ID" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Input id="from" aria-label="From date" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
        <Input id="to" aria-label="To date" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
      </div>
      <Card className="!border-0 !bg-transparent !p-0 !shadow-none md:!border md:!bg-white md:!shadow-sm"><TransactionTable transactions={rows} /></Card>
    </>
  )
}

export default function Transactions() {
  const state = useAsync(getTransactions)
  return (
    <>
      <PageHeader title="Transactions" subtitle="Your complete transaction history." />
      <Async state={state}>{(t) => <TransactionList transactions={t} />}</Async>
    </>
  )
}
