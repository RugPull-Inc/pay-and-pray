package edu.faculty.aseca.pay_and_pray_api

import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.test.context.ActiveProfiles
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import java.util.TimeZone

@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
class PayAndPrayApiApplicationTests {
    companion object {
        @Container
        @ServiceConnection
        val postgres = PostgreSQLContainer<Nothing>("postgres:16")

        @JvmStatic
        @BeforeAll
        fun setup() {
            TimeZone.setDefault(TimeZone.getTimeZone("UTC"))
        }
    }

    @Test
    fun contextLoads() {
    }
}
