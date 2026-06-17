/**
 * @jest-environment jsdom
 */
import { act } from 'react'
import type { ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import WatchlistPage from './WatchlistPage'
import { apiFetch } from '@/src/services/apiClient'
import { searchCompanies } from '@/src/services/companyService'

jest.mock('@/src/services/apiClient', () => ({
  apiFetch: jest.fn(),
}))

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
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
const mockSearchCompanies = searchCompanies as jest.MockedFunction<
  typeof searchCompanies
>

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

function getInput(container: HTMLElement) {
  return container.querySelector('input') as HTMLInputElement
}

function getSubmitButton(container: HTMLElement) {
  return container.querySelector('button[type="submit"]') as HTMLButtonElement
}

const setInputValue = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype,
  'value'
)!.set!

async function typeTicker(container: HTMLElement, value: string) {
  const input = getInput(container)
  await act(async () => {
    setInputValue.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

async function submitForm(container: HTMLElement) {
  const form = container.querySelector('form') as HTMLFormElement
  await act(async () => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  })
}

async function clickRemove(container: HTMLElement, ticker: string) {
  const row = container.querySelector(
    `tr[data-ticker="${ticker}"]`
  ) as HTMLElement
  const button = Array.from(row.querySelectorAll('button')).find((b) =>
    b.textContent?.includes('Quitar')
  ) as HTMLButtonElement

  await act(async () => {
    button.click()
  })
}

describe('WatchlistPage', () => {
  let root: Root | null = null

  beforeEach(() => {
    mockSearchCompanies.mockImplementation(async (query: string) => [
      { ticker: query.toUpperCase(), name: 'Mock Co', cik: '1' },
    ])
  })

  afterEach(() => {
    if (root) {
      act(() => root?.unmount())
      root = null
    }
    document.body.innerHTML = ''
    mockApiFetch.mockReset()
    mockSearchCompanies.mockReset()
  })

  it('renderiza la lista de empresas con sus columnas', async () => {
    mockApiFetch.mockResolvedValue(
      response({
        items: [
          { ticker: 'AAPL', hasOpenPosition: true },
          { ticker: 'MSFT', hasOpenPosition: false },
        ],
      })
    )

    const rendered = await renderWatchlist()
    root = rendered.root
    const { container } = rendered
    await settle()

    expect(mockApiFetch).toHaveBeenCalledWith('/watchlist')
    expect(container.textContent).toContain('AAPL')
    expect(container.textContent).toContain('MSFT')

    const rows = container.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(2)
  })

  it('muestra el badge "Tengo posición" solo cuando hasOpenPosition es true', async () => {
    mockApiFetch.mockResolvedValue(
      response({
        items: [
          { ticker: 'AAPL', hasOpenPosition: true },
          { ticker: 'MSFT', hasOpenPosition: false },
        ],
      })
    )

    const rendered = await renderWatchlist()
    root = rendered.root
    const { container } = rendered
    await settle()

    const aaplRow = container.querySelector('tr[data-ticker="AAPL"]')
    const msftRow = container.querySelector('tr[data-ticker="MSFT"]')

    expect(aaplRow?.textContent).toContain('Tengo posición')
    expect(msftRow?.textContent).not.toContain('Tengo posición')
  })

  it('muestra empty state cuando items está vacío', async () => {
    mockApiFetch.mockResolvedValue(response({ items: [] }))

    const rendered = await renderWatchlist()
    root = rendered.root
    const { container } = rendered
    await settle()

    expect(container.textContent).toContain(
      'Tu watchlist está vacía. Agregá empresas para seguirlas.'
    )
    expect(container.querySelector('table')).toBeNull()
  })

  it('muestra loading mientras el fetch no resolvió', async () => {
    let resolveFetch!: (value: Response) => void
    mockApiFetch.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve
      })
    )

    const rendered = await renderWatchlist()
    root = rendered.root
    const { container } = rendered

    expect(container.textContent).toContain('Cargando watchlist...')

    resolveFetch(response({ items: [] }))
    await settle()
  })

  it('muestra un error si falla la carga inicial de la watchlist', async () => {
    mockApiFetch.mockResolvedValue(response({ error: 'fail' }, 500))

    const rendered = await renderWatchlist()
    root = rendered.root
    const { container } = rendered
    await settle()

    expect(container.textContent).toContain('No se pudo cargar la watchlist.')
  })

  it('normaliza el ticker ingresado a mayúsculas al enviar', async () => {
    mockApiFetch
      .mockResolvedValueOnce(response({ items: [] }))
      .mockResolvedValueOnce(response({ ticker: 'AAPL' }, 201))
      .mockResolvedValueOnce(
        response({ items: [{ ticker: 'AAPL', hasOpenPosition: false }] })
      )

    const rendered = await renderWatchlist()
    root = rendered.root
    const { container } = rendered
    await settle()

    await typeTicker(container, 'aapl')
    expect(getInput(container).value).toBe('AAPL')

    await submitForm(container)
    await settle()

    expect(mockApiFetch).toHaveBeenCalledWith('/watchlist', {
      method: 'POST',
      body: JSON.stringify({ ticker: 'AAPL' }),
    })
  })

  it('muestra el error del backend si falla el alta', async () => {
    mockApiFetch
      .mockResolvedValueOnce(response({ items: [] }))
      .mockResolvedValueOnce(response({ error: 'El ticker es requerido' }, 400))

    const rendered = await renderWatchlist()
    root = rendered.root
    const { container } = rendered
    await settle()

    await typeTicker(container, 'AAPL')
    await submitForm(container)
    await settle()

    expect(container.textContent).toContain('El ticker es requerido')
  })

  it('agrega una empresa: limpia el input, refresca la lista y la muestra', async () => {
    mockApiFetch
      .mockResolvedValueOnce(response({ items: [] }))
      .mockResolvedValueOnce(response({ ticker: 'AAPL' }, 201))
      .mockResolvedValueOnce(
        response({ items: [{ ticker: 'AAPL', hasOpenPosition: false }] })
      )

    const rendered = await renderWatchlist()
    root = rendered.root
    const { container } = rendered
    await settle()

    await typeTicker(container, 'AAPL')
    await submitForm(container)
    await settle()

    expect(getInput(container).value).toBe('')
    expect(mockApiFetch).toHaveBeenCalledTimes(3)
    expect(mockApiFetch).toHaveBeenNthCalledWith(3, '/watchlist')
    expect(container.textContent).toContain('AAPL')
  })

  it('agregar la misma empresa dos veces no la duplica y muestra un error', async () => {
    mockApiFetch
      .mockResolvedValueOnce(response({ items: [] }))
      .mockResolvedValueOnce(response({ ticker: 'AAPL' }, 201))
      .mockResolvedValueOnce(
        response({ items: [{ ticker: 'AAPL', hasOpenPosition: false }] })
      )

    const rendered = await renderWatchlist()
    root = rendered.root
    const { container } = rendered
    await settle()

    await typeTicker(container, 'AAPL')
    await submitForm(container)
    await settle()

    await typeTicker(container, 'AAPL')
    await submitForm(container)
    await settle()

    const rows = container.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(1)
    expect(container.textContent).toContain(
      'El ticker ya está en tu watchlist.'
    )
    expect(mockApiFetch).toHaveBeenCalledTimes(3)
  })

  it('muestra un error si el ticker no corresponde a una empresa existente', async () => {
    mockApiFetch.mockResolvedValueOnce(response({ items: [] }))
    mockSearchCompanies.mockResolvedValueOnce([])

    const rendered = await renderWatchlist()
    root = rendered.root
    const { container } = rendered
    await settle()

    await typeTicker(container, 'ZZZZ')
    await submitForm(container)
    await settle()

    expect(container.textContent).toContain(
      'No existe una empresa con ese ticker.'
    )
    expect(mockApiFetch).toHaveBeenCalledTimes(1)
  })

  it('quita una empresa existente: dispara DELETE y la remueve de la lista', async () => {
    mockApiFetch
      .mockResolvedValueOnce(
        response({
          items: [
            { ticker: 'AAPL', hasOpenPosition: false },
            { ticker: 'MSFT', hasOpenPosition: false },
          ],
        })
      )
      .mockResolvedValueOnce(response({ ticker: 'AAPL' }, 200))
      .mockResolvedValueOnce(
        response({ items: [{ ticker: 'MSFT', hasOpenPosition: false }] })
      )

    const rendered = await renderWatchlist()
    root = rendered.root
    const { container } = rendered
    await settle()

    await clickRemove(container, 'AAPL')
    await settle()

    expect(mockApiFetch).toHaveBeenNthCalledWith(2, '/watchlist/AAPL', {
      method: 'DELETE',
    })
    expect(mockApiFetch).toHaveBeenNthCalledWith(3, '/watchlist')
    expect(container.textContent).not.toContain('AAPL')
    expect(container.textContent).toContain('MSFT')
  })

  it('quitar una empresa que ya no está en la watchlist muestra el error del backend', async () => {
    mockApiFetch
      .mockResolvedValueOnce(
        response({ items: [{ ticker: 'AAPL', hasOpenPosition: false }] })
      )
      .mockResolvedValueOnce(
        response({ error: 'El ticker no está en tu watchlist' }, 404)
      )

    const rendered = await renderWatchlist()
    root = rendered.root
    const { container } = rendered
    await settle()

    await clickRemove(container, 'AAPL')
    await settle()

    expect(container.textContent).toContain('El ticker no está en tu watchlist')
  })

  it('el botón Agregar no dispara el POST si el input está vacío o con espacios', async () => {
    mockApiFetch.mockResolvedValue(response({ items: [] }))

    const rendered = await renderWatchlist()
    root = rendered.root
    const { container } = rendered
    await settle()

    expect(getSubmitButton(container).disabled).toBe(true)

    await typeTicker(container, '   ')
    expect(getSubmitButton(container).disabled).toBe(true)

    await submitForm(container)
    await settle()

    expect(mockApiFetch).toHaveBeenCalledTimes(1)
    expect(mockApiFetch).toHaveBeenCalledWith('/watchlist')
  })
})
