package edu.faculty.aseca.pay_and_pray_api.company

import com.fasterxml.jackson.databind.ObjectMapper
import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarApiException
import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarClient
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyString
import org.mockito.BDDMockito.given
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.context.bean.override.mockito.MockitoBean
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
class CompanyApiDownIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockitoBean
    private lateinit var edgarClient: EdgarClient

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

    @BeforeEach
    fun setupEdgarDown() {
        given(edgarClient.searchFullText(anyString() ?: ""))
            .willThrow(EdgarApiException("EDGAR is down"))
        given(edgarClient.getCompanySubmissions(anyString() ?: ""))
            .willThrow(EdgarApiException("EDGAR is down"))
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
