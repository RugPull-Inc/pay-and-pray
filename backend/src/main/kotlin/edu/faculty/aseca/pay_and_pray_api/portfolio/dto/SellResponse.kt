package edu.faculty.aseca.pay_and_pray_api.portfolio.dto

import java.math.BigDecimal

data class SellResponse(
    val ticker: String,
    val quantity: Int,
    val priceAtOperation: BigDecimal,
    val remainingQuantity: Int,
)
