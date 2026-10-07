import { Badge, Card, EmptyState, Table, Th } from '../common'
import { fmtDate, inr } from '../../utils/format'

const statusTone = { Completed: 'green', Pending: 'amber', Failed: 'red' }
const typeTone = { Buy: 'green', Sell: 'red', Deposit: 'blue', Withdrawal: 'slate' }
const isCredit = (t) => t.type === 'Sell' || t.type === 'Deposit'
const amount = (t) => <span className={isCredit(t) ? 'text-green-600' : 'text-slate-800'}>{isCredit(t) ? '+' : '-'}{inr(t.amount)}</span>

export default function TransactionTable({ transactions, compact = false }) {
  if (!transactions.length) return <EmptyState title="No transactions found" message="Try changing the filters or date range." />
  return (
    <>
      <div className="hidden md:block">
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr><Th>Date</Th>{!compact && <Th>Transaction ID</Th>}<Th>Type</Th><Th>Asset</Th>{!compact && <Th right>Qty</Th>}<Th right>Amount</Th><Th>Status</Th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3">{fmtDate(t.date)}</td>
                {!compact && <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.id}</td>}
                <td className="px-4 py-3"><Badge tone={typeTone[t.type]}>{t.type}</Badge></td>
                <td className="px-4 py-3 font-medium text-slate-900">{t.asset}</td>
                {!compact && <td className="px-4 py-3 text-right">{t.qty ?? '—'}</td>}
                <td className="px-4 py-3 text-right font-medium">{amount(t)}</td>
                <td className="px-4 py-3"><Badge tone={statusTone[t.status]}>{t.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="space-y-3 md:hidden">
        {transactions.map((t) => (
          <Card key={t.id} className="!p-4">
            <div className="flex items-start justify-between gap-2">
              <div><p className="font-medium text-slate-900">{t.asset}</p><p className="text-xs text-slate-500">{fmtDate(t.date)}{!compact && ` · ${t.id}`}</p></div>
              <p className="font-semibold">{amount(t)}</p>
            </div>
            <div className="mt-3 flex items-center gap-2"><Badge tone={typeTone[t.type]}>{t.type}</Badge><Badge tone={statusTone[t.status]}>{t.status}</Badge>{!compact && t.qty && <span className="text-xs text-slate-500">Qty {t.qty}</span>}</div>
          </Card>
        ))}
      </div>
    </>
  )
}
