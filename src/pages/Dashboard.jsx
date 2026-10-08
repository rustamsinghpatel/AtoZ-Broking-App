import { Link } from 'react-router-dom'

import { Activity, IndianRupee, TrendingUp, Wallet } from 'lucide-react'

import {
  Async,
  Button,
  Card,
  PageHeader,
  StatCard,
} from '../components/common'

import {
  AllocationChart,
  PerformanceChart,
} from '../components/dashboard/Charts'

import HoldingTable from '../components/portfolio/HoldingTable'

import TransactionTable from '../components/transactions/TransactionTable'

import useAsync from '../hooks/useAsync'

import {
  getPortfolio,
  getTransactions,
  getUser,
} from '../services/api'

import {
  inr,
  pct,
  signedInr,
  tone,
} from '../utils/format'


const greeting = () => {
  const h = new Date().getHours()

  return h < 12
    ? 'Good morning'
    : h < 17
      ? 'Good afternoon'
      : 'Good evening'
}


const ViewAll = ({ to }) => (
  <Link to={to}>
    <Button
      variant="outline"
      className="!py-1.5"
    >
      View All
    </Button>
  </Link>
)


export default function Dashboard() {

  const user = useAsync(getUser)

  const portfolio = useAsync(getPortfolio)

  const txns = useAsync(getTransactions)


  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.data?.fullName?.split(" ")[0] ?? ""}`}
        subtitle="Here's how your investments are doing today."
      />

      <Async state={portfolio}>
        {({
          summary: s,
          holdings,
          performance,
          allocation,
        }) => (

          <div className="space-y-5">

            {/* Portfolio Summary */}

            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">

              <StatCard
                label="Total Invested"
                value={inr(s.invested)}
                icon={Wallet}
              />

              <StatCard
                label="Current Value"
                value={inr(s.current)}
                icon={IndianRupee}
              />

              <StatCard
                label="Total Returns"
                value={signedInr(s.returns)}
                sub={pct(s.returnPct)}
                subTone={tone(s.returns)}
                icon={TrendingUp}
              />

              <StatCard
                label="Today's Change"
                value={signedInr(s.todayChange)}
                sub={pct(s.todayPct)}
                subTone={tone(s.todayChange)}
                icon={Activity}
              />

            </div>


            {/* Charts */}

            <div className="grid gap-5 lg:grid-cols-3">

              <PerformanceChart
                data={performance}
                className="lg:col-span-2"
              />

              <AllocationChart
                data={allocation}
              />

            </div>


            {/* Recent Transactions */}

            <Card className="!p-0">

              <div className="flex items-center justify-between p-4 sm:p-5">

                <h2 className="font-semibold">
                  Recent Transactions
                </h2>

                <ViewAll to="/transactions" />

              </div>


              <div className="px-4 pb-4 sm:px-0 sm:pb-0">

                <Async state={txns}>
                  {(t) => (
                    <TransactionTable
                      transactions={t.slice(0, 5)}
                      compact
                    />
                  )}
                </Async>

              </div>

            </Card>


            {/* Top Holdings */}

            <Card className="!p-0">

              <div className="flex items-center justify-between p-4 sm:p-5">

                <h2 className="font-semibold">
                  Top Holdings
                </h2>

                <ViewAll to="/holdings" />

              </div>


              <div className="px-4 pb-4 sm:px-0 sm:pb-0">

                <HoldingTable
                  holdings={[
                    ...holdings
                  ]
                    .sort(
                      (a, b) =>
                        b.current - a.current
                    )
                    .slice(0, 5)
                  }
                  compact
                />

              </div>

            </Card>

          </div>

        )}

      </Async>

    </>
  )
}