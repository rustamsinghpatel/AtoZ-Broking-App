import { IndianRupee, Percent, TrendingUp, Wallet } from 'lucide-react'
import { Async, Card, PageHeader, StatCard } from '../components/common'
import { AllocationChart, PerformanceChart } from '../components/dashboard/Charts'
import HoldingTable, { HoldingFilters, useHoldingFilters } from '../components/portfolio/HoldingTable'
import useAsync from '../hooks/useAsync'
import { getPortfolio } from '../services/api'
import { inr, pct, signedInr, tone } from '../utils/format'

function HoldingsSection({ holdings }) {
  const f = useHoldingFilters(holdings)
  return (
    <Card className="!p-0">
      <div className="p-4 pb-0 sm:p-5 sm:pb-0"><h2 className="mb-4 font-semibold">Holdings</h2><HoldingFilters f={f} showSort={false} /></div>
      <div className="px-4 pb-4 sm:px-0 sm:pb-0"><HoldingTable holdings={f.rows} /></div>
    </Card>
  )
}

export default function Portfolio() {
  const state = useAsync(getPortfolio)
  return (
    <>
      <PageHeader title="Portfolio" subtitle="A detailed view of your investments and performance." />
      <Async state={state}>
        {({ summary: s, holdings, performance, allocation }) => (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              <StatCard label="Total Investment" value={inr(s.invested)} icon={Wallet} />
              <StatCard label="Current Value" value={inr(s.current)} icon={IndianRupee} />
              <StatCard label="Total Gain" value={signedInr(s.returns)} subTone={tone(s.returns)} icon={TrendingUp} />
              <StatCard label="Return" value={pct(s.returnPct)} subTone={tone(s.returnPct)} icon={Percent} />
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              <PerformanceChart data={performance} className="lg:col-span-2" />
              <AllocationChart data={allocation} />
            </div>
            <HoldingsSection holdings={holdings} />
          </div>
        )}
      </Async>
    </>
  )
}
