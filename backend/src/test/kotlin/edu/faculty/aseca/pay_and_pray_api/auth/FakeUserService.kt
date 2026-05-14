package edu.faculty.aseca.pay_and_pray_api.auth

import edu.faculty.aseca.pay_and_pray_api.user.User
import edu.faculty.aseca.pay_and_pray_api.user.UserService
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import java.util.UUID

class FakeUserService : UserService {
    private val store = mutableListOf<User>()
    private val passwordEncoder = BCryptPasswordEncoder()

    override fun createUser(
        email: String,
        plainPassword: String,
    ): User =
        User(id = UUID.randomUUID(), email = email, password = passwordEncoder.encode(plainPassword).toString())
            .also { store.add(it) }

    override fun findByEmail(email: String): User? = store.find { it.email == email }
}
