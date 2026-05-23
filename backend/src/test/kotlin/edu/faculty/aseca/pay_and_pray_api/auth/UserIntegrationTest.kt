package edu.faculty.aseca.pay_and_pray_api.auth

import edu.faculty.aseca.pay_and_pray_api.IntegrationTestBase
import org.junit.jupiter.api.Test
import org.springframework.test.web.servlet.get

class UserIntegrationTest : IntegrationTestBase() {
    @Test
    fun `GET api user without token returns 401`() {
        mockMvc.get("/api/user").andExpect {
            status { isUnauthorized() }
        }
    }

    @Test
    fun `GET api user with valid token returns 200 with userId`() {
        val token = loginAndGetToken()

        mockMvc
            .get("/api/user") {
                header("Authorization", "Bearer $token")
            }.andExpect {
                status { isOk() }
                jsonPath("$.userId") { exists() }
            }
    }

    @Test
    fun `GET api user with invalid token returns 401`() {
        mockMvc
            .get("/api/user") {
                header("Authorization", "Bearer invalid.token.here")
            }.andExpect {
                status { isUnauthorized() }
            }
    }
}
