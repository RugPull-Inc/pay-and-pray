import { apiRequest } from './apiClient'

interface LastUpdatedResponse {
  lastUpdated: string | null
  message?: string
}

export async function getLastUpdated(): Promise<LastUpdatedResponse> {
  return apiRequest<LastUpdatedResponse>('/prices/last-updated')
}

export function formatLastUpdated(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export function getPriceStatusText(lastUpdated: string | null): string {
  if (lastUpdated === null) return 'Los precios aún no fueron actualizados'
  return `Precios actualizados al ${formatLastUpdated(lastUpdated)}`
}
