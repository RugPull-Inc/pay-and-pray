package edu.faculty.aseca.pay_and_pray_api.portfolio

import edu.faculty.aseca.pay_and_pray_api.price.LastUpdatedResponse
import edu.faculty.aseca.pay_and_pray_api.price.PriceService
import java.math.BigDecimal

class FakePriceService : PriceService {
    var price: BigDecimal? = BigDecimal("150.00")

    override fun getLatestPrice(ticker: String): BigDecimal? = price

    override fun getLastUpdated(): LastUpdatedResponse = LastUpdatedResponse()
}
