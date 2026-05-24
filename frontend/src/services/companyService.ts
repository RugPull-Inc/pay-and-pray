import type {
  CompanyFinancialsResponse,
  MetricValue,
  QuarterlySnapshot,
  FilingInfo,
} from '@/src/types/company'
import { apiFetch } from './apiClient'

interface BackendMetricDataPoint {
  period: string
  value: number
  form: string
  filed: string
  fiscalYear: number | null
  fiscalPeriod: string | null
}

interface BackendMetrics {
  revenue: BackendMetricDataPoint[]
  netIncome: BackendMetricDataPoint[]
  eps: BackendMetricDataPoint[]
  totalAssets: BackendMetricDataPoint[]
  totalLiabilities: BackendMetricDataPoint[]
}

interface BackendFilingEntry {
  accessionNumber: string
  filingDate: string
  reportDate: string | null
  form: string
  primaryDocument: string | null
  url: string | null
}

interface BackendDetailsResponse {
  cik: string
  name: string
  ticker: string | null
  metrics: BackendMetrics
  recentFilings: BackendFilingEntry[]
}

export interface BackendSearchResult {
  name: string
  ticker: string | null
  cik: string | null
}

interface BackendSearchResponse {
  results: BackendSearchResult[]
  total: number
}

function toMetricValue(dps: BackendMetricDataPoint[]): MetricValue | null {
  const latest = dps[0]
  if (!latest) return null
  const period =
    latest.fiscalYear && latest.fiscalPeriod
      ? `${latest.fiscalYear}-${latest.fiscalPeriod}`
      : latest.period
  return { value: latest.value, unit: 'USD', period, form: latest.form }
}

function buildQuarterlyHistory(metrics: BackendMetrics): QuarterlySnapshot[] {
  const map = new Map<string, QuarterlySnapshot>()

  const merge = (
    dps: BackendMetricDataPoint[],
    key: keyof Pick<
      QuarterlySnapshot,
      'revenue' | 'netIncome' | 'eps' | 'totalAssets' | 'totalLiabilities'
    >
  ) => {
    for (const dp of dps) {
      if (!map.has(dp.period)) {
        map.set(dp.period, {
          period: dp.period,
          fiscalYear: dp.fiscalYear ?? 0,
          fiscalPeriod: dp.fiscalPeriod ?? '',
          revenue: null,
          netIncome: null,
          eps: null,
          totalAssets: null,
          totalLiabilities: null,
        })
      }
      const snap = map.get(dp.period)!
      snap[key] = dp.value
      if (dp.fiscalYear) snap.fiscalYear = dp.fiscalYear
      if (dp.fiscalPeriod) snap.fiscalPeriod = dp.fiscalPeriod
    }
  }

  merge(metrics.revenue, 'revenue')
  merge(metrics.netIncome, 'netIncome')
  merge(metrics.eps, 'eps')
  merge(metrics.totalAssets, 'totalAssets')
  merge(metrics.totalLiabilities, 'totalLiabilities')

  return Array.from(map.values()).sort((a, b) =>
    a.period.localeCompare(b.period)
  )
}

export function adaptDetailsResponse(
  backend: BackendDetailsResponse
): CompanyFinancialsResponse {
  return {
    ticker: backend.ticker ?? '',
    companyName: backend.name,
    cik: backend.cik,
    metrics: {
      revenue: toMetricValue(backend.metrics.revenue),
      netIncome: toMetricValue(backend.metrics.netIncome),
      eps: toMetricValue(backend.metrics.eps),
      totalAssets: toMetricValue(backend.metrics.totalAssets),
      totalLiabilities: toMetricValue(backend.metrics.totalLiabilities),
    },
    quarterlyHistory: buildQuarterlyHistory(backend.metrics),
    recentFilings: backend.recentFilings.map(
      (f): FilingInfo => ({
        type: f.form,
        filedDate: f.filingDate,
        reportDate: f.reportDate ?? null,
        accessionNumber: f.accessionNumber,
        primaryDocument: f.primaryDocument ?? null,
        url: f.url ?? '#',
      })
    ),
  }
}

export async function searchCompanies(
  query: string
): Promise<BackendSearchResult[]> {
  const res = await apiFetch(
    `/companies/search?q=${encodeURIComponent(query)}`
  )
  if (!res.ok) return []
  const data: BackendSearchResponse = await res.json()
  return data.results
}

export async function fetchCompanyByTicker(
  ticker: string
): Promise<CompanyFinancialsResponse | null> {
  const searchRes = await apiFetch(
    `/companies/search?q=${encodeURIComponent(ticker)}`
  )
  if (!searchRes.ok) return null
  const searchData: BackendSearchResponse = await searchRes.json()

  const match =
    searchData.results.find(
      (r) => r.ticker?.toUpperCase() === ticker.toUpperCase()
    ) ?? searchData.results[0]
  if (!match?.cik) return null

  const detailsRes = await apiFetch(`/companies/${match.cik}/details`)
  if (!detailsRes.ok) return null
  const details: BackendDetailsResponse = await detailsRes.json()
  return adaptDetailsResponse(details)
}
