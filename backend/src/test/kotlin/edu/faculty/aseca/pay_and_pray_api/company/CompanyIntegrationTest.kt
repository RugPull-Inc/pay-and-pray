package edu.faculty.aseca.pay_and_pray_api.company

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import java.util.UUID

@SpringBootTest
@ActiveProfiles("integration")
@AutoConfigureMockMvc
@Testcontainers
class CompanyIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    companion object {
        @Container
        @ServiceConnection
        @JvmField
        val postgres: PostgreSQLContainer<*> = PostgreSQLContainer("postgres:16")

        @DynamicPropertySource
        @JvmStatic
        fun jwtProperties(registry: DynamicPropertyRegistry) {
            registry.add("jwt.secret") { "integration-test-secret-key-long-enough-for-hmac-sha256" }
            registry.add("jwt.expiration-ms") { "86400000" }
        }
    }

    private fun loginAndGetToken(): String {
        val email = "test-${UUID.randomUUID()}@example.com"
        mockMvc
            .post("/auth/register") {
                contentType = MediaType.APPLICATION_JSON
                content = """{"email": "$email", "password": "password123"}"""
            }.andExpect { status { isCreated() } }

        val result =
            mockMvc
                .post("/auth/login") {
                    contentType = MediaType.APPLICATION_JSON
                    content = """{"email": "$email", "password": "password123"}"""
                }.andReturn()

        return ObjectMapper().readTree(result.response.contentAsString).get("token").asText()
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
