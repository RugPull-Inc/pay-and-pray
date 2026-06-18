/**
 * @jest-environment jsdom
 */
import { act } from 'react'
import type { ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import PortfolioPage from '../PortfolioPage'
import { apiFetch } from '@/src/services/apiClient'

jest.mock('@/src/services/apiClient', () => ({
  apiFetch: jest.fn(),
}))

jest.mock('@/src/components/PriceStatusBar', () => ({
  __esModule: true,
  default: () => <div>Precios actualizados al 05/06/2026 10:47</div>,
}))

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))
;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>

function response(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as Response
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })

  return { promise, resolve }
}

async function renderPortfolio() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  await act(async () => {
    root.render(<PortfolioPage />)
  })

  return { container, root }
}

async function settle() {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

describe('PortfolioPage', () => {
  let root: Root | null = null

  afterEach(() => {
    if (root) {
      act(() => root?.unmount())
      root = null
    }
    document.body.innerHTML = ''
    mockApiFetch.mockReset()
  })

  it('renderiza la tabla con posiciones, P&L coloreado y totalValue', async () => {
    mockApiFetch.mockResolvedValue(
      response({
        positions: [
          {
            ticker: 'AAPL',
            quantity: 10,
            avgBuyPrice: 150,
            currentPrice: 175,
            currentValue: 1750,
            pnl: 250,
            pnlPercentage: 16.67,
          },
          {
            ticker: 'TSLA',
            quantity: 2,
            avgBuyPrice: 250,
            currentPrice: 225,
            currentValue: 450,
            pnl: -50,
            pnlPercentage: -10,
          },
        ],
        totalValue: 2200,
      })
    )

    const rendered = await renderPortfolio()
    root = rendered.root
    const { container } = rendered
    await settle()

    expect(mockApiFetch).toHaveBeenCalledWith('/portfolio')
    expect(container.textContent).toContain('AAPL')
    expect(container.textContent).toContain('TSLA')
    expect(container.textContent).toContain('$1,750.00')
    expect(container.textContent).toContain('+$250.00')
    expect(container.textContent).toContain('-$50.00')
    expect(container.textContent).toContain('Valor total del portfolio')
    expect(container.textContent).toContain('$2,200.00')
    expect(container.textContent).toContain(
      'Precios actualizados al 05/06/2026 10:47'
    )

    const rows = Array.from(container.querySelectorAll('tbody tr'))
    const aaplPnl = rows[0].querySelector('.portfolio-pnl-value')
    const tslaPnl = rows[1].querySelector('.portfolio-pnl-value')

    expect(aaplPnl?.className).toContain('text-emerald-400')
    expect(tslaPnl?.className).toContain('text-red-400')
  })

  it('muestra empty state cuando positions está vacío', async () => {
    mockApiFetch.mockResolvedValue(
      response({
        positions: [],
        totalValue: 0,
      })
    )

    const rendered = await renderPortfolio()
    root = rendered.root
    const { container } = rendered
    await settle()

    expect(container.textContent).toContain(
      'Tu portfolio está vacío. Empezá comprando acciones.'
    )
    expect(container.querySelector('a')?.getAttribute('href')).toBe(
      '/portfolio/buy'
    )
    expect(container.querySelector('table')).toBeNull()
  })

  it('muestra loading mientras el fetch no resolvió', async () => {
    const pending = deferred<Response>()
    mockApiFetch.mockReturnValue(pending.promise)

    const rendered = await renderPortfolio()
    root = rendered.root
    const { container } = rendered

    expect(container.textContent).toContain('Cargando portfolio...')

    pending.resolve(response({ positions: [], totalValue: 0 }))
    await settle()
  })

  it('muestra guion largo y tooltip cuando currentPrice es null', async () => {
    mockApiFetch.mockResolvedValue(
      response({
        positions: [
          {
            ticker: 'UNKNOWN',
            quantity: 4,
            avgBuyPrice: 12,
            currentPrice: null,
            currentValue: null,
            pnl: null,
            pnlPercentage: null,
          },
        ],
        totalValue: 0,
      })
    )

    const rendered = await renderPortfolio()
    root = rendered.root
    const { container } = rendered
    await settle()

    const unavailable = container.querySelectorAll(
      '[title="Precio no disponible"]'
    )
    expect(unavailable).toHaveLength(4)
    unavailable.forEach((cell) => expect(cell.textContent).toBe('—'))
  })
})
