package edu.faculty.aseca.pay_and_pray_api.auth

import edu.faculty.aseca.pay_and_pray_api.IntegrationTestBase
import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.post
import java.util.UUID

class AuthIntegrationTest : IntegrationTestBase() {
    private fun uniqueEmail() = "test-${UUID.randomUUID()}@example.com"

    private fun registerBody(
        email: String,
        password: String,
    ) = """{"email": "$email", "password": "$password"}"""

    @Test
    fun `register with valid data returns 201 with userId and email`() {
        val email = uniqueEmail()

        mockMvc
            .post("/auth/register") {
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
        mockMvc
            .post("/auth/register") {
                contentType = MediaType.APPLICATION_JSON
                content = registerBody(email, "password123")
            }.andExpect { status { isCreated() } }

        mockMvc
            .post("/auth/register") {
                contentType = MediaType.APPLICATION_JSON
                content = registerBody(email, "password123")
            }.andExpect {
                status { isConflict() }
            }
    }

    @Test
    fun `register with invalid email format returns 400`() {
        mockMvc
            .post("/auth/register") {
                contentType = MediaType.APPLICATION_JSON
                content = registerBody("not-an-email", "password123")
            }.andExpect {
                status { isBadRequest() }
            }
    }

    @Test
    fun `register with short password returns 400`() {
        mockMvc
            .post("/auth/register") {
                contentType = MediaType.APPLICATION_JSON
                content = registerBody(uniqueEmail(), "123")
            }.andExpect {
                status { isBadRequest() }
            }
    }

    @Test
    fun `login with valid credentials returns 200 with token`() {
        val email = uniqueEmail()
        mockMvc
            .post("/auth/register") {
                contentType = MediaType.APPLICATION_JSON
                content = registerBody(email, "password123")
            }.andExpect { status { isCreated() } }

        mockMvc
            .post("/auth/login") {
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
        mockMvc
            .post("/auth/register") {
                contentType = MediaType.APPLICATION_JSON
                content = registerBody(email, "password123")
            }.andExpect { status { isCreated() } }

        mockMvc
            .post("/auth/login") {
                contentType = MediaType.APPLICATION_JSON
                content = registerBody(email, "wrongpassword")
            }.andExpect {
                status { isUnauthorized() }
            }
    }

    @Test
    fun `login with non-existent email returns 401`() {
        mockMvc
            .post("/auth/login") {
                contentType = MediaType.APPLICATION_JSON
                content = registerBody("nobody-${UUID.randomUUID()}@example.com", "password123")
            }.andExpect {
                status { isUnauthorized() }
            }
    }
}
