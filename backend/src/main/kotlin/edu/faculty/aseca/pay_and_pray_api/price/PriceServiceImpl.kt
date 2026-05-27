package edu.faculty.aseca.pay_and_pray_api.price

import org.springframework.stereotype.Service
import java.math.BigDecimal

@Service
class PriceServiceImpl(private val priceRepository: PriceRepository) : PriceService {
    override fun getLatestPrice(ticker: String): BigDecimal? = priceRepository.findByTicker(ticker)?.price
}
