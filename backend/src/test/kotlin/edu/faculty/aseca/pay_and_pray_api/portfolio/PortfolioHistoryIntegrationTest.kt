package edu.faculty.aseca.pay_and_pray_api.portfolio

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

class PortfolioHistoryIntegrationTest : IntegrationTestBase() {
    @MockitoBean
    private lateinit var priceService: PriceService

    @BeforeEach
    fun setupPrice() {
        given(priceService.getLatestPrice(any())).willReturn(BigDecimal("100.00"))
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

    private fun sell(
        token: String,
        ticker: String,
        quantity: Int,
    ) = mockMvc.post("/portfolio/sell") {
        contentType = MediaType.APPLICATION_JSON
        header("Authorization", "Bearer $token")
        content = """{"ticker":"$ticker","quantity":$quantity}"""
    }

    private fun history(token: String) =
        mockMvc.get("/portfolio/history") {
            header("Authorization", "Bearer $token")
        }

    @Test
    fun `GET history without token returns 401`() {
        mockMvc.get("/portfolio/history").andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `GET history with no transactions returns empty array`() {
        val token = loginAndGetToken()
        history(token).andExpect {
            status { isOk() }
            jsonPath("$") { isArray() }
            jsonPath("$.length()") { value(0) }
        }
    }

    @Test
    fun `GET history returns buys and sells in descending chronological order`() {
        val token = loginAndGetToken()
        buy(token, "AAPL", 10).andExpect { status { isCreated() } }
        sell(token, "AAPL", 4).andExpect { status { isOk() } }

        history(token).andExpect {
            status { isOk() }
            jsonPath("$") { isArray() }
            jsonPath("$.length()") { value(2) }
            jsonPath("$[0].type") { value("SELL") }
            jsonPath("$[0].ticker") { value("AAPL") }
            jsonPath("$[0].quantity") { value(4) }
            jsonPath("$[0].priceAtOperation") { value(100.0) }
            jsonPath("$[0].id") { exists() }
            jsonPath("$[0].createdAt") { exists() }
            jsonPath("$[1].type") { value("BUY") }
            jsonPath("$[1].quantity") { value(10) }
        }
    }

    @Test
    fun `GET history does not return transactions of other users`() {
        val ownerToken = loginAndGetToken()
        buy(ownerToken, "AAPL", 10).andExpect { status { isCreated() } }

        val otherToken = loginAndGetToken()
        history(otherToken).andExpect {
            status { isOk() }
            jsonPath("$") { isArray() }
            jsonPath("$.length()") { value(0) }
        }
    }
}
