package edu.faculty.aseca.pay_and_pray_api.dev

import edu.faculty.aseca.pay_and_pray_api.IntegrationTestBase
import edu.faculty.aseca.pay_and_pray_api.trackedticker.JpaTrackedTickerRepository
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import kotlin.test.assertTrue

class TrackedTickerDevSeederIntegrationTest : IntegrationTestBase() {
    @Autowired
    private lateinit var trackedTickerJpa: JpaTrackedTickerRepository

    @Test
    fun `tracked tickers are seeded on startup`() {
        val trackedTickers = trackedTickerJpa.findAll()

        assertTrue(trackedTickers.isNotEmpty())
        assertTrue(trackedTickers.all { it.source == "DEV_SEED" })
        assertTrue(trackedTickers.any { it.ticker == "AAPL" })
        assertTrue(trackedTickers.any { it.ticker == "GME" })
    }
}
