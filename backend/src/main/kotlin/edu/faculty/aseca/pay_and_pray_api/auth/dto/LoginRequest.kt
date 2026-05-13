package edu.faculty.aseca.pay_and_pray_api.auth.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank

data class LoginRequest(
    @field:NotBlank(message = "email is required")
    @field:Email(message = "email must be valid")
    val email: String,

    @field:NotBlank(message = "password is required")
    val password: String
)
