package edu.faculty.aseca.pay_and_pray_api.price

import org.springframework.stereotype.Service
import java.math.BigDecimal

@Service
class PriceServiceImpl(
    private val priceRepository: PriceRepository,
    private val batchRunRepository: BatchRunRepository,
) : PriceService {
    override fun getLatestPrice(ticker: String): BigDecimal? = priceRepository.findByTicker(ticker)?.price

    override fun getLastUpdated(): LastUpdatedResponse =
        batchRunRepository
            .findTopSuccessCompletedAt()
            ?.let { LastUpdatedResponse(lastUpdated = it) }
            ?: LastUpdatedResponse(message = "El proceso nunca fue ejecutado")
}
