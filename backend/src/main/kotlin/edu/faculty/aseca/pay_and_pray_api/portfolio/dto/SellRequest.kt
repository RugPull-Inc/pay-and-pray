package edu.faculty.aseca.pay_and_pray_api.portfolio.dto

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank

data class SellRequest(
    @field:NotBlank(message = "El ticker es requerido")
    val ticker: String,
    @field:Min(value = 1, message = "La cantidad debe ser mayor a cero")
    val quantity: Int,
)
