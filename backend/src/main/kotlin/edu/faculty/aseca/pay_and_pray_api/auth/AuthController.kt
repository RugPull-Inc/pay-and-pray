package edu.faculty.aseca.pay_and_pray_api.auth

import edu.faculty.aseca.pay_and_pray_api.auth.dto.LoginRequest
import edu.faculty.aseca.pay_and_pray_api.auth.dto.LoginResponse
import edu.faculty.aseca.pay_and_pray_api.auth.dto.RegisterRequest
import edu.faculty.aseca.pay_and_pray_api.auth.dto.RegisterResponse
import edu.faculty.aseca.pay_and_pray_api.auth.exception.DuplicateEmailException
import edu.faculty.aseca.pay_and_pray_api.auth.exception.InvalidCredentialsException
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/auth")
class AuthController(private val authService: AuthService) {

    @PostMapping("/register")
    fun register(@RequestBody request: RegisterRequest): ResponseEntity<RegisterResponse> =
        ResponseEntity.status(201).body(
            authService.register(request.email, request.password)
        )

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ResponseEntity<LoginResponse> =
        ResponseEntity.ok(authService.login(request.email, request.password))

    @ExceptionHandler(InvalidCredentialsException::class)
    fun handleInvalidCredentials(ex: InvalidCredentialsException): ResponseEntity<Map<String, String>> =
        ResponseEntity.status(401).body(mapOf("error" to ex.message!!))

    @ExceptionHandler(DuplicateEmailException::class)
    fun handleDuplicateEmail(ex: DuplicateEmailException): ResponseEntity<Map<String, String>> =
        ResponseEntity.status(409).body(mapOf("error" to ex.message!!))
}