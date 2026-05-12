package edu.faculty.aseca.pay_and_pray_api.auth

import edu.faculty.aseca.pay_and_pray_api.user.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val tokenService: TokenService,
    private val passwordEncoder: PasswordEncoder
) {
    fun login(email: String, password: String): LoginResponse {
        val user = userRepository.findByEmail(email)
        if (user == null || !passwordEncoder.matches(password, user.password)) {
            throw InvalidCredentialsException()
        }
        return LoginResponse(token = tokenService.generate(user.id.toString()))
    }
}