import { formatLastUpdated, getPriceStatusText } from './priceService'

describe('formatLastUpdated', () => {
  it('formats an ISO string to DD/MM/YYYY HH:mm', () => {
    // Use a fixed UTC offset to make the assertion timezone-independent
    const date = new Date('2026-05-23T00:00:00Z')
    const result = formatLastUpdated(date.toISOString())

    // The formatted date should match the local interpretation of the ISO string
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/)
  })

  it('includes the correct date parts', () => {
    // Build a date at local midnight so day/month/year are unambiguous
    const d = new Date(2026, 4, 23, 14, 30) // month is 0-indexed
    const result = formatLastUpdated(d.toISOString())

    expect(result).toContain('23/05/2026')
    expect(result).toContain('14:30')
  })
})

describe('getPriceStatusText', () => {
  it('returns the "nunca actualizado" message when lastUpdated is null', () => {
    expect(getPriceStatusText(null)).toBe(
      'Los precios aún no fueron actualizados'
    )
  })

  it('returns a formatted message when lastUpdated is a valid ISO string', () => {
    const d = new Date(2026, 4, 23, 14, 30)
    const text = getPriceStatusText(d.toISOString())

    expect(text).toContain('Precios actualizados al')
    expect(text).toContain('23/05/2026')
    expect(text).toContain('14:30')
  })
})
