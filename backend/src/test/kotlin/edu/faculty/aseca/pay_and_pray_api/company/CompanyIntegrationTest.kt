package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.IntegrationTestBase
import edu.faculty.aseca.pay_and_pray_api.edgar.CompanyConcept
import edu.faculty.aseca.pay_and_pray_api.edgar.CompanySubmissions
import edu.faculty.aseca.pay_and_pray_api.edgar.CompanyTicker
import edu.faculty.aseca.pay_and_pray_api.edgar.ConceptUnit
import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarClient
import edu.faculty.aseca.pay_and_pray_api.edgar.RecentFilings
import edu.faculty.aseca.pay_and_pray_api.edgar.RecentFilingsData
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.kotlin.any
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.get

class CompanyIntegrationTest : IntegrationTestBase() {
    @MockitoBean
    private lateinit var edgarClient: EdgarClient

    @BeforeEach
    fun setUp() {
        given(edgarClient.getCompanyTickers()).willReturn(
            mapOf(
                "0" to CompanyTicker(cikStr = 320193, name = "Apple Inc.", ticker = "AAPL"),
                "1" to CompanyTicker(cikStr = 789019, name = "Microsoft Corporation", ticker = "MSFT"),
            ),
        )

        given(edgarClient.getCompanySubmissions(any())).willReturn(
            CompanySubmissions(
                cik = "0000320193",
                name = "Apple Inc.",
                tickers = listOf("AAPL"),
                exchanges = listOf("Nasdaq"),
                filings =
                    RecentFilings(
                        recent =
                            RecentFilingsData(
                                accessionNumber = listOf("0000320193-24-000006"),
                                filingDate = listOf("2024-02-02"),
                                reportDate = listOf("2023-12-30"),
                                form = listOf("10-K"),
                                primaryDocument = listOf("aapl-20231230.htm"),
                            ),
                    ),
            ),
        )

        val revenueUnit =
            ConceptUnit(
                end = "2023-09-30",
                value = 383285000000.0,
                accn = "0000320193-23-000077",
                fy = 2023,
                fp = "FY",
                form = "10-K",
                filed = "2023-11-02",
            )
        given(edgarClient.getCompanyConcept(any(), any())).willReturn(
            CompanyConcept(
                cik = "0000320193",
                entityName = "Apple Inc.",
                tag = "Revenues",
                units = mapOf("USD" to listOf(revenueUnit)),
            ),
        )
    }

    @Test
    fun `search by ticker returns 200 with results`() {
        val token = loginAndGetToken()

        mockMvc
            .get("/companies/search?q=AAPL") {
                header("Authorization", "Bearer $token")
            }.andExpect {
                status { isOk() }
                jsonPath("$.results[0]") { exists() }
                jsonPath("$.total") { exists() }
            }
    }

    @Test
    fun `search by name returns 200 with results`() {
        val token = loginAndGetToken()

        mockMvc
            .get("/companies/search?q=Apple") {
                header("Authorization", "Bearer $token")
            }.andExpect {
                status { isOk() }
                jsonPath("$.results[0]") { exists() }
            }
    }

    @Test
    fun `search with no results returns 200 with empty list`() {
        val token = loginAndGetToken()

        mockMvc
            .get("/companies/search?q=ZZZNORESULTSXYZ99999") {
                header("Authorization", "Bearer $token")
            }.andExpect {
                status { isOk() }
                jsonPath("$.total") { value(0) }
                jsonPath("$.results[0]") { doesNotExist() }
            }
    }

    @Test
    fun `get company financial details returns 200 with metrics and filings`() {
        val token = loginAndGetToken()

        mockMvc
            .get("/companies/320193/details") {
                header("Authorization", "Bearer $token")
            }.andExpect {
                status { isOk() }
                jsonPath("$.cik") { value("320193") }
                jsonPath("$.metrics.revenue") { exists() }
                jsonPath("$.recentFilings[0]") { exists() }
                jsonPath("$.recentFilings[0].reportDate") { exists() }
                jsonPath("$.recentFilings[0].url") { exists() }
            }
    }
}
