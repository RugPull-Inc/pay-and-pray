package edu.faculty.aseca.pay_and_pray_api.price

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.doThrow
import org.mockito.Mockito.reset
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
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
import java.time.Instant

@SpringBootTest
@ActiveProfiles("integration")
@AutoConfigureMockMvc
@Testcontainers
class PriceIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var batchRunJpa: JpaBatchRunRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockBean
    private lateinit var batchTriggerService: BatchTriggerService

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
    fun setUp() {
        reset(batchTriggerService)
        batchRunJpa.deleteAll()
    }

    private fun loginAndGetToken(): String {
        val email = "test-${java.util.UUID.randomUUID()}@example.com"
        mockMvc
            .post("/auth/register") {
                contentType = MediaType.APPLICATION_JSON
                content = """{"email": "$email", "password": "password123"}"""
            }.andExpect { status { isCreated() } }

        val response =
            mockMvc
                .post("/auth/login") {
                    contentType = MediaType.APPLICATION_JSON
                    content = """{"email": "$email", "password": "password123"}"""
                }.andReturn()
                .response
                .contentAsString

        return objectMapper.readTree(response)["token"].asText()
    }

    @Test
    fun `POST admin prices refresh returns 202 when trigger succeeds`() {
        mockMvc
            .post("/admin/prices/refresh")
            .andExpect { status { isAccepted() } }
    }

    @Test
    fun `POST admin prices refresh returns 500 when trigger throws`() {
        doThrow(RuntimeException("script not found")).`when`(batchTriggerService).trigger()

        mockMvc
            .post("/admin/prices/refresh")
            .andExpect { status { isInternalServerError() } }
    }

    @Test
    fun `GET prices last-updated without auth returns 401`() {
        mockMvc
            .get("/prices/last-updated")
            .andExpect { status { isUnauthorized() } }
    }

    @Test
    fun `GET prices last-updated with auth returns lastUpdated null and message when no runs`() {
        val token = loginAndGetToken()

        mockMvc
            .get("/prices/last-updated") {
                header("Authorization", "Bearer $token")
            }.andExpect {
                status { isOk() }
                jsonPath("$.message") { value("El proceso nunca fue ejecutado") }
            }
    }

    @Test
    fun `GET prices last-updated with auth returns timestamp of last successful run`() {
        batchRunJpa.save(
            BatchRun(
                startedAt = Instant.parse("2026-05-23T14:29:00Z"),
                completedAt = Instant.parse("2026-05-23T14:30:00Z"),
                status = "SUCCESS",
            ),
        )
        val token = loginAndGetToken()

        mockMvc
            .get("/prices/last-updated") {
                header("Authorization", "Bearer $token")
            }.andExpect {
                status { isOk() }
                jsonPath("$.lastUpdated") { value("2026-05-23T14:30:00Z") }
            }
    }

    @Test
    fun `GET prices last-updated ignores failed runs and returns last successful timestamp`() {
        batchRunJpa.save(
            BatchRun(
                startedAt = Instant.parse("2026-05-23T14:29:00Z"),
                completedAt = Instant.parse("2026-05-23T14:30:00Z"),
                status = "SUCCESS",
            ),
        )
        batchRunJpa.save(
            BatchRun(
                startedAt = Instant.parse("2026-05-24T10:00:00Z"),
                completedAt = null,
                status = "FAILURE",
                errorSummary = "DB unreachable",
            ),
        )
        val token = loginAndGetToken()

        mockMvc
            .get("/prices/last-updated") {
                header("Authorization", "Bearer $token")
            }.andExpect {
                status { isOk() }
                jsonPath("$.lastUpdated") { value("2026-05-23T14:30:00Z") }
            }
    }
}
