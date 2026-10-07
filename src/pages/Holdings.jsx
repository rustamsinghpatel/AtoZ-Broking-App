import { useSearchParams } from 'react-router-dom'
import { Async, Card, PageHeader } from '../components/common'
import HoldingTable, { HoldingFilters, useHoldingFilters } from '../components/portfolio/HoldingTable'
import useAsync from '../hooks/useAsync'
import { getHoldings } from '../services/api'

function HoldingsList({ holdings }) {
  const [params] = useSearchParams()
  const f = useHoldingFilters(holdings, params.get('q') ?? '')
  return (
    <>
      <HoldingFilters f={f} />
      <Card className="!border-0 !bg-transparent !p-0 !shadow-none md:!border md:!bg-white md:!shadow-sm"><HoldingTable holdings={f.rows} /></Card>
    </>
  )
}

export default function Holdings() {
  const state = useAsync(getHoldings)
  return (
    <>
      <PageHeader title="Holdings" subtitle="All the securities and funds you currently own." />
      <Async state={state}>{(holdings) => <HoldingsList holdings={holdings} />}</Async>
    </>
  )
}
