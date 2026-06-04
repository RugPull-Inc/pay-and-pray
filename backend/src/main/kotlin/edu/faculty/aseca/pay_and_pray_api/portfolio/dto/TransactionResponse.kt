package edu.faculty.aseca.pay_and_pray_api.portfolio.dto

import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

data class TransactionResponse(
    val id: UUID,
    val ticker: String,
    val type: String,
    val quantity: Int,
    val priceAtOperation: BigDecimal,
    val createdAt: Instant,
)
