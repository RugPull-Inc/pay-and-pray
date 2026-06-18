package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.edgar.CompanyTicker
import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarApiException
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class CompanyTickerCacheFallbackTest {
    private fun apple() = mapOf("0" to CompanyTicker(cikStr = 320193, name = "Apple Inc.", ticker = "AAPL"))

    private fun microsoft() = mapOf("0" to CompanyTicker(cikStr = 789019, name = "MICROSOFT CORP", ticker = "MSFT"))

    @Test
    fun `uses bundled fallback when EDGAR fails and fallback is enabled`() {
        val edgar = FakeTickerEdgarClient().apply { throwOnGetTickers = true }
        val cache = CompanyTickerCache(edgar, FakeCompanyTickerFallback(apple()), fallbackEnabled = true)

        val result = cache.getTickers()

        assertEquals(1, result.size)
        assertEquals("AAPL", result.single().ticker)
        assertEquals("320193", result.single().cik)
    }

    @Test
    fun `rethrows when EDGAR fails and fallback is disabled`() {
        val edgar = FakeTickerEdgarClient().apply { throwOnGetTickers = true }
        val cache = CompanyTickerCache(edgar, FakeCompanyTickerFallback(apple()), fallbackEnabled = false)

        assertFailsWith<EdgarApiException> { cache.getTickers() }
    }

    @Test
    fun `prefers EDGAR over fallback when EDGAR is available`() {
        val edgar = FakeTickerEdgarClient().apply { tickers = microsoft() }
        val fallback = FakeCompanyTickerFallback(apple())
        val cache = CompanyTickerCache(edgar, fallback, fallbackEnabled = true)

        val result = cache.getTickers()

        assertEquals("MSFT", result.single().ticker)
        assertEquals(0, fallback.loadCallCount)
    }
}
