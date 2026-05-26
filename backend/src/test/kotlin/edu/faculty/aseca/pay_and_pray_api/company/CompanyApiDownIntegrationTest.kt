package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.IntegrationTestBase
import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarApiException
import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarClient
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.kotlin.any
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.get

class CompanyApiDownIntegrationTest : IntegrationTestBase() {
    @MockitoBean
    private lateinit var edgarClient: EdgarClient

    @BeforeEach
    fun setupEdgarDown() {
        given(edgarClient.getCompanyTickers())
            .willThrow(EdgarApiException("EDGAR is down"))
        given(edgarClient.getCompanySubmissions(any()))
            .willThrow(EdgarApiException("EDGAR is down"))
    }

    @Test
    fun `search when EDGAR is down returns 503`() {
        val token = loginAndGetToken()

        mockMvc
            .get("/companies/search?q=AAPL") {
                header("Authorization", "Bearer $token")
            }.andExpect {
                status { isServiceUnavailable() }
            }
    }

    @Test
    fun `get details when EDGAR is down returns 503`() {
        val token = loginAndGetToken()

        mockMvc
            .get("/companies/320193/details") {
                header("Authorization", "Bearer $token")
            }.andExpect {
                status { isServiceUnavailable() }
            }
    }
}
