package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.IntegrationTestBase
import org.junit.jupiter.api.Test
import org.springframework.test.web.servlet.get

class CompanyIntegrationTest : IntegrationTestBase() {
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

        // Apple Inc — CIK 320193, stable well-known EDGAR entry
        mockMvc
            .get("/companies/320193/details") {
                header("Authorization", "Bearer $token")
            }.andExpect {
                status { isOk() }
                jsonPath("$.cik") { value("320193") }
                jsonPath("$.metrics.revenue") { exists() }
                jsonPath("$.recentFilings[0]") { exists() }
            }
    }
}
