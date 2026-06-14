package edu.faculty.aseca.pay_and_pray_api.watchlist.dto

import jakarta.validation.constraints.NotBlank

data class AddTickerRequest(
    @field:NotBlank(message = "El ticker es requerido")
    val ticker: String,
)
