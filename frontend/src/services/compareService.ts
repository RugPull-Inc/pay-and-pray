import { apiFetch } from './apiClient'

export interface CompareEntry {
  ticker: string
  companyName: string
  price: number | null
  marketCap: number | null
  revenue: number | null
  netIncome: number | null
  eps: number | null
  totalAssets: number | null
  totalLiabilities: number | null
  lastFiling: string | null
  lastUpdated: string | null
}

export async function fetchCompareData(tickers: string[]): Promise<CompareEntry[]> {
  const query = tickers.map((t) => `tickers=${encodeURIComponent(t)}`).join('&')
  const res = await apiFetch(`/watchlist/compare?${query}`)
  if (!res.ok) throw new Error('No se pudo cargar la comparación.')
  return res.json() as Promise<CompareEntry[]>
}
