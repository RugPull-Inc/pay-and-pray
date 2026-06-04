import { searchCompanies } from '@/src/services/companyService'
import { apiFetch } from '@/src/services/apiClient'

jest.mock('@/src/services/apiClient', () => ({
  apiFetch: jest.fn(),
}))

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>

function response({
  ok,
  status,
  body,
}: {
  ok: boolean
  status: number
  body: unknown
}): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response
}

describe('companyService searchCompanies', () => {
  beforeEach(() => {
    mockApiFetch.mockReset()
  })

  it('queries the backend search endpoint and returns results', async () => {
    const results = [
      { name: 'GameStop Corp.', ticker: 'GME', cik: '1326380' },
      { name: 'General Motors Co.', ticker: 'GM', cik: '1467858' },
    ]

    mockApiFetch.mockResolvedValue(
      response({
        ok: true,
        status: 200,
        body: { results, total: 2 },
      })
    )

    const data = await searchCompanies('GM')

    expect(mockApiFetch).toHaveBeenCalledWith('/companies/search?q=GM')
    expect(data).toEqual(results)
  })

  it('returns an empty list when the backend responds with an error', async () => {
    mockApiFetch.mockResolvedValue(
      response({
        ok: false,
        status: 500,
        body: {},
      })
    )

    const data = await searchCompanies('GME')

    expect(data).toEqual([])
  })
})
