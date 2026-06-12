const TOKEN_COOKIE_NAME = 'pay_and_pray_token'
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function isBrowser() {
  return typeof document !== 'undefined'
}

export function getAuthToken(): string | null {
  if (!isBrowser()) return null

  const cookies = document.cookie ? document.cookie.split('; ') : []
  const tokenCookie = cookies.find((cookie) =>
    cookie.startsWith(`${TOKEN_COOKIE_NAME}=`)
  )

  if (!tokenCookie) return null

  return decodeURIComponent(tokenCookie.split('=').slice(1).join('='))
}

export function setAuthToken(token: string) {
  if (!isBrowser()) return

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(
    token
  )}; Path=/; Max-Age=${TOKEN_MAX_AGE_SECONDS}; SameSite=Lax${secure}`
}

export function clearAuthToken() {
  if (!isBrowser()) return

  document.cookie = `${TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`
}
