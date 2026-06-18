package edu.faculty.aseca.pay_and_pray_api.company

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.springframework.core.io.DefaultResourceLoader
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ClasspathCompanyTickerFallbackTest {
    private val fallback =
        ClasspathCompanyTickerFallback(
            DefaultResourceLoader(),
            ObjectMapper(),
            "classpath:dev/company-tickers-fallback.json",
        )

    @Test
    fun `loads bundled tickers including AAPL with correct cik and name`() {
        val tickers = fallback.load()

        val apple = tickers.values.first { it.ticker == "AAPL" }
        assertEquals(320193, apple.cikStr)
        assertEquals("Apple Inc.", apple.name)
    }

    @Test
    fun `bundled fallback covers the major tracked tickers`() {
        val symbols =
            fallback
                .load()
                .values
                .map { it.ticker }
                .toSet()

        assertTrue(symbols.size >= 50)
        assertTrue(symbols.containsAll(listOf("AAPL", "MSFT", "TSLA", "NVDA", "AMZN")))
    }
}
