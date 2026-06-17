/**
 * @jest-environment jsdom
 */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import WatchlistComparePage from '../WatchlistComparePage'
import { ProtectedRoute } from '@/src/auth/RouteGuards'
import { useAuth } from '@/src/auth/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { fetchCompareData } from '@/src/services/compareService'
import type { CompareEntry } from '@/src/services/compareService'

jest.mock('react-router-dom', () => ({
  useSearchParams: jest.fn(),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/watchlist/compare', state: null }),
  Navigate: ({ to }: { to: string }) => (
    <div data-testid="redirect" data-to={to} />
  ),
}))

jest.mock('@/src/auth/AuthContext', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/src/services/compareService', () => ({
  fetchCompareData: jest.fn(),
}))
;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockFetchCompareData = fetchCompareData as jest.MockedFunction<
  typeof fetchCompareData
>

const AAPL: CompareEntry = {
  ticker: 'AAPL',
  companyName: 'Apple Inc.',
  price: 62,
  marketCap: 165,
  revenue: 319,
  netIncome: 42,
  eps: 1.61,
  totalAssets: 166,
  totalLiabilities: 97,
  lastFiling: '2024-02-01',
  lastUpdated: '2024-05-01',
}

const MSFT: CompareEntry = {
  ticker: 'MSFT',
  companyName: 'Microsoft Corp.',
  price: 393,
  marketCap: 292,
  revenue: 241,
  netIncome: 979,
  eps: 13,
  totalAssets: 694,
  totalLiabilities: 279,
  lastFiling: '2024-01-25',
  lastUpdated: '2024-04-25',
}

async function renderComparePage(
  isAuthenticated: boolean,
  data: CompareEntry[] = [AAPL, MSFT]
) {
  mockUseAuth.mockReturnValue({
    isAuthenticated,
    signIn: jest.fn(),
    signOut: jest.fn(),
  })
  ;(useSearchParams as jest.Mock).mockReturnValue([
    new URLSearchParams('tickers=AAPL,MSFT'),
    jest.fn(),
  ])
  mockFetchCompareData.mockResolvedValue(data)

  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  await act(async () => {
    root.render(
      <ProtectedRoute>
        <WatchlistComparePage />
      </ProtectedRoute>
    )
  })

  return { container, root }
}

async function settle() {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

function getMetricRow(
  container: HTMLElement,
  label: string
): HTMLTableRowElement | null {
  const rows = container.querySelectorAll('tbody tr')
  for (const row of rows) {
    if ((row as HTMLTableRowElement).cells[0]?.textContent?.includes(label)) {
      return row as HTMLTableRowElement
    }
  }
  return null
}

describe('WatchlistComparePage', () => {
  let root: Root | null = null

  afterEach(() => {
    if (root) {
      act(() => root?.unmount())
      root = null
    }
    document.body.innerHTML = ''
    jest.resetAllMocks()
  })

  it('usuario no autenticado: se renderiza el redirect y no el contenido de la comparación', async () => {
    const rendered = await renderComparePage(false)
    root = rendered.root

    expect(
      rendered.container.querySelector('[data-testid="redirect"]')
    ).not.toBeNull()
    expect(rendered.container.querySelector('table')).toBeNull()
  })

  it('usuario autenticado: se renderiza la tabla comparativa', async () => {
    const rendered = await renderComparePage(true)
    root = rendered.root
    await settle()

    expect(
      rendered.container.querySelector('[data-testid="redirect"]')
    ).toBeNull()
    expect(rendered.container.querySelector('table')).not.toBeNull()
  })

  it('la tabla tiene una columna por empresa con encabezado identificando a cada una', async () => {
    const rendered = await renderComparePage(true)
    root = rendered.root
    await settle()

    const headers = Array.from(
      rendered.container.querySelectorAll('thead th')
    ).map((h) => h.textContent)
    expect(headers.some((h) => h?.includes('AAPL'))).toBe(true)
    expect(headers.some((h) => h?.includes('MSFT'))).toBe(true)
  })

  it('la tabla tiene exactamente 9 filas de métricas', async () => {
    const rendered = await renderComparePage(true)
    root = rendered.root
    await settle()

    const metricRows = rendered.container.querySelectorAll('tbody tr')
    expect(metricRows).toHaveLength(9)
  })

  it('happy path: con todos los valores presentes, cada celda muestra el valor correcto', async () => {
    const rendered = await renderComparePage(true)
    root = rendered.root
    await settle()

    const priceRow = getMetricRow(rendered.container, 'Precio actual')
    expect(priceRow!.cells[1].textContent).toContain('62')
    expect(priceRow!.cells[2].textContent).toContain('393')

    const mcRow = getMetricRow(rendered.container, 'Market Cap')
    expect(mcRow!.cells[1].textContent).toContain('165')
    expect(mcRow!.cells[2].textContent).toContain('292')

    const revenueRow = getMetricRow(rendered.container, 'Revenue (Q)')
    expect(revenueRow!.cells[1].textContent).toContain('319')
    expect(revenueRow!.cells[2].textContent).toContain('241')

    const niRow = getMetricRow(rendered.container, 'Net Income (Q)')
    expect(niRow!.cells[1].textContent).toContain('42')
    expect(niRow!.cells[2].textContent).toContain('979')

    const epsRow = getMetricRow(rendered.container, 'EPS (Q)')
    expect(epsRow!.cells[1].textContent).toContain('1.61')
    expect(epsRow!.cells[2].textContent).toContain('13')

    const taRow = getMetricRow(rendered.container, 'Total Assets')
    expect(taRow!.cells[1].textContent).toContain('166')
    expect(taRow!.cells[2].textContent).toContain('694')

    const tlRow = getMetricRow(rendered.container, 'Total Liabilities')
    expect(tlRow!.cells[1].textContent).toContain('97')
    expect(tlRow!.cells[2].textContent).toContain('279')

    const filingRow = getMetricRow(rendered.container, 'Último filing')
    expect(filingRow!.cells[1].textContent).toContain('2024-02-01')
    expect(filingRow!.cells[2].textContent).toContain('2024-01-25')

    const updatedRow = getMetricRow(rendered.container, 'Última actualización')
    expect(updatedRow!.cells[1].textContent).toContain('2024-05-01')
    expect(updatedRow!.cells[2].textContent).toContain('2024-04-25')
  })

  it('si una métrica de la empresa A es null, esa celda muestra "N/A"', async () => {
    const rendered = await renderComparePage(true, [
      { ...AAPL, price: null },
      MSFT,
    ])
    root = rendered.root
    await settle()

    const priceRow = getMetricRow(rendered.container, 'Precio actual')
    expect(priceRow!.cells[1].textContent).toContain('N/A')
    expect(priceRow!.cells[2].textContent).toContain('393')
  })

  it('si una métrica de la empresa B es null, esa celda muestra "N/A"', async () => {
    const rendered = await renderComparePage(true, [
      AAPL,
      { ...MSFT, netIncome: null },
    ])
    root = rendered.root
    await settle()

    const niRow = getMetricRow(rendered.container, 'Net Income (Q)')
    expect(niRow!.cells[1].textContent).toContain('42')
    expect(niRow!.cells[2].textContent).toContain('N/A')
  })

  it('si la métrica es null en ambas empresas, ambas celdas muestran "N/A"', async () => {
    const rendered = await renderComparePage(true, [
      { ...AAPL, eps: null },
      { ...MSFT, eps: null },
    ])
    root = rendered.root
    await settle()

    const epsRow = getMetricRow(rendered.container, 'EPS (Q)')
    expect(epsRow!.cells[1].textContent).toContain('N/A')
    expect(epsRow!.cells[2].textContent).toContain('N/A')
  })
})
