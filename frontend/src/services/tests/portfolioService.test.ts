import {
  buy,
  PortfolioServiceError,
  sell,
} from '@/src/services/portfolioService'
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

describe('portfolioService', () => {
  beforeEach(() => {
    mockApiFetch.mockReset()
  })

  it('sends buy requests to the backend contract', async () => {
    mockApiFetch.mockResolvedValue(
      response({
        ok: true,
        status: 201,
        body: {
          ticker: 'AAPL',
          quantity: 3,
          priceAtOperation: 100,
          newQuantity: 8,
          newAvgBuyPrice: 95,
        },
      })
    )

    const result = await buy(' aapl ', 3)

    expect(mockApiFetch).toHaveBeenCalledWith('/portfolio/buy', {
      method: 'POST',
      body: JSON.stringify({ ticker: 'AAPL', quantity: 3 }),
    })
    expect(result.newQuantity).toBe(8)
  })

  it('sends sell requests to the backend contract', async () => {
    mockApiFetch.mockResolvedValue(
      response({
        ok: true,
        status: 200,
        body: {
          ticker: 'AAPL',
          quantity: 2,
          priceAtOperation: 110,
          remainingQuantity: 6,
        },
      })
    )

    const result = await sell('AAPL', 2)

    expect(mockApiFetch).toHaveBeenCalledWith('/portfolio/sell', {
      method: 'POST',
      body: JSON.stringify({ ticker: 'AAPL', quantity: 2 }),
    })
    expect(result.remainingQuantity).toBe(6)
  })

  it('surfaces backend domain errors', async () => {
    mockApiFetch.mockResolvedValue(
      response({
        ok: false,
        status: 400,
        body: { error: 'No tenés posición en ese ticker' },
      })
    )

    await expect(sell('AAPL', 1)).rejects.toEqual(
      new PortfolioServiceError('No tenés posición en ese ticker', 400)
    )
  })

  it('surfaces backend validation errors', async () => {
    mockApiFetch.mockResolvedValue(
      response({
        ok: false,
        status: 400,
        body: { errors: { quantity: 'La cantidad debe ser mayor a cero' } },
      })
    )

    await expect(buy('AAPL', 0)).rejects.toEqual(
      new PortfolioServiceError('La cantidad debe ser mayor a cero', 400)
    )
  })
})
