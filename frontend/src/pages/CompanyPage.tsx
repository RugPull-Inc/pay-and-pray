import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { fetchCompanyByTicker } from '@/src/services/companyService'
import type {
  CompanyFinancialsResponse,
  MetricValue,
  QuarterlySnapshot,
} from '@/src/types/company'
import FinancialChart from '@/src/components/FinancialChart'

export default function CompanyPage() {
  const { ticker = '' } = useParams()
  const normalizedTicker = ticker.toUpperCase()
  const [data, setData] = useState<CompanyFinancialsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchCompanyByTicker(normalizedTicker)
      .then((result) => {
        if (!result)
          setError('Company not found or no financial data available.')
        else setData(result)
      })
      .catch(() => setError('Could not reach the server. Please try again.'))
      .finally(() => setLoading(false))
  }, [normalizedTicker])

  if (loading) return <LoadingState />
  if (error || !data) return <ErrorState message={error ?? 'Unknown error.'} />

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <Header data={data} />
        <MetricsGrid metrics={data.metrics} />
        <ChartSection history={data.quarterlyHistory} />
        <FilingsSection filings={data.recentFilings} />
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 size={32} className="text-indigo-400 animate-spin" />
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-6 p-4">
      <div className="flex items-center gap-3 text-red-400">
        <AlertCircle size={24} />
        <p className="text-sm">{message}</p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to search
      </Link>
    </div>
  )
}

function Header({ data }: { data: CompanyFinancialsResponse }) {
  return (
    <div className="space-y-4">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to search
      </Link>
      <div className="flex items-start gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">
              {data.companyName}
            </h1>
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-mono font-semibold">
              {data.ticker}
            </span>
          </div>
          <p className="text-zinc-500 text-sm mt-1">CIK: {data.cik}</p>
        </div>
      </div>
    </div>
  )
}

function formatCurrency(v: number): string {
  if (Math.abs(v) >= 1e12) return `$${(v / 1e12).toFixed(2)}T`
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(2)}M`
  return `$${v.toLocaleString()}`
}

function MetricCard({
  label,
  metric,
  format = formatCurrency,
  colorize = false,
}: {
  label: string
  metric: MetricValue | null
  format?: (v: number) => string
  colorize?: boolean
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-2">
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
        {label}
      </p>
      {metric ? (
        <>
          <p
            className={`text-2xl font-bold tabular-nums ${colorize && metric.value < 0 ? 'text-red-400' : colorize ? 'text-emerald-400' : 'text-zinc-100'}`}
          >
            {format(metric.value)}
          </p>
          <p className="text-xs text-zinc-500">{metric.period}</p>
        </>
      ) : (
        <>
          <p className="text-2xl font-bold text-zinc-700">-</p>
          <p className="text-xs text-zinc-600">No data available</p>
        </>
      )}
    </div>
  )
}

function MetricsGrid({
  metrics,
}: {
  metrics: CompanyFinancialsResponse['metrics']
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-zinc-200">
        Key Financial Metrics
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard label="Revenue" metric={metrics.revenue} />
        <MetricCard label="Net Income" metric={metrics.netIncome} colorize />
        <MetricCard
          label="EPS"
          metric={metrics.eps}
          colorize
          format={(v) => `$${v.toFixed(2)}`}
        />
        <MetricCard label="Total Assets" metric={metrics.totalAssets} />
        <MetricCard
          label="Total Liabilities"
          metric={metrics.totalLiabilities}
          colorize
        />
      </div>
    </section>
  )
}

function ChartSection({ history }: { history: QuarterlySnapshot[] }) {
  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-200">
          Historical Evolution
        </h2>
        <p className="text-sm text-zinc-500">{history.length} quarters</p>
      </div>
      {history.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-zinc-600 text-sm">
          No historical data available
        </div>
      ) : (
        <FinancialChart history={history} />
      )}
    </section>
  )
}

function FilingsSection({
  filings,
}: {
  filings: CompanyFinancialsResponse['recentFilings']
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-zinc-200">Recent Filings</h2>
      {filings.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center text-zinc-600 text-sm">
          No filings available
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-zinc-400 font-medium">
                  Type
                </th>
                <th className="text-left px-5 py-3 text-zinc-400 font-medium">
                  Filed
                </th>
                <th className="text-left px-5 py-3 text-zinc-400 font-medium hidden sm:table-cell">
                  Period
                </th>
                <th className="text-left px-5 py-3 text-zinc-400 font-medium hidden md:table-cell">
                  Accession #
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filings.map((f, i) => (
                <tr
                  key={f.accessionNumber}
                  className={`hover:bg-zinc-800/40 transition-colors ${i < filings.length - 1 ? 'border-b border-zinc-800/50' : ''}`}
                >
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${f.type === '10-K' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'}`}
                    >
                      <FileText size={11} />
                      {f.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-zinc-300 font-mono">
                    {f.filedDate}
                  </td>
                  <td className="px-5 py-3 text-zinc-400 font-mono hidden sm:table-cell">
                    {f.reportDate ?? <span className="text-zinc-700">-</span>}
                  </td>
                  <td className="px-5 py-3 text-zinc-600 font-mono text-xs hidden md:table-cell">
                    {f.accessionNumber}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 transition-colors text-xs font-medium"
                    >
                      View -&gt;
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
