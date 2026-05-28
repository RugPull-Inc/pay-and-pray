package edu.faculty.aseca.pay_and_pray_api.portfolio

import edu.faculty.aseca.pay_and_pray_api.IntegrationTestBase
import edu.faculty.aseca.pay_and_pray_api.price.PriceService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.kotlin.any
import org.springframework.http.MediaType
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.ResultActionsDsl
import org.springframework.test.web.servlet.post
import java.math.BigDecimal

class PortfolioIntegrationTest : IntegrationTestBase() {
    @MockitoBean
    private lateinit var priceService: PriceService

    @BeforeEach
    fun setupPrice() {
        given(priceService.getLatestPrice(any())).willReturn(BigDecimal("100.00"))
        given(priceService.getLatestPrice("UNKNOWN")).willReturn(null)
    }

    private fun buy(token: String, ticker: String, quantity: Int): ResultActionsDsl =
        mockMvc.post("/portfolio/buy") {
            contentType = MediaType.APPLICATION_JSON
            header("Authorization", "Bearer $token")
            content = """{"ticker":"$ticker","quantity":$quantity}"""
        }

    @Suppress("SameParameterValue")
    private fun sell(token: String, ticker: String, quantity: Int): ResultActionsDsl =
        mockMvc.post("/portfolio/sell") {
            contentType = MediaType.APPLICATION_JSON
            header("Authorization", "Bearer $token")
            content = """{"ticker":"$ticker","quantity":$quantity}"""
        }

    @Test
    fun `POST buy without token returns 401`() {
        mockMvc.post("/portfolio/buy") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"ticker":"AAPL","quantity":10}"""
        }.andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `POST sell without token returns 401`() {
        mockMvc.post("/portfolio/sell") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"ticker":"AAPL","quantity":5}"""
        }.andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `POST buy with quantity 0 returns 400`() {
        val token = loginAndGetToken()
        buy(token, "AAPL", 0).andExpect {
            status { isBadRequest() }
            jsonPath("$.errors.quantity") { exists() }
        }
    }

    @Test
    fun `POST sell with quantity 0 returns 400`() {
        val token = loginAndGetToken()
        sell(token, "AAPL", 0).andExpect {
            status { isBadRequest() }
            jsonPath("$.errors.quantity") { exists() }
        }
    }

    @Test
    fun `POST buy with unknown ticker returns 404 with Spanish message`() {
        val token = loginAndGetToken()
        buy(token, "UNKNOWN", 1).andExpect {
            status { isNotFound() }
            jsonPath("$.error") { value("El ticker no existe o no tiene precio registrado") }
        }
    }

    @Test
    fun `POST buy creates position and returns 201`() {
        val token = loginAndGetToken()
        buy(token, "AAPL", 10).andExpect {
            status { isCreated() }
            jsonPath("$.ticker") { value("AAPL") }
            jsonPath("$.quantity") { value(10) }
            jsonPath("$.newQuantity") { value(10) }
            jsonPath("$.priceAtOperation") { value(100.0) }
        }
    }

    @Test
    fun `POST buy twice updates weighted average correctly`() {
        val token = loginAndGetToken()
        buy(token, "AAPL", 10).andExpect { status { isCreated() } }

        given(priceService.getLatestPrice(any())).willReturn(BigDecimal("120.00"))

        buy(token, "AAPL", 10).andExpect {
            status { isCreated() }
            jsonPath("$.newQuantity") { value(20) }
            jsonPath("$.newAvgBuyPrice") { value(110.0) }
        }
    }

    @Test
    fun `POST sell without position returns 400 with Spanish message`() {
        val token = loginAndGetToken()
        sell(token, "AAPL", 1).andExpect {
            status { isBadRequest() }
            jsonPath("$.error") { value("No tenés posición en ese ticker") }
        }
    }

    @Test
    fun `POST sell more than owned returns 400 with Spanish message`() {
        val token = loginAndGetToken()
        buy(token, "AAPL", 5).andExpect { status { isCreated() } }
        sell(token, "AAPL", 10).andExpect {
            status { isBadRequest() }
            jsonPath("$.error") { value("No podés vender más unidades de las que tenés") }
        }
    }

    @Test
    fun `POST sell partial reduces remaining quantity`() {
        val token = loginAndGetToken()
        buy(token, "AAPL", 10).andExpect { status { isCreated() } }
        sell(token, "AAPL", 4).andExpect {
            status { isOk() }
            jsonPath("$.remainingQuantity") { value(6) }
        }
    }

    @Test
    fun `POST sell all units returns remainingQuantity 0 and subsequent sell returns 400`() {
        val token = loginAndGetToken()
        buy(token, "AAPL", 5).andExpect { status { isCreated() } }
        sell(token, "AAPL", 5).andExpect {
            status { isOk() }
            jsonPath("$.remainingQuantity") { value(0) }
        }
        sell(token, "AAPL", 1).andExpect {
            status { isBadRequest() }
            jsonPath("$.error") { value("No tenés posición en ese ticker") }
        }
    }
}
