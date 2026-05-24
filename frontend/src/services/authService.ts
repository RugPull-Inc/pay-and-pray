import { ApiError, apiRequest } from './apiClient'

type AuthResponse = {
  token: string
}

type Credentials = {
  email: string
  password: string
}

export class AuthServiceError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'AuthServiceError'
  }
}

function toAuthError(error: unknown, fallbackMessage: string): never {
  if (error instanceof ApiError) {
    throw new AuthServiceError(fallbackMessage, error.status)
  }

  throw error
}

export async function login(credentials: Credentials): Promise<AuthResponse> {
  try {
    return await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuth: true,
    })
  } catch (error) {
    toAuthError(error, 'Unable to sign in')
  }
}

export async function register(
  credentials: Credentials
): Promise<AuthResponse> {
  try {
    return await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuth: true,
    })
  } catch (error) {
    toAuthError(error, 'Unable to register')
  }
}
