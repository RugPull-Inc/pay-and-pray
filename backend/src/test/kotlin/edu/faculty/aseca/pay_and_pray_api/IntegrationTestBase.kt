package edu.faculty.aseca.pay_and_pray_api

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.post
import java.util.UUID

@SpringBootTest
@ActiveProfiles("integration")
@AutoConfigureMockMvc
@Import(TestcontainersConfig::class)
abstract class IntegrationTestBase {
    @Autowired
    protected lateinit var mockMvc: MockMvc

    protected fun loginAndGetToken(): String {
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
}
