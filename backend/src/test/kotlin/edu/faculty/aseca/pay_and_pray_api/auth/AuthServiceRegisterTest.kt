package edu.faculty.aseca.pay_and_pray_api.auth

import edu.faculty.aseca.pay_and_pray_api.auth.exception.DuplicateEmailException
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder

class AuthServiceRegisterTest {

    private lateinit var userRepository: FakeUserRepository
    private val passwordEncoder = BCryptPasswordEncoder()
    private lateinit var authService: AuthService

    @BeforeEach
    fun setUp() {
        userRepository = FakeUserRepository()
        authService = AuthService(userRepository, FakeTokenService(), passwordEncoder)
    }
    
    @Test
    fun `register with a new email returns user with correct email`() {
        val user = authService.register("new@test.com", "pass123")

        assertEquals("new@test.com", user.email)
    }
    
    @Test
    fun `register with new email creates user and returns it with an id`() {
        val user = authService.register("new@test.com", "pass123")

        assertNotNull(user.id)
    }

    @Test
    fun `register hashes the password before storing`() {
        authService.register("new@test.com", "plaintext")

        val stored = userRepository.findByEmail("new@test.com")!!
        assertNotEquals("plaintext", stored.password)
        assertTrue(passwordEncoder.matches("plaintext", stored.password))
    }

    @Test
    fun `register with duplicate email throws DuplicateEmailException`() {
        authService.register("dup@test.com", "pass123")

        assertThrows<DuplicateEmailException> {
            authService.register("dup@test.com", "otherpass")
        }
    }
}