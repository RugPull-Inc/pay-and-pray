package edu.faculty.aseca.pay_and_pray_api.portfolio.dto

import java.math.BigDecimal

data class BuyResponse(
    val ticker: String,
    val quantity: Int,
    val priceAtOperation: BigDecimal,
    val newQuantity: Int,
    val newAvgBuyPrice: BigDecimal,
)
