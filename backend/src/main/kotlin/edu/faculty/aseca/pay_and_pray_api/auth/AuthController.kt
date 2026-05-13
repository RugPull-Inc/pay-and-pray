package edu.faculty.aseca.pay_and_pray_api.auth

import edu.faculty.aseca.pay_and_pray_api.auth.dto.LoginRequest
import edu.faculty.aseca.pay_and_pray_api.auth.dto.LoginResponse
import edu.faculty.aseca.pay_and_pray_api.auth.dto.RegisterRequest
import edu.faculty.aseca.pay_and_pray_api.auth.dto.RegisterResponse

import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/auth")
class AuthController(private val authService: AuthService) {

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<RegisterResponse> =
        ResponseEntity.status(201).body(
            authService.register(request.email, request.password)
        )

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<LoginResponse> =
        ResponseEntity.ok(authService.login(request.email, request.password))
}
