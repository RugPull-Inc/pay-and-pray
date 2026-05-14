package edu.faculty.aseca.pay_and_pray_api.auth

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.http.MediaType
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import java.util.UUID

@SpringBootTest
@Testcontainers // Note: test will fail without Docker running (no need for docker compose up, only Docker itself)
class AuthIntegrationTest {

    @Autowired
    private lateinit var context: WebApplicationContext

    private lateinit var mockMvc: MockMvc

    @BeforeEach
    fun setup() { mockMvc = MockMvcBuilders.webAppContextSetup(context).build() }

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

    private fun uniqueEmail() = "test-${UUID.randomUUID()}@example.com"

    private fun registerBody(email: String, password: String) = """{"email": "$email", "password": "$password"}"""

    @Test
    fun `register with valid data returns 201 with userId and email`() {
        val email = uniqueEmail()

        mockMvc.post("/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = registerBody(email, "password123")
        }.andExpect {
            status { isCreated() }
            jsonPath("$.userId") { exists() }
            jsonPath("$.email") { value(email) }
        }
    }

    @Test
    fun `register with duplicate email returns 409`() {
        val email = uniqueEmail()
        mockMvc.post("/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = registerBody(email, "password123")
        }.andExpect { status { isCreated() } }

        mockMvc.post("/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = registerBody(email, "password123")
        }.andExpect {
            status { isConflict() }
        }
    }

    @Test
    fun `register with invalid email format returns 400`() {
        mockMvc.post("/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = registerBody("not-an-email", "password123")
        }.andExpect {
            status { isBadRequest() }
        }
    }

    @Test
    fun `register with short password returns 400`() {
        mockMvc.post("/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = registerBody(uniqueEmail(), "123")
        }.andExpect {
            status { isBadRequest() }
        }
    }

    @Test
    fun `login with valid credentials returns 200 with token`() {
        val email = uniqueEmail()
        mockMvc.post("/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = registerBody(email, "password123")
        }.andExpect { status { isCreated() } }

        mockMvc.post("/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = registerBody(email, "password123")
        }.andExpect {
            status { isOk() }
            jsonPath("$.token") { exists() }
        }
    }

    @Test
    fun `login with wrong password returns 401`() {
        val email = uniqueEmail()
        mockMvc.post("/auth/register") {
            contentType = MediaType.APPLICATION_JSON
            content = registerBody(email, "password123")
        }.andExpect { status { isCreated() } }

        mockMvc.post("/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = registerBody(email, "wrongpassword")
        }.andExpect {
            status { isUnauthorized() }
        }
    }

    @Test
    fun `login with non-existent email returns 401`() {
        mockMvc.post("/auth/login") {
            contentType = MediaType.APPLICATION_JSON
            content = registerBody("nobody-${UUID.randomUUID()}@example.com", "password123")
        }.andExpect {
            status { isUnauthorized() }
        }
    }
}