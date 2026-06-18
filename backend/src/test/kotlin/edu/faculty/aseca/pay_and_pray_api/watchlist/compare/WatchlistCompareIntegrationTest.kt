package edu.faculty.aseca.pay_and_pray_api.watchlist.compare

import edu.faculty.aseca.pay_and_pray_api.IntegrationTestBase
import edu.faculty.aseca.pay_and_pray_api.price.PriceService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.kotlin.any
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import java.math.BigDecimal

class WatchlistCompareIntegrationTest : IntegrationTestBase() {
    @MockitoBean
    private lateinit var priceService: PriceService

    @BeforeEach
    fun setupPrice() {
        given(priceService.getLatestPrice(any())).willReturn(BigDecimal("100.00"))
    }

    private fun addToWatchlist(
        token: String,
        ticker: String,
    ) = mockMvc.post("/watchlist") {
        contentType = MediaType.APPLICATION_JSON
        header("Authorization", "Bearer $token")
        content = """{"ticker":"$ticker"}"""
    }

    private fun compare(
        token: String?,
        ticker1: String?,
        ticker2: String?,
    ) = mockMvc.get("/watchlist/compare") {
        token?.let { header("Authorization", "Bearer $it") }
        ticker1?.let { param("ticker1", it) }
        ticker2?.let { param("ticker2", it) }
    }

    @Test
    fun `GET watchlist compare without token returns 401`() {
        compare(null, "AAPL", "GOOGL").andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `GET watchlist compare without ticker1 returns 400`() {
        val token = loginAndGetToken()

        compare(token, null, "GOOGL").andExpect { status { isBadRequest() } }
    }

    @Test
    fun `GET watchlist compare without ticker2 returns 400`() {
        val token = loginAndGetToken()

        compare(token, "AAPL", null).andExpect { status { isBadRequest() } }
    }

    @Test
    fun `GET watchlist compare with ticker1 not in the watchlist returns 404`() {
        val token = loginAndGetToken()
        addToWatchlist(token, "GOOGL").andExpect { status { isCreated() } }

        compare(token, "AAPL", "GOOGL").andExpect { status { isNotFound() } }
    }

    @Test
    fun `GET watchlist compare with ticker2 not in the watchlist returns 404`() {
        val token = loginAndGetToken()
        addToWatchlist(token, "AAPL").andExpect { status { isCreated() } }

        compare(token, "AAPL", "GOOGL").andExpect { status { isNotFound() } }
    }
}
