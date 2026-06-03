package edu.faculty.aseca.pay_and_pray_api.portfolio.dto

import java.math.BigDecimal

data class PositionView(
    val ticker: String,
    val quantity: Int,
    val avgBuyPrice: BigDecimal,
    val currentPrice: BigDecimal?,
    val currentValue: BigDecimal?,
    val pnl: BigDecimal?,
    val pnlPercentage: BigDecimal?,
)

data class PortfolioView(
    val positions: List<PositionView>,
    val totalValue: BigDecimal,
)
