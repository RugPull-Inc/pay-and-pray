package edu.faculty.aseca.pay_and_pray_api.watchlist.compare.dto

import edu.faculty.aseca.pay_and_pray_api.company.FilingEntry
import java.math.BigDecimal
import java.time.Instant

data class CompanyComparisonResponse(
    val ticker: String,
    val currentPrice: BigDecimal?,
    val marketCap: BigDecimal?,
    val revenueQuarterly: Double?,
    val netIncomeQuarterly: Double?,
    val epsQuarterly: Double?,
    val totalAssets: Double?,
    val totalLiabilities: Double?,
    val lastFiling: FilingEntry?,
    val priceLastUpdatedAt: Instant?,
)
