/**
 * @jest-environment jsdom
 */
import { act } from 'react'
import type { ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import WatchlistPage from './WatchlistPage'
import { apiFetch } from '@/src/services/apiClient'
import { searchCompanies } from '@/src/services/companyService'

const mockNavigate = jest.fn()

jest.mock('@/src/services/apiClient', () => ({
  apiFetch: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => mockNavigate,
}))

jest.mock('@/src/services/companyService', () => ({
  searchCompanies: jest.fn(),
}))

jest.mock('@/src/components/TickerInput', () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
  }: {
    value: string
    onChange: (value: string) => void
  }) => (
    <input
      id="ticker"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
    />
  ),
}))

;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

async function renderWatchlist() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  await act(async () => {
    root.render(<WatchlistPage />)
  })

  return { container, root }
}

async function settle() {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

function getCompareButton(container: HTMLElement): HTMLButtonElement | undefined {
  return Array.from(container.querySelectorAll('button')).find(
    (b) => b.textContent?.trim() === 'Comparar'
  ) as HTMLButtonElement | undefined
}

function getRowCheckbox(container: HTMLElement, ticker: string): HTMLInputElement {
  const row = container.querySelector(`tr[data-ticker="${ticker}"]`) as HTMLElement
  return row.querySelector('input[type="checkbox"]') as HTMLInputElement
}

const TWO_ITEMS = {
  items: [
    { ticker: 'AAPL', hasOpenPosition: false },
    { ticker: 'MSFT', hasOpenPosition: false },
  ],
}

describe('WatchlistPage — botón Comparar', () => {
  let root: Root | null = null

  beforeEach(() => {
    mockNavigate.mockReset()
    ;(searchCompanies as jest.MockedFunction<typeof searchCompanies>).mockImplementation(
      async (query) => [{ ticker: query.toUpperCase(), name: 'Mock Co', cik: '1' }]
    )
  })

  afterEach(() => {
    if (root) {
      act(() => root?.unmount())
      root = null
    }
    document.body.innerHTML = ''
    mockApiFetch.mockReset()
  })

  it('"Comparar" está deshabilitado cuando no hay ninguna fila seleccionada', async () => {
    mockApiFetch.mockResolvedValue(response(TWO_ITEMS))
    const rendered = await renderWatchlist()
    root = rendered.root
    await settle()

    const btn = getCompareButton(rendered.container)
    expect(btn).toBeDefined()
    expect(btn!.disabled).toBe(true)
  })

  it('"Comparar" sigue deshabilitado con exactamente 1 fila seleccionada', async () => {
    mockApiFetch.mockResolvedValue(response(TWO_ITEMS))
    const rendered = await renderWatchlist()
    root = rendered.root
    await settle()

    await act(async () => {
      getRowCheckbox(rendered.container, 'AAPL').click()
    })

    expect(getCompareButton(rendered.container)!.disabled).toBe(true)
  })

  it('"Comparar" se habilita cuando hay exactamente 2 filas seleccionadas', async () => {
    mockApiFetch.mockResolvedValue(response(TWO_ITEMS))
    const rendered = await renderWatchlist()
    root = rendered.root
    await settle()

    await act(async () => {
      getRowCheckbox(rendered.container, 'AAPL').click()
    })
    await act(async () => {
      getRowCheckbox(rendered.container, 'MSFT').click()
    })

    expect(getCompareButton(rendered.container)!.disabled).toBe(false)
  })

  it('"Comparar" vuelve a deshabilitarse si se deselecciona una de las 2 filas', async () => {
    mockApiFetch.mockResolvedValue(response(TWO_ITEMS))
    const rendered = await renderWatchlist()
    root = rendered.root
    await settle()

    await act(async () => {
      getRowCheckbox(rendered.container, 'AAPL').click()
    })
    await act(async () => {
      getRowCheckbox(rendered.container, 'MSFT').click()
    })
    await act(async () => {
      getRowCheckbox(rendered.container, 'MSFT').click()
    })

    expect(getCompareButton(rendered.container)!.disabled).toBe(true)
  })

  it('al hacer click en "Comparar" con 2 seleccionadas navega a /watchlist/compare con los tickers', async () => {
    mockApiFetch.mockResolvedValue(response(TWO_ITEMS))
    const rendered = await renderWatchlist()
    root = rendered.root
    await settle()

    await act(async () => {
      getRowCheckbox(rendered.container, 'AAPL').click()
    })
    await act(async () => {
      getRowCheckbox(rendered.container, 'MSFT').click()
    })
    await act(async () => {
      getCompareButton(rendered.container)!.click()
    })

    expect(mockNavigate).toHaveBeenCalledTimes(1)
    const target = mockNavigate.mock.calls[0][0] as string
    expect(target).toContain('/watchlist/compare')
    expect(target).toContain('AAPL')
    expect(target).toContain('MSFT')
  })
})
