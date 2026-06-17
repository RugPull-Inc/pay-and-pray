import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchCompanies } from '@/src/services/companyService'
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from '@/src/services/watchlistService'
import type { WatchlistItem } from '@/src/services/watchlistService'
import TickerInput from '@/src/components/TickerInput'

export type { WatchlistItem }

export default function WatchlistPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [ticker, setTicker] = useState('')
  const [actionError, setActionError] = useState('')
  const [selectionMode, setSelectionMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const loadWatchlist = useCallback(async () => {
    setLoading(true)
    setLoadError('')

    try {
      setItems(await getWatchlist())
    } catch {
      setLoadError('No se pudo cargar la watchlist.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWatchlist()
  }, [loadWatchlist])

  function enterSelectionMode() {
    setSelectionMode(true)
    setSelected(new Set())
  }

  function exitSelectionMode() {
    setSelectionMode(false)
    setSelected(new Set())
  }

  function toggleSelect(itemTicker: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(itemTicker)) {
        next.delete(itemTicker)
      } else if (next.size < 2) {
        next.add(itemTicker)
      }
      return next
    })
  }

  function handleCompare() {
    const [a, b] = Array.from(selected)
    navigate(`/watchlist/compare?tickers=${a},${b}`)
  }

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
      await addToWatchlist(value)
      setTicker('')
      await loadWatchlist()
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : 'No se pudo agregar el ticker.'
      )
    }
  }

  async function handleRemove(itemTicker: string) {
    setActionError('')

    try {
      await removeFromWatchlist(itemTicker)
      await loadWatchlist()
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : 'No se pudo quitar el ticker.'
      )
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

        {actionError && <p className="text-sm text-red-400">{actionError}</p>}

        {items.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Tu watchlist está vacía. Agregá empresas para seguirlas.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              {selectionMode ? (
                <>
                  <p className="text-base font-semibold text-zinc-100">
                    {selected.size === 0
                      ? 'Seleccioná 2 empresas para comparar'
                      : selected.size === 1
                        ? 'Seleccioná 1 más'
                        : '¡Listas para comparar!'}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={exitSelectionMode}
                      className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleCompare}
                      disabled={selected.size !== 2}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Comparar
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex justify-end w-full">
                  <button
                    type="button"
                    onClick={enterSelectionMode}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                  >
                    Comparar empresas
                  </button>
                </div>
              )}
            </div>

            <div className="scrollbar-hidden overflow-x-auto border border-zinc-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    {selectionMode && <th className="py-3 pl-4 pr-2 w-10" />}
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
                      {selectionMode && (
                        <td className="py-3 pl-4 pr-2">
                          <label className="flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={selected.has(item.ticker)}
                              onChange={() => toggleSelect(item.ticker)}
                              disabled={
                                selected.size >= 2 && !selected.has(item.ticker)
                              }
                            />
                            <span
                              className={[
                                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                selected.has(item.ticker)
                                  ? 'border-indigo-500 bg-indigo-500/10'
                                  : 'border-zinc-700 bg-zinc-950',
                              ].join(' ')}
                            >
                              {selected.has(item.ticker) && (
                                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                              )}
                            </span>
                          </label>
                        </td>
                      )}
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
          </div>
        )}
      </div>
    </div>
  )
}
