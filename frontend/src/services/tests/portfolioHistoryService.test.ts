import {
  formatOperationDate,
  formatOperationPrice,
  getPortfolioHistory,
  PortfolioHistoryError,
} from '@/src/services/portfolioHistoryService'
import { apiFetch } from '@/src/services/apiClient'

jest.mock('@/src/services/apiClient', () => ({
  apiFetch: jest.fn(),
}))

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>

function response({
  ok,
  status,
  body,
}: {
  ok: boolean
  status: number
  body: unknown
}): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response
}

describe('getPortfolioHistory', () => {
  beforeEach(() => {
    mockApiFetch.mockReset()
  })

  it('fetches /portfolio/history and returns the operation list', async () => {
    const operations = [
      {
        id: '1',
        ticker: 'AAPL',
        type: 'SELL',
        quantity: 4,
        priceAtOperation: 105,
        createdAt: '2026-06-02T11:00:00Z',
      },
      {
        id: '2',
        ticker: 'AAPL',
        type: 'BUY',
        quantity: 10,
        priceAtOperation: 100,
        createdAt: '2026-06-02T10:00:00Z',
      },
    ]

    mockApiFetch.mockResolvedValue(
      response({ ok: true, status: 200, body: operations })
    )

    const result = await getPortfolioHistory()

    expect(mockApiFetch).toHaveBeenCalledWith('/portfolio/history')
    expect(result).toEqual(operations)
  })

  it('throws PortfolioHistoryError when the backend responds with an error', async () => {
    mockApiFetch.mockResolvedValue(
      response({ ok: false, status: 401, body: {} })
    )

    await expect(getPortfolioHistory()).rejects.toEqual(
      new PortfolioHistoryError('Could not load history.', 401)
    )
  })
})

describe('formatOperationDate', () => {
  it('formats an ISO string to DD/MM/YYYY HH:mm in UTC', () => {
    expect(formatOperationDate('2026-06-02T14:35:00Z')).toBe('02/06/2026 14:35')
  })

  it('zero-pads day, month, hours and minutes', () => {
    expect(formatOperationDate('2026-01-05T09:07:00Z')).toBe('05/01/2026 09:07')
  })
})

describe('formatOperationPrice', () => {
  it('formats a number as USD currency', () => {
    expect(formatOperationPrice(105.5)).toBe('$105.50')
  })

  it('formats a whole number with two decimal places', () => {
    expect(formatOperationPrice(100)).toBe('$100.00')
  })
})
