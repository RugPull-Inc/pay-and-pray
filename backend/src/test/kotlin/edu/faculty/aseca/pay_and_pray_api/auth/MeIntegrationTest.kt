package edu.faculty.aseca.pay_and_pray_api.auth

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
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
@AutoConfigureMockMvc
@Testcontainers
class MeIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    companion object {
        @Container
        @ServiceConnection
        @JvmField
        val postgres: PostgreSQLContainer<*> = PostgreSQLContainer("postgres:16")

        @DynamicPropertySource
        @JvmStatic
        fun properties(registry: DynamicPropertyRegistry) {
            registry.add("jwt.secret") { "integration-test-secret-key-long-enough-for-hmac-sha256" }
            registry.add("jwt.expiration-ms") { "86400000" }
        }
    }

    private fun loginAndGetToken(): String {
        val email = "test-${UUID.randomUUID()}@example.com"
        mockMvc.post("/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email": "$email", "password": "password123"}"""
        }.andExpect { status { isCreated() } }

        val result = mockMvc.post("/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"email": "$email", "password": "password123"}"""
        }.andReturn()

        return ObjectMapper().readTree(result.response.contentAsString).get("token").asText()
    }

    @Test
    fun `GET api me without token returns 401`() {
        mockMvc.get("/api/me").andExpect {
            status { isUnauthorized() }
        }
    }

    @Test
    fun `GET api me with valid token returns 200 with userId`() {
        val token = loginAndGetToken()

        mockMvc.get("/api/me") {
            header("Authorization", "Bearer $token")
        }.andExpect {
            status { isOk() }
            jsonPath("$.userId") { exists() }
        }
    }

    @Test
    fun `GET api me with invalid token returns 401`() {
        mockMvc.get("/api/me") {
            header("Authorization", "Bearer invalid.token.here")
        }.andExpect {
            status { isUnauthorized() }
        }
    }
}
