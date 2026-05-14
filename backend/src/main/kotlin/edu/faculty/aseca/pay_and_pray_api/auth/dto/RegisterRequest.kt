package edu.faculty.aseca.pay_and_pray_api.auth.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class RegisterRequest(
    @field:NotBlank(message = "email is required")
    @field:Email(message = "email must be valid")
    val email: String,
    @field:NotBlank(message = "password is required")
    @field:Size(min = 8, message = "password must be at least 8 characters")
    val password: String,
)
