package edu.faculty.aseca.pay_and_pray_api.user

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import java.util.UUID

class UserServiceTest {
    private lateinit var userRepository: UserRepository
    private lateinit var userService: UserServiceImpl
    private val passwordEncoder = BCryptPasswordEncoder()

    @BeforeEach
    fun setUp() {
        userRepository = FakeUserRepository()
        userService = UserServiceImpl(userRepository, passwordEncoder)
    }

    @Test
    fun `createUser stores user with given email`() {
        val user = userService.createUser("rugpull@test.com", "plainpass")

        assertEquals("rugpull@test.com", user.email)
    }

    @Test
    fun `createUser does not store plain text password`() {
        val user = userService.createUser("rugpull@test.com", "plainpass")

        assertNotEquals("plainpass", user.password)
    }

    @Test
    fun `createUser stores a BCrypt-hashed password`() {
        val user = userService.createUser("rugpull@test.com", "plainpass")

        assertTrue(passwordEncoder.matches("plainpass", user.password))
    }

    @Test
    fun `findByEmail returns user when it exists`() {
        userService.createUser("rugpull@test.com", "plainpass")

        val found = userService.findByEmail("rugpull@test.com")

        assertNotNull(found)
        assertEquals("rugpull@test.com", found!!.email)
    }

    @Test
    fun `findByEmail returns null when user does not exist`() {
        val found = userService.findByEmail("nobody@test.com")

        assertNull(found)
    }
}

private class FakeUserRepository : UserRepository {
    private val store = mutableListOf<User>()

    override fun save(user: User): User = user.copy(id = UUID.randomUUID()).also { store.add(it) }

    override fun findByEmail(email: String): User? = store.find { it.email == email }
}
