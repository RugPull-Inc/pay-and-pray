package edu.faculty.aseca.pay_and_pray_api.watchlist

import edu.faculty.aseca.pay_and_pray_api.IntegrationTestBase
import edu.faculty.aseca.pay_and_pray_api.price.PriceService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.kotlin.any
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.delete
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import java.math.BigDecimal

class WatchlistIntegrationTest : IntegrationTestBase() {
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

    private fun removeFromWatchlist(
        token: String,
        ticker: String,
    ) = mockMvc.delete("/watchlist/$ticker") {
        header("Authorization", "Bearer $token")
    }

    private fun getWatchlist(token: String) =
        mockMvc.get("/watchlist") {
            header("Authorization", "Bearer $token")
        }

    private fun buy(
        token: String,
        ticker: String,
        quantity: Int,
    ) = mockMvc.post("/portfolio/buy") {
        contentType = MediaType.APPLICATION_JSON
        header("Authorization", "Bearer $token")
        content = """{"ticker":"$ticker","quantity":$quantity}"""
    }

    @Test
    fun `POST watchlist without token returns 401`() {
        mockMvc
            .post("/watchlist") {
                contentType = MediaType.APPLICATION_JSON
                content = """{"ticker":"AAPL"}"""
            }.andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `DELETE watchlist without token returns 401`() {
        mockMvc.delete("/watchlist/AAPL").andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `GET watchlist without token returns 401`() {
        mockMvc.get("/watchlist").andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `POST watchlist with a blank ticker returns 400`() {
        val token = loginAndGetToken()

        mockMvc
            .post("/watchlist") {
                contentType = MediaType.APPLICATION_JSON
                header("Authorization", "Bearer $token")
                content = """{"ticker":""}"""
            }.andExpect {
                status { isBadRequest() }
                jsonPath("$.errors.ticker") { exists() }
            }
    }

    @Test
    fun `POST watchlist with a new ticker inserts it and returns 201`() {
        val token = loginAndGetToken()

        addToWatchlist(token, "AAPL").andExpect {
            status { isCreated() }
            jsonPath("$.ticker") { value("AAPL") }
        }

        getWatchlist(token).andExpect {
            jsonPath("$.items.length()") { value(1) }
            jsonPath("$.items[0].ticker") { value("AAPL") }
        }
    }

    @Test
    fun `POST watchlist with an already existing ticker does not duplicate it and returns 200`() {
        val token = loginAndGetToken()
        addToWatchlist(token, "AAPL").andExpect { status { isCreated() } }

        addToWatchlist(token, "AAPL").andExpect {
            status { isOk() }
            jsonPath("$.ticker") { value("AAPL") }
        }

        getWatchlist(token).andExpect {
            jsonPath("$.items.length()") { value(1) }
        }
    }

    @Test
    fun `DELETE watchlist removes an existing ticker and returns 200`() {
        val token = loginAndGetToken()
        addToWatchlist(token, "AAPL").andExpect { status { isCreated() } }

        removeFromWatchlist(token, "AAPL").andExpect {
            status { isOk() }
            jsonPath("$.ticker") { value("AAPL") }
        }

        getWatchlist(token).andExpect {
            jsonPath("$.items.length()") { value(0) }
        }
    }

    @Test
    fun `DELETE watchlist with a ticker that is not in the watchlist returns 404`() {
        val token = loginAndGetToken()

        removeFromWatchlist(token, "AAPL").andExpect {
            status { isNotFound() }
            jsonPath("$.error") { value("El ticker no está en tu watchlist") }
        }
    }

    @Test
    fun `GET watchlist with no items returns an empty list`() {
        val token = loginAndGetToken()

        getWatchlist(token).andExpect {
            status { isOk() }
            jsonPath("$.items") { isArray() }
            jsonPath("$.items.length()") { value(0) }
        }
    }

    @Test
    fun `GET watchlist marks a ticker as hasOpenPosition true when the user has an open position`() {
        val token = loginAndGetToken()
        addToWatchlist(token, "AAPL").andExpect { status { isCreated() } }
        buy(token, "AAPL", 10).andExpect { status { isCreated() } }

        getWatchlist(token).andExpect {
            jsonPath("$.items[0].ticker") { value("AAPL") }
            jsonPath("$.items[0].hasOpenPosition") { value(true) }
        }
    }

    @Test
    fun `GET watchlist marks a ticker as hasOpenPosition false when the user has no open position`() {
        val token = loginAndGetToken()
        addToWatchlist(token, "AAPL").andExpect { status { isCreated() } }

        getWatchlist(token).andExpect {
            jsonPath("$.items[0].ticker") { value("AAPL") }
            jsonPath("$.items[0].hasOpenPosition") { value(false) }
        }
    }

    @Test
    fun `each user only sees their own watchlist`() {
        val tokenA = loginAndGetToken()
        val tokenB = loginAndGetToken()
        addToWatchlist(tokenA, "AAPL").andExpect { status { isCreated() } }

        getWatchlist(tokenB).andExpect {
            jsonPath("$.items.length()") { value(0) }
        }
    }

    @Test
    fun `a user cannot remove a ticker that belongs to another user's watchlist`() {
        val tokenA = loginAndGetToken()
        val tokenB = loginAndGetToken()
        addToWatchlist(tokenA, "AAPL").andExpect { status { isCreated() } }

        removeFromWatchlist(tokenB, "AAPL").andExpect { status { isNotFound() } }

        getWatchlist(tokenA).andExpect {
            jsonPath("$.items.length()") { value(1) }
        }
    }
}
