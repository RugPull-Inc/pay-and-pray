package edu.faculty.aseca.pay_and_pray_api.watchlist.compare

import edu.faculty.aseca.pay_and_pray_api.price.LastUpdatedResponse
import edu.faculty.aseca.pay_and_pray_api.price.PriceService
import java.math.BigDecimal
import java.time.Instant

class FakePriceService : PriceService {
    val priceByTicker = mutableMapOf<String, BigDecimal>()
    val updatedAtByTicker = mutableMapOf<String, Instant>()

    override fun getLatestPrice(ticker: String): BigDecimal? = priceByTicker[ticker]

    override fun getLatestPriceUpdatedAt(ticker: String): Instant? = updatedAtByTicker[ticker]

    override fun getLastUpdated(): LastUpdatedResponse = LastUpdatedResponse()
}
