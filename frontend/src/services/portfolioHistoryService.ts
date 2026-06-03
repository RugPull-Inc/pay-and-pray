import { apiFetch } from './apiClient'

export interface PortfolioOperation {
  id: string
  ticker: string
  type: 'BUY' | 'SELL'
  quantity: number
  priceAtOperation: number
  createdAt: string
}

export class PortfolioHistoryError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'PortfolioHistoryError'
  }
}

export async function getPortfolioHistory(): Promise<PortfolioOperation[]> {
  const response = await apiFetch('/portfolio/history')
  if (!response.ok) {
    throw new PortfolioHistoryError('Could not load history.', response.status)
  }
  return response.json() as Promise<PortfolioOperation[]>
}

export function formatOperationDate(isoString: string): string {
  const d = new Date(isoString)
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const year = d.getUTCFullYear()
  const hours = String(d.getUTCHours()).padStart(2, '0')
  const minutes = String(d.getUTCMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export function formatOperationPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}
