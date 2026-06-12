import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '@/src/services/apiClient'
import PriceStatusBar from '@/src/components/PriceStatusBar'

export interface PortfolioPosition {
  ticker: string
  quantity: number
  avgBuyPrice: number
  currentPrice?: number | null
  currentValue?: number | null
  pnl?: number | null
  pnlPercentage?: number | null
}

interface PortfolioResponse {
  positions: PortfolioPosition[]
  totalValue: number
}

const unavailableTitle = 'Precio no disponible'

export function formatMoney(value: number, withSign = false) {
  const sign = withSign && value > 0 ? '+' : ''
  return `${sign}${new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`
}

export function formatPercent(value: number) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function UnavailableCell({ align = 'right' }: { align?: 'left' | 'right' }) {
  const alignClass = align === 'right' ? 'text-right' : 'text-left'

  return (
    <td className={`py-3 px-4 ${alignClass} text-zinc-500`}>
      <span title={unavailableTitle} aria-label={unavailableTitle}>
        &mdash;
      </span>
    </td>
  )
}

function pnlClass(value: number | null | undefined) {
  if (value == null || value === 0) return 'text-zinc-300'
  return value > 0 ? 'text-emerald-400' : 'text-red-400'
}

function PortfolioRow({ position }: { position: PortfolioPosition }) {
  const { currentPrice, currentValue, pnl, pnlPercentage } = position
  const priceUnavailable = currentPrice == null

  return (
    <tr className="border-b border-zinc-800/60">
      <td className="py-3 px-4 font-semibold text-zinc-100">
        {position.ticker}
      </td>
      <td className="py-3 px-4 text-right text-zinc-300">
        {position.quantity}
      </td>
      <td className="py-3 px-4 text-right text-zinc-300">
        {formatMoney(position.avgBuyPrice)}
      </td>
      {priceUnavailable ? (
        <UnavailableCell />
      ) : (
        <td className="py-3 px-4 text-right text-zinc-300">
          {formatMoney(currentPrice)}
        </td>
      )}
      {priceUnavailable || currentValue == null ? (
        <UnavailableCell />
      ) : (
        <td className="py-3 px-4 text-right text-zinc-300">
          {formatMoney(currentValue)}
        </td>
      )}
      {priceUnavailable || pnl == null ? (
        <UnavailableCell />
      ) : (
        <td
          className={`portfolio-pnl-value py-3 px-4 text-right font-medium ${pnlClass(
            pnl
          )}`}
        >
          {formatMoney(pnl, true)}
        </td>
      )}
      {priceUnavailable || pnlPercentage == null ? (
        <UnavailableCell />
      ) : (
        <td
          className={`portfolio-pnl-percent py-3 px-4 text-right font-medium ${pnlClass(
            pnlPercentage
          )}`}
        >
          {formatPercent(pnlPercentage)}
        </td>
      )}
    </tr>
  )
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    apiFetch('/portfolio')
      .then(async (response) => {
        if (!response.ok) throw new Error('Portfolio request failed')
        return response.json() as Promise<PortfolioResponse>
      })
      .then((data) => {
        if (!cancelled) setPortfolio(data)
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar el portfolio.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <p className="text-sm text-zinc-400">Cargando portfolio...</p>
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>
  }

  if (!portfolio || portfolio.positions.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Tu portfolio est&aacute; vac&iacute;o. Empez&aacute; comprando
          acciones.
        </p>
        <Link
          to="/portfolio/buy"
          className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Comprar acciones
        </Link>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Portfolio</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Posiciones actuales, valor de mercado y P&amp;L.
          </p>
          <div className="mt-2">
            <PriceStatusBar />
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/portfolio/buy"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Comprar
          </Link>
          <Link
            to="/portfolio/sell"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
          >
            Vender
          </Link>
        </div>
      </div>

      <div className="scrollbar-hidden overflow-x-auto border border-zinc-800">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="py-3 px-4 text-left font-medium text-zinc-400">
                Ticker
              </th>
              <th className="py-3 px-4 text-right font-medium text-zinc-400">
                Cantidad
              </th>
              <th className="py-3 px-4 text-right font-medium text-zinc-400">
                Precio promedio de compra
              </th>
              <th className="py-3 px-4 text-right font-medium text-zinc-400">
                Precio actual
              </th>
              <th className="py-3 px-4 text-right font-medium text-zinc-400">
                Valor actual
              </th>
              <th className="py-3 px-4 text-right font-medium text-zinc-400">
                P&amp;L ($)
              </th>
              <th className="py-3 px-4 text-right font-medium text-zinc-400">
                P&amp;L (%)
              </th>
            </tr>
          </thead>
          <tbody>
            {portfolio.positions.map((position) => (
              <PortfolioRow key={position.ticker} position={position} />
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-700 bg-zinc-900/70">
              <td
                colSpan={4}
                className="py-3 px-4 text-right font-semibold text-zinc-100"
              >
                Valor total del portfolio
              </td>
              <td className="py-3 px-4 text-right font-semibold text-zinc-100">
                {formatMoney(portfolio.totalValue)}
              </td>
              <td className="py-3 px-4" />
              <td className="py-3 px-4" />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
