package edu.faculty.aseca.pay_and_pray_api.auth

import edu.faculty.aseca.pay_and_pray_api.auth.dto.LoginResponse
import edu.faculty.aseca.pay_and_pray_api.auth.dto.RegisterResponse
import edu.faculty.aseca.pay_and_pray_api.auth.exception.DuplicateEmailException
import edu.faculty.aseca.pay_and_pray_api.auth.exception.InvalidCredentialsException
import edu.faculty.aseca.pay_and_pray_api.auth.token.TokenService
import edu.faculty.aseca.pay_and_pray_api.user.User
import edu.faculty.aseca.pay_and_pray_api.user.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val tokenService: TokenService,
    private val passwordEncoder: PasswordEncoder
) {
    fun register(email: String, plainPassword: String): RegisterResponse {
        if (userRepository.findByEmail(email) != null) throw DuplicateEmailException()
        val hashed = passwordEncoder.encode(plainPassword)
            ?: throw IllegalStateException("Password encoding failed")
        val user = userRepository.save(User(email = email, password = hashed))
        return RegisterResponse(id = user.id.toString(), email = user.email)
    }

    fun login(email: String, password: String): LoginResponse {
        val user = userRepository.findByEmail(email)
        if (user == null || !passwordEncoder.matches(password, user.password)) {
            throw InvalidCredentialsException()
        }
        return LoginResponse(token = tokenService.generate(user.id.toString()))
    }
}