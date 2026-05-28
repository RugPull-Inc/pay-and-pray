export interface BuyResponse {
  ticker: string
  quantity: number
  priceAtOperation: number
  newQuantity: number
  newAvgBuyPrice: number
}

export interface SellResponse {
  ticker: string
  quantity: number
  priceAtOperation: number
  remainingQuantity: number
}

export class PortfolioServiceError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'PortfolioServiceError'
  }
}

const MOCK_PRICES: Record<string, number> = {
  AAPL: 189.5,
  MSFT: 415.2,
  GOOGL: 175.8,
  AMZN: 198.3,
  TSLA: 248.7,
}

const mockPositions: Record<string, number> = {}

export async function buy(ticker: string, quantity: number): Promise<BuyResponse> {
  await new Promise((r) => setTimeout(r, 400))
  const price = MOCK_PRICES[ticker.toUpperCase()]
  if (!price) throw new PortfolioServiceError('El ticker no existe o no tiene precio registrado', 404)
  const prev = mockPositions[ticker] ?? 0
  mockPositions[ticker] = prev + quantity
  return { ticker, quantity, priceAtOperation: price, newQuantity: prev + quantity, newAvgBuyPrice: price }
}

export async function sell(ticker: string, quantity: number): Promise<SellResponse> {
  await new Promise((r) => setTimeout(r, 400))
  const price = MOCK_PRICES[ticker.toUpperCase()]
  if (!price) throw new PortfolioServiceError('El ticker no existe o no tiene precio registrado', 404)
  const current = mockPositions[ticker] ?? 0
  if (current === 0) throw new PortfolioServiceError('No tenés posición en ese ticker', 400)
  if (quantity > current) throw new PortfolioServiceError('No podés vender más unidades de las que tenés', 400)
  mockPositions[ticker] = current - quantity
  return { ticker, quantity, priceAtOperation: price, remainingQuantity: current - quantity }
}
