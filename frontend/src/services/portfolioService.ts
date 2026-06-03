import { apiFetch } from './apiClient'

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

type BackendErrorResponse = {
  error?: string
  errors?: Record<string, string>
}

async function readErrorMessage(
  response: Response,
  fallbackMessage: string
): Promise<string> {
  try {
    const data = (await response.json()) as BackendErrorResponse
    if (data.error) return data.error

    const firstValidationError = data.errors
      ? Object.values(data.errors)[0]
      : null
    if (firstValidationError) return firstValidationError
  } catch {
    // Ignore malformed error payloads and use the fallback.
  }

  return fallbackMessage
}

async function postTrade<T>(
  path: '/portfolio/buy' | '/portfolio/sell',
  ticker: string,
  quantity: number,
  fallbackMessage: string
): Promise<T> {
  const response = await apiFetch(path, {
    method: 'POST',
    body: JSON.stringify({
      ticker: ticker.trim().toUpperCase(),
      quantity,
    }),
  })

  if (!response.ok) {
    throw new PortfolioServiceError(
      await readErrorMessage(response, fallbackMessage),
      response.status
    )
  }

  return response.json() as Promise<T>
}

export function buy(ticker: string, quantity: number): Promise<BuyResponse> {
  return postTrade(
    '/portfolio/buy',
    ticker,
    quantity,
    'Could not register buy.'
  )
}

export function sell(ticker: string, quantity: number): Promise<SellResponse> {
  return postTrade(
    '/portfolio/sell',
    ticker,
    quantity,
    'Could not register sell.'
  )
}
