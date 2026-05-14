package edu.faculty.aseca.pay_and_pray_api.dev

import edu.faculty.aseca.pay_and_pray_api.auth.AuthService
import edu.faculty.aseca.pay_and_pray_api.auth.exception.DuplicateEmailException
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.stereotype.Component

@Component
class DevDataSeeder(
    private val authService: AuthService,
    @Value("\${seed.user-count:1}") private val userCount: Int,
) : ApplicationRunner {
    private val logger = LoggerFactory.getLogger(DevDataSeeder::class.java)

    override fun run(args: ApplicationArguments) {
        repeat(userCount) { i ->
            val email = "user${i + 1}@rugpull.com"
            try {
                authService.register(email, "password123")
                logger.info("Seeded user: $email / password123")
            } catch (e: DuplicateEmailException) {
                logger.info("User $email already exists, skipping")
            }
        }
    }
}
