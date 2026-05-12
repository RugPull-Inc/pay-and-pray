package edu.faculty.aseca.pay_and_pray_api.auth

import edu.faculty.aseca.pay_and_pray_api.user.User
import edu.faculty.aseca.pay_and_pray_api.user.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import java.util.UUID

class AuthServiceTest {

    private lateinit var userRepository: FakeUserRepository
    private val passwordEncoder = BCryptPasswordEncoder()
    private val tokenService = FakeTokenService()
    private lateinit var authService: AuthService

    @BeforeEach
    fun setUp() {
        userRepository = FakeUserRepository()
        userRepository.add(User(email = "rugpull@test.com", password = passwordEncoder.encode("secret")!!))
        authService = AuthService(userRepository, tokenService, passwordEncoder)
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

private class FakeUserRepository : UserRepository {
    private val store = mutableListOf<User>()

    fun add(user: User) { store.add(user.copy(id = UUID.randomUUID())) }

    override fun save(user: User): User = user.copy(id = UUID.randomUUID()).also { store.add(it) }
    override fun findByEmail(email: String): User? = store.find { it.email == email }
}

private class FakeTokenService : TokenService {
    override fun generate(userId: String): String = "fake-token-for-$userId"
}