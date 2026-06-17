import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { fetchCompareData } from '@/src/services/compareService'
import type { CompareEntry } from '@/src/services/compareService'

type MetricKey =
  | 'price'
  | 'marketCap'
  | 'revenue'
  | 'netIncome'
  | 'eps'
  | 'totalAssets'
  | 'totalLiabilities'
  | 'lastFiling'
  | 'lastUpdated'

const METRICS: Array<{ label: string; key: MetricKey }> = [
  { label: 'Precio actual', key: 'price' },
  { label: 'Market Cap', key: 'marketCap' },
  { label: 'Revenue (Q)', key: 'revenue' },
  { label: 'Net Income (Q)', key: 'netIncome' },
  { label: 'EPS (Q)', key: 'eps' },
  { label: 'Total Assets', key: 'totalAssets' },
  { label: 'Total Liabilities', key: 'totalLiabilities' },
  { label: 'Último filing', key: 'lastFiling' },
  { label: 'Última actualización', key: 'lastUpdated' },
]

function fmtNumber(val: number | null): string {
  if (val === null || val === undefined) return 'N/A'
  if (Math.abs(val) >= 1_000_000_000_000)
    return `${(val / 1_000_000_000_000).toFixed(2)}T`
  if (Math.abs(val) >= 1_000_000_000)
    return `${(val / 1_000_000_000).toFixed(2)}B`
  if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`
  return String(Math.round(val * 100) / 100)
}

function fmtDate(val: string | null): string {
  if (!val) return 'N/A'
  return val.slice(0, 10)
}

function fmt(key: MetricKey, val: string | number | null): string {
  if (val === null || val === undefined) return 'N/A'
  if (key === 'lastFiling' || key === 'lastUpdated')
    return fmtDate(val as string)
  if (key === 'price') return `$${fmtNumber(val as number)}`
  return fmtNumber(val as number)
}

export default function WatchlistComparePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tickers = (searchParams.get('tickers') ?? '').split(',').filter(Boolean)
  const tickerKey = tickers.join(',')

  const [data, setData] = useState<CompareEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (tickers.length !== 2) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchCompareData(tickers)
      .then(setData)
      .catch(() => setError('No se pudo cargar la comparación.'))
      .finally(() => setLoading(false))
  }, [tickerKey])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-sm text-zinc-400">Cargando comparación...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 pt-24 pb-8">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    )
  }

  if (data.length < 2) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 pt-24 pb-8">
        <p className="text-sm text-zinc-400">
          Seleccioná 2 empresas para comparar.
        </p>
      </div>
    )
  }

  const [a, b] = data

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 pt-24 pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <h1 className="text-4xl font-bold tracking-tight">
            {a.ticker}
            <span className="mx-3 text-zinc-100">vs</span>
            {b.ticker}
          </h1>
        </div>

        <div className="overflow-x-auto border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="py-3 px-4 text-left font-medium text-zinc-400">
                  Métrica
                </th>
                <th className="py-3 px-4 text-left font-medium text-zinc-200">
                  {a.ticker}
                </th>
                <th className="py-3 px-4 text-left font-medium text-zinc-200">
                  {b.ticker}
                </th>
              </tr>
            </thead>
            <tbody>
              {METRICS.map(({ label, key }) => (
                <tr key={key} className="border-b border-zinc-800/60">
                  <td className="py-3 px-4 font-medium text-zinc-400">
                    {label}
                  </td>
                  <td className="py-3 px-4 text-zinc-100">
                    {fmt(key, a[key])}
                  </td>
                  <td className="py-3 px-4 text-zinc-100">
                    {fmt(key, b[key])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
