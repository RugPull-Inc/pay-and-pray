package edu.faculty.aseca.pay_and_pray_api.price

interface PriceRepository {
    fun findByTicker(ticker: String): Price?
}
