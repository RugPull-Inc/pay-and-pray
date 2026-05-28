export interface MetricValue {
  value: number
  unit: string
  period: string
  form: string
}

export interface QuarterlySnapshot {
  period: string
  fiscalYear: number
  fiscalPeriod: string
  revenue: number | null
  netIncome: number | null
  eps: number | null
  totalAssets: number | null
  totalLiabilities: number | null
}

export interface FilingInfo {
  type: string
  filedDate: string
  reportDate: string | null
  accessionNumber: string
  primaryDocument: string | null
  url: string
}

export interface CompanyFinancialsResponse {
  ticker: string
  companyName: string
  cik: string
  metrics: {
    revenue: MetricValue | null
    netIncome: MetricValue | null
    eps: MetricValue | null
    totalAssets: MetricValue | null
    totalLiabilities: MetricValue | null
  }
  quarterlyHistory: QuarterlySnapshot[]
  recentFilings: FilingInfo[]
}
