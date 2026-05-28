import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { sell, PortfolioServiceError } from '@/src/services/portfolioService'
import TickerInput from '@/src/components/TickerInput'

export default function SellPage() {
  const [searchParams] = useSearchParams()
  const [ticker, setTicker] = useState(searchParams.get('ticker') ?? '')
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')

    const qty = parseInt(quantity, 10)
    if (!ticker.trim()) {
      setErrorMsg('El ticker es requerido')
      return
    }
    if (!qty || qty <= 0) {
      setErrorMsg('La cantidad debe ser mayor a cero')
      return
    }

    setLoading(true)
    try {
      const data = await sell(ticker.trim().toUpperCase(), qty)
      setSuccessMsg(
        `Venta registrada: ${data.quantity} unidades de ${data.ticker}`
      )
      setQuantity('')
    } catch (error) {
      if (error instanceof PortfolioServiceError) {
        setErrorMsg(error.message)
        return
      }
      setErrorMsg('Could not connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 pt-24 pb-8">
      <div className="max-w-sm mx-auto space-y-8">
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to search
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Sell shares</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="ticker"
              className="text-sm font-medium text-zinc-400"
            >
              Ticker
            </label>
            <TickerInput value={ticker} onChange={setTicker} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="quantity"
              className="text-sm font-medium text-zinc-400"
            >
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
              className="rounded-xl border border-zinc-700 px-3.5 py-3 text-sm text-zinc-100 bg-zinc-900 outline-none transition focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400 text-center">{errorMsg}</p>
          )}
          {successMsg && (
            <p className="text-xs text-green-400 text-center">{successMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/40 disabled:cursor-not-allowed py-3 text-sm font-medium text-white transition-colors cursor-pointer"
          >
            {loading ? 'Processing...' : 'Sell'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Want to buy?{' '}
          <Link
            to="/portfolio/buy"
            className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Go to Buy
          </Link>
        </p>
      </div>
    </div>
  )
}
