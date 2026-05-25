import { toChartData } from './FinancialChart'
import type { QuarterlySnapshot } from '@/src/types/company'

function snapshot(
  period: string,
  fiscalYear: number,
  fiscalPeriod: string
): QuarterlySnapshot {
  return {
    period,
    fiscalYear,
    fiscalPeriod,
    revenue: 100,
    netIncome: 50,
    eps: 1,
    totalAssets: null,
    totalLiabilities: null,
  }
}

describe('toChartData', () => {
  it('keeps history from oldest on the left to newest on the right', () => {
    const data = toChartData([
      snapshot('2023-09-30', 2023, 'Q4'),
      snapshot('2024-03-30', 2024, 'Q2'),
      snapshot('2024-06-29', 2024, 'Q3'),
    ])

    expect(data.map((point) => point.period)).toEqual([
      '2023-09-30',
      '2024-03-30',
      '2024-06-29',
    ])
  })
})
