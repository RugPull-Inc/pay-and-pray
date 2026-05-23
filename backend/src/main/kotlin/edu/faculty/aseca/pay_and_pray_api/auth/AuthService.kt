package edu.faculty.aseca.pay_and_pray_api.auth

import edu.faculty.aseca.pay_and_pray_api.auth.dto.LoginResponse
import edu.faculty.aseca.pay_and_pray_api.auth.dto.RegisterResponse
import edu.faculty.aseca.pay_and_pray_api.auth.exception.DuplicateEmailException
import edu.faculty.aseca.pay_and_pray_api.auth.exception.InvalidCredentialsException
import edu.faculty.aseca.pay_and_pray_api.auth.token.TokenService
import edu.faculty.aseca.pay_and_pray_api.user.UserService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userService: UserService,
    private val tokenService: TokenService,
    private val passwordEncoder: PasswordEncoder,
) {
    fun register(
        email: String,
        plainPassword: String,
    ): RegisterResponse {
        if (userService.findByEmail(email) != null) throw DuplicateEmailException()
        val user = userService.createUser(email, plainPassword)
        return RegisterResponse(
            userId = user.id.toString(),
            email = user.email,
            token = tokenService.generate(user.id.toString()),
        )
    }

    fun login(
        email: String,
        password: String,
    ): LoginResponse {
        val user = userService.findByEmail(email)
        if (user == null || !passwordEncoder.matches(password, user.password)) {
            throw InvalidCredentialsException()
        }
        return LoginResponse(token = tokenService.generate(user.id.toString()))
    }
}
