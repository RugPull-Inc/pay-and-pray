import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '@/src/services/apiClient'
import { searchCompanies } from '@/src/services/companyService'
import TickerInput from '@/src/components/TickerInput'

export interface WatchlistItem {
  ticker: string
  hasOpenPosition: boolean
}

interface WatchlistResponse {
  items: WatchlistItem[]
}

interface ErrorBody {
  error?: string
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [ticker, setTicker] = useState('')
  const [actionError, setActionError] = useState('')

  const loadWatchlist = useCallback(async () => {
    setLoading(true)
    setLoadError('')

    try {
      const res = await apiFetch('/watchlist')
      if (!res.ok) throw new Error('Watchlist request failed')
      const data = (await res.json()) as WatchlistResponse
      setItems(data.items)
    } catch {
      setLoadError('No se pudo cargar la watchlist.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWatchlist()
  }, [loadWatchlist])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const value = ticker.trim()
    if (!value) return

    setActionError('')

    if (items.some((item) => item.ticker === value)) {
      setActionError('El ticker ya está en tu watchlist.')
      return
    }

    try {
      const results = await searchCompanies(value)
      const exists = results.some((r) => r.ticker?.toUpperCase() === value)
      if (!exists) {
        setActionError('No existe una empresa con ese ticker.')
        return
      }
    } catch {
      setActionError('No se pudo agregar el ticker.')
      return
    }

    try {
      const res = await apiFetch('/watchlist', {
        method: 'POST',
        body: JSON.stringify({ ticker: value }),
      })
      const data = (await res.json()) as ErrorBody

      if (!res.ok) {
        setActionError(data.error ?? 'No se pudo agregar el ticker.')
        return
      }

      setTicker('')
      await loadWatchlist()
    } catch {
      setActionError('No se pudo agregar el ticker.')
    }
  }

  async function handleRemove(itemTicker: string) {
    setActionError('')

    try {
      const res = await apiFetch(`/watchlist/${itemTicker}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = (await res.json()) as ErrorBody
        setActionError(data.error ?? 'No se pudo quitar el ticker.')
        return
      }

      await loadWatchlist()
    } catch {
      setActionError('No se pudo quitar el ticker.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 pt-24 pb-8">
        <p className="text-sm text-zinc-400">Cargando watchlist...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 pt-24 pb-8">
        <p className="text-sm text-red-400">{loadError}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 pt-24 pb-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Watchlist</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Seguí la evolución de empresas sin necesidad de tener posiciones
            abiertas.
          </p>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2">
          <div className="flex-1">
            <TickerInput value={ticker} onChange={setTicker} />
          </div>
          <button
            type="submit"
            disabled={!ticker.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Agregar
          </button>
        </form>

        {actionError && (
          <p className="text-sm text-red-400">{actionError}</p>
        )}

        {items.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Tu watchlist está vacía. Agregá empresas para seguirlas.
          </p>
        ) : (
          <div className="scrollbar-hidden overflow-x-auto border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="py-3 px-4 text-left font-medium text-zinc-400">
                    Ticker
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-zinc-400">
                    Posición abierta
                  </th>
                  <th className="py-3 px-4 text-right font-medium text-zinc-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.ticker}
                    data-ticker={item.ticker}
                    className="border-b border-zinc-800/60"
                  >
                    <td className="py-3 px-4 font-semibold text-zinc-100">
                      {item.ticker}
                    </td>
                    <td className="py-3 px-4">
                      {item.hasOpenPosition ? (
                        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                          Tengo posición
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">
                          Sin posición
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/companies/${item.ticker}`}
                          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
                        >
                          Visitar empresa
                        </Link>
                        <button
                          onClick={() => handleRemove(item.ticker)}
                          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
                        >
                          Quitar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
