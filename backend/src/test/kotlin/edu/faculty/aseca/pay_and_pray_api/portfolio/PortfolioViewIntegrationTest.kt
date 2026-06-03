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

class PortfolioViewIntegrationTest : IntegrationTestBase() {
    @MockitoBean
    private lateinit var priceService: PriceService

    @BeforeEach
    fun setupPrice() {
        given(priceService.getLatestPrice(any())).willReturn(BigDecimal("100.00"))
        given(priceService.getLatestPrice("UNKNOWN")).willReturn(null)
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
    fun `GET portfolio without token returns 401`() {
        mockMvc.get("/portfolio").andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `GET portfolio with no positions returns empty list and zero totalValue`() {
        val token = loginAndGetToken()

        mockMvc
            .get("/portfolio") {
                header("Authorization", "Bearer $token")
            }.andExpect {
                status { isOk() }
                jsonPath("$.positions") { isArray() }
                jsonPath("$.positions.length()") { value(0) }
                jsonPath("$.totalValue") { value(0) }
            }
    }

    @Test
    fun `GET portfolio with one position returns correct pnl and totalValue`() {
        val token = loginAndGetToken()
        buy(token, "AAPL", 10).andExpect { status { isCreated() } }

        mockMvc
            .get("/portfolio") {
                header("Authorization", "Bearer $token")
            }.andExpect {
                status { isOk() }
                jsonPath("$.positions[0].ticker") { value("AAPL") }
                jsonPath("$.positions[0].quantity") { value(10) }
                jsonPath("$.positions[0].currentPrice") { value(100.0) }
                jsonPath("$.positions[0].currentValue") { value(1000.0) }
                jsonPath("$.positions[0].pnl") { value(0.0) }
                jsonPath("$.totalValue") { value(1000.0) }
            }
    }

    @Test
    fun `GET portfolio with position of unknown ticker returns null calculated fields`() {
        val token = loginAndGetToken()
        buy(token, "AAPL", 5).andExpect { status { isCreated() } }
        given(priceService.getLatestPrice("AAPL")).willReturn(null)

        mockMvc
            .get("/portfolio") {
                header("Authorization", "Bearer $token")
            }.andExpect {
                status { isOk() }
                jsonPath("$.positions[0].currentPrice") { doesNotExist() }
                jsonPath("$.positions[0].currentValue") { doesNotExist() }
                jsonPath("$.positions[0].pnl") { doesNotExist() }
                jsonPath("$.totalValue") { value(0) }
            }
    }
}
