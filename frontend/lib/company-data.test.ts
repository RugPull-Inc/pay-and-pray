import { adaptDetailsResponse } from './company-data'

// Minimal backend response builder
function makeBackendResponse(
  overrides: Partial<Parameters<typeof adaptDetailsResponse>[0]> = {}
) {
  return {
    cik: '320193',
    name: 'Apple Inc.',
    ticker: 'AAPL',
    metrics: {
      revenue: [],
      netIncome: [],
      eps: [],
      totalAssets: [],
      totalLiabilities: [],
    },
    recentFilings: [],
    ...overrides,
  }
}

function makeDataPoint(
  period: string,
  value: number,
  fiscalYear: number | null = 2024,
  fiscalPeriod: string | null = 'Q3'
) {
  return {
    period,
    value,
    form: '10-Q',
    filed: period,
    fiscalYear,
    fiscalPeriod,
  }
}

describe('adaptDetailsResponse', () => {
  describe('top-level fields', () => {
    it('maps name to companyName', () => {
      const result = adaptDetailsResponse(makeBackendResponse())
      expect(result.companyName).toBe('Apple Inc.')
    })

    it('maps null ticker to empty string', () => {
      const result = adaptDetailsResponse(makeBackendResponse({ ticker: null }))
      expect(result.ticker).toBe('')
    })

    it('passes cik through', () => {
      const result = adaptDetailsResponse(
        makeBackendResponse({ cik: '789019' })
      )
      expect(result.cik).toBe('789019')
    })
  })

  describe('toMetricValue', () => {
    it('returns null when metric list is empty', () => {
      const result = adaptDetailsResponse(makeBackendResponse())
      expect(result.metrics.revenue).toBeNull()
      expect(result.metrics.eps).toBeNull()
    })

    it('picks the first (most recent) data point', () => {
      const result = adaptDetailsResponse(
        makeBackendResponse({
          metrics: {
            revenue: [
              makeDataPoint('2024-06-29', 85777, 2024, 'Q3'),
              makeDataPoint('2023-06-30', 81797, 2023, 'Q3'),
            ],
            netIncome: [],
            eps: [],
            totalAssets: [],
            totalLiabilities: [],
          },
        })
      )
      expect(result.metrics.revenue?.value).toBe(85777)
    })

    it('formats period as fiscalYear-fiscalPeriod when both present', () => {
      const result = adaptDetailsResponse(
        makeBackendResponse({
          metrics: {
            revenue: [makeDataPoint('2024-06-29', 100, 2024, 'Q3')],
            netIncome: [],
            eps: [],
            totalAssets: [],
            totalLiabilities: [],
          },
        })
      )
      expect(result.metrics.revenue?.period).toBe('2024-Q3')
    })

    it('falls back to raw period when fiscal fields are null', () => {
      const result = adaptDetailsResponse(
        makeBackendResponse({
          metrics: {
            revenue: [makeDataPoint('2024-06-29', 100, null, null)],
            netIncome: [],
            eps: [],
            totalAssets: [],
            totalLiabilities: [],
          },
        })
      )
      expect(result.metrics.revenue?.period).toBe('2024-06-29')
    })
  })

  describe('buildQuarterlyHistory', () => {
    it('returns empty array when all metrics are empty', () => {
      const result = adaptDetailsResponse(makeBackendResponse())
      expect(result.quarterlyHistory).toHaveLength(0)
    })

    it('produces one snapshot per unique period', () => {
      const result = adaptDetailsResponse(
        makeBackendResponse({
          metrics: {
            revenue: [
              makeDataPoint('2024-06-29', 85777, 2024, 'Q3'),
              makeDataPoint('2024-03-30', 90753, 2024, 'Q2'),
            ],
            netIncome: [
              makeDataPoint('2024-06-29', 21448, 2024, 'Q3'),
              makeDataPoint('2024-03-30', 23636, 2024, 'Q2'),
            ],
            eps: [],
            totalAssets: [],
            totalLiabilities: [],
          },
        })
      )
      expect(result.quarterlyHistory).toHaveLength(2)
    })

    it('sorts snapshots chronologically ascending', () => {
      const result = adaptDetailsResponse(
        makeBackendResponse({
          metrics: {
            revenue: [
              makeDataPoint('2024-06-29', 85777),
              makeDataPoint('2023-09-30', 89498),
              makeDataPoint('2024-03-30', 90753),
            ],
            netIncome: [],
            eps: [],
            totalAssets: [],
            totalLiabilities: [],
          },
        })
      )
      const periods = result.quarterlyHistory.map((s) => s.period)
      expect(periods).toEqual(['2023-09-30', '2024-03-30', '2024-06-29'])
    })

    it('fills null for metrics absent in a given period', () => {
      const result = adaptDetailsResponse(
        makeBackendResponse({
          metrics: {
            revenue: [makeDataPoint('2024-06-29', 85777)],
            netIncome: [],
            eps: [],
            totalAssets: [],
            totalLiabilities: [],
          },
        })
      )
      const snap = result.quarterlyHistory[0]
      expect(snap.revenue).toBe(85777)
      expect(snap.netIncome).toBeNull()
      expect(snap.eps).toBeNull()
    })

    it('merges all five metrics into the same snapshot when they share a period', () => {
      const dp = (v: number) => makeDataPoint('2024-06-29', v, 2024, 'Q3')
      const result = adaptDetailsResponse(
        makeBackendResponse({
          metrics: {
            revenue: [dp(85777)],
            netIncome: [dp(21448)],
            eps: [dp(1.4)],
            totalAssets: [dp(331610)],
            totalLiabilities: [dp(279032)],
          },
        })
      )
      expect(result.quarterlyHistory).toHaveLength(1)
      const snap = result.quarterlyHistory[0]
      expect(snap.revenue).toBe(85777)
      expect(snap.netIncome).toBe(21448)
      expect(snap.eps).toBe(1.4)
      expect(snap.totalAssets).toBe(331610)
      expect(snap.totalLiabilities).toBe(279032)
    })

    it('carries fiscalYear and fiscalPeriod into the snapshot', () => {
      const result = adaptDetailsResponse(
        makeBackendResponse({
          metrics: {
            revenue: [makeDataPoint('2024-06-29', 85777, 2024, 'Q3')],
            netIncome: [],
            eps: [],
            totalAssets: [],
            totalLiabilities: [],
          },
        })
      )
      const snap = result.quarterlyHistory[0]
      expect(snap.fiscalYear).toBe(2024)
      expect(snap.fiscalPeriod).toBe('Q3')
    })
  })

  describe('recentFilings mapping', () => {
    const filing = {
      accessionNumber: '0000320193-24-000123',
      filingDate: '2024-11-01',
      reportDate: '2024-09-28',
      form: '10-K',
      primaryDocument: 'aapl-20240928.htm',
      url: 'https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/aapl-20240928.htm',
    }

    it('maps form to type', () => {
      const result = adaptDetailsResponse(
        makeBackendResponse({ recentFilings: [filing] })
      )
      expect(result.recentFilings[0].type).toBe('10-K')
    })

    it('maps filingDate to filedDate', () => {
      const result = adaptDetailsResponse(
        makeBackendResponse({ recentFilings: [filing] })
      )
      expect(result.recentFilings[0].filedDate).toBe('2024-11-01')
    })

    it('passes reportDate through', () => {
      const result = adaptDetailsResponse(
        makeBackendResponse({ recentFilings: [filing] })
      )
      expect(result.recentFilings[0].reportDate).toBe('2024-09-28')
    })

    it('passes url through', () => {
      const result = adaptDetailsResponse(
        makeBackendResponse({ recentFilings: [filing] })
      )
      expect(result.recentFilings[0].url).toBe(filing.url)
    })

    it('falls back to # when url is null', () => {
      const result = adaptDetailsResponse(
        makeBackendResponse({ recentFilings: [{ ...filing, url: null }] })
      )
      expect(result.recentFilings[0].url).toBe('#')
    })

    it('sets reportDate to null when backend sends null', () => {
      const result = adaptDetailsResponse(
        makeBackendResponse({
          recentFilings: [{ ...filing, reportDate: null }],
        })
      )
      expect(result.recentFilings[0].reportDate).toBeNull()
    })
  })
})
