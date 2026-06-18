import { apiFetch } from './apiClient'

export interface CompareEntry {
  ticker: string
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

interface BackendCompany {
  ticker: string
  currentPrice: number | null
  marketCap: number | null
  revenueQuarterly: number | null
  netIncomeQuarterly: number | null
  epsQuarterly: number | null
  totalAssets: number | null
  totalLiabilities: number | null
  lastFiling: { filingDate: string } | null
  priceLastUpdatedAt: string | null
}

interface BackendCompareResponse {
  company1: BackendCompany
  company2: BackendCompany
}

function adapt(c: BackendCompany): CompareEntry {
  return {
    ticker: c.ticker,
    price: c.currentPrice,
    marketCap: c.marketCap,
    revenue: c.revenueQuarterly,
    netIncome: c.netIncomeQuarterly,
    eps: c.epsQuarterly,
    totalAssets: c.totalAssets,
    totalLiabilities: c.totalLiabilities,
    lastFiling: c.lastFiling?.filingDate ?? null,
    lastUpdated: c.priceLastUpdatedAt,
  }
}

export async function fetchCompareData(
  tickers: string[],
  signal?: AbortSignal
): Promise<CompareEntry[]> {
  const [ticker1, ticker2] = tickers
  const res = await apiFetch(
    `/watchlist/compare?ticker1=${encodeURIComponent(ticker1)}&ticker2=${encodeURIComponent(ticker2)}`,
    { signal }
  )
  if (!res.ok) throw new Error('No se pudo cargar la comparación.')
  const data = (await res.json()) as BackendCompareResponse
  return [adapt(data.company1), adapt(data.company2)]
}
