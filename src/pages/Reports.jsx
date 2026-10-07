import { ArrowLeftRight, Download, Eye, FileText, PieChart, TrendingUp } from 'lucide-react'
import { Async, Button, Card, PageHeader } from '../components/common'
import { useToast } from '../components/common/Toast'
import useAsync from '../hooks/useAsync'
import { getReports } from '../services/api'

const icons = { PieChart, ArrowLeftRight, TrendingUp, FileText }

export default function Reports() {
  const state = useAsync(getReports)
  const toast = useToast()
  return (
    <>
      <PageHeader title="Reports" subtitle="Download or view your statements." />
      <Async state={state}>
        {(reports) => (
          <div className="grid gap-4 sm:grid-cols-2">
            {reports.map((r) => {
              const Icon = icons[r.icon]
              return (
                <Card key={r.id}>
                  <div className="flex items-start gap-4">
                    <span className="rounded-xl bg-green-50 p-3 text-green-600"><Icon size={22} /></span>
                    <div><h2 className="font-semibold text-slate-900">{r.title}</h2><p className="mt-1 text-sm text-slate-500">{r.description}</p></div>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <Button className="flex-1" onClick={() => { console.log('Download report:', r.id); toast(`${r.title} download started (demo).`) }}><Download size={16} /> Download</Button>
                    <Button variant="outline" className="flex-1" onClick={() => toast(`Preview for ${r.title} is not available in this demo.`, 'info')}><Eye size={16} /> View</Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </Async>
    </>
  )
}
