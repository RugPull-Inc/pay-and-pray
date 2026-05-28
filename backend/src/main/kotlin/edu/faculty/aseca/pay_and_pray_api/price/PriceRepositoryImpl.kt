package edu.faculty.aseca.pay_and_pray_api.price

import org.springframework.stereotype.Component

@Component
class PriceRepositoryImpl(
    private val jpa: JpaPriceRepository,
) : PriceRepository {
    override fun findByTicker(ticker: String): Price? = jpa.findById(ticker).orElse(null)
}
