import { fetchCompanyData } from '../company-data'

const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
  delete process.env.NEXT_PUBLIC_API_URL
})

describe('fetchCompanyData', () => {
  describe('backend available', () => {
    it('returns parsed backend response when ok', async () => {
      const payload = { ticker: 'AAPL', companyName: 'Apple Inc.', cik: '320193' }
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(payload) })

      const result = await fetchCompanyData('AAPL')

      expect(result).toEqual(payload)
    })

    it('uppercases ticker before calling backend', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })

      await fetchCompanyData('aapl')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/AAPL/'),
        expect.any(Object),
      )
    })

    it('uses NEXT_PUBLIC_API_URL when set', async () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://custom:9000'
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })

      await fetchCompanyData('MSFT')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://custom:9000/api/companies/MSFT/financials',
        expect.any(Object),
      )
    })

    it('defaults to localhost:8080 when env var absent', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })

      await fetchCompanyData('TSLA')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/companies/TSLA/financials',
        expect.any(Object),
      )
    })
  })

  describe('backend unavailable — known ticker', () => {
    it('falls back to mock data when fetch throws', async () => {
      mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'))

      const result = await fetchCompanyData('AAPL')

      expect(result).not.toBeNull()
      expect(result?.ticker).toBe('AAPL')
      expect(result?.isMock).toBe(true)
    })

    it('falls back to mock data when backend returns non-ok', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false })

      const result = await fetchCompanyData('NVDA')

      expect(result?.isMock).toBe(true)
      expect(result?.ticker).toBe('NVDA')
    })
  })

  describe('backend unavailable — unknown ticker', () => {
    it('returns null when fetch throws and ticker not in mock', async () => {
      mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'))

      const result = await fetchCompanyData('XYZUNKNOWN')

      expect(result).toBeNull()
    })

    it('returns null when backend returns non-ok and ticker not in mock', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false })

      const result = await fetchCompanyData('XYZUNKNOWN')

      expect(result).toBeNull()
    })
  })
})
