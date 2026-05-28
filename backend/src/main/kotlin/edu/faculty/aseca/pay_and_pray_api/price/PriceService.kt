package edu.faculty.aseca.pay_and_pray_api.price

import java.math.BigDecimal

interface PriceService {
    fun getLatestPrice(ticker: String): BigDecimal?
    fun getLastUpdated(): LastUpdatedResponse
}
