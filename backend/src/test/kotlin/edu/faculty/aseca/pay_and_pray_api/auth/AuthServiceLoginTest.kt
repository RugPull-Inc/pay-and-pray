package edu.faculty.aseca.pay_and_pray_api.auth

import edu.faculty.aseca.pay_and_pray_api.auth.exception.InvalidCredentialsException
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder

class AuthServiceLoginTest {

    private lateinit var fakeUserService: FakeUserService
    private val passwordEncoder = BCryptPasswordEncoder()
    private val tokenService = FakeTokenService()
    private lateinit var authService: AuthService

    @BeforeEach
    fun setUp() {
        fakeUserService = FakeUserService()
        fakeUserService.createUser("rugpull@test.com", "secret")
        authService = AuthService(fakeUserService, tokenService, passwordEncoder)
    }

    @Test
    fun `login with valid credentials returns a token`() {
        val response = authService.login("rugpull@test.com", "secret")

        assertNotNull(response.token)
        assertTrue(response.token.isNotBlank())
    }

    @Test
    fun `login with wrong password throws InvalidCredentialsException`() {
        assertThrows<InvalidCredentialsException> {
            authService.login("rugpull@test.com", "wrongpass")
        }
    }

    @Test
    fun `login with non-existent email throws InvalidCredentialsException`() {
        assertThrows<InvalidCredentialsException> {
            authService.login("nobody@test.com", "secret")
        }
    }

    @Test
    fun `login fails for both wrong password and non-existent email`() {
        assertThrows<InvalidCredentialsException> {
            authService.login("nobody@test.com", "wrongpass")
        }
    }

    @Test
    fun `wrong password and non-existent email return the same error`() {
        val wrongPassword = assertThrows<InvalidCredentialsException> {
            authService.login("rugpull@test.com", "wrongpass")
        }
        val noUser = assertThrows<InvalidCredentialsException> {
            authService.login("nobody@test.com", "secret")
        }

        assertEquals(wrongPassword.message, noUser.message)
    }
}