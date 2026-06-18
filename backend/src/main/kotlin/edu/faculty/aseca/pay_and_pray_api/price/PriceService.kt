package edu.faculty.aseca.pay_and_pray_api.price

import java.math.BigDecimal
import java.time.Instant

interface PriceService {
    fun getLatestPrice(ticker: String): BigDecimal?

    fun getLatestPriceUpdatedAt(ticker: String): Instant?

    fun getLastUpdated(): LastUpdatedResponse
}
