import { apiFetch } from './apiClient'

export interface WatchlistItem {
  ticker: string
  hasOpenPosition: boolean
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const res = await apiFetch('/watchlist')
  if (!res.ok) throw new Error('Watchlist request failed')
  const data = (await res.json()) as { items: WatchlistItem[] }
  return data.items
}

export async function addToWatchlist(ticker: string): Promise<void> {
  const res = await apiFetch('/watchlist', {
    method: 'POST',
    body: JSON.stringify({ ticker }),
  })
  const data = (await res.json()) as { error?: string }
  if (!res.ok) throw new Error(data.error ?? 'No se pudo agregar el ticker.')
}

export async function removeFromWatchlist(ticker: string): Promise<void> {
  const res = await apiFetch(`/watchlist/${ticker}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = (await res.json()) as { error?: string }
    throw new Error(data.error ?? 'No se pudo quitar el ticker.')
  }
}
