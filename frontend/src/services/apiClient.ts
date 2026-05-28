import { getAuthToken } from '@/src/auth/tokenCookie'

export const API_BASE_URL = process.env.VITE_API_URL

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type ApiRequestOptions = RequestInit & {
  skipAuth?: boolean
}

function buildHeaders(init?: RequestInit, skipAuth = false) {
  const token = skipAuth ? null : getAuthToken()

  return {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function apiFetch(
  path: string,
  { skipAuth = false, ...init }: ApiRequestOptions = {}
): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: buildHeaders(init, skipAuth),
  })
}

export async function apiRequest<T>(
  path: string,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await apiFetch(path, options)

  if (!response.ok) {
    throw new ApiError('Request failed', response.status)
  }

  return response.json() as Promise<T>
}
