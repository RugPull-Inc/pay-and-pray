package edu.faculty.aseca.pay_and_pray_api.user

import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) {
    fun createUser(email: String, plainPassword: String): User {
        val hashed = passwordEncoder.encode(plainPassword)
            ?: throw IllegalStateException("Password encoding failed")

        return userRepository.save(User(email = email, password = hashed))
    }

    fun findByEmail(email: String): User? = userRepository.findByEmail(email)
}