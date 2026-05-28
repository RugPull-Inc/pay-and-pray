package edu.faculty.aseca.pay_and_pray_api.portfolio.sell

import edu.faculty.aseca.pay_and_pray_api.portfolio.dto.SellResponse
import edu.faculty.aseca.pay_and_pray_api.portfolio.exception.InsufficientQuantityException
import edu.faculty.aseca.pay_and_pray_api.portfolio.exception.NoPositionException
import edu.faculty.aseca.pay_and_pray_api.portfolio.exception.TickerNotFoundException
import edu.faculty.aseca.pay_and_pray_api.portfolio.position.PositionRepository
import edu.faculty.aseca.pay_and_pray_api.portfolio.transaction.Transaction
import edu.faculty.aseca.pay_and_pray_api.portfolio.transaction.TransactionRepository
import edu.faculty.aseca.pay_and_pray_api.price.PriceService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.Locale
import java.util.UUID

@Service
@Transactional
class SellServiceImpl(
    private val priceService: PriceService,
    private val positionRepository: PositionRepository,
    private val transactionRepository: TransactionRepository,
) : SellService {
    override fun sell(
        userId: UUID,
        ticker: String,
        quantity: Int,
    ): SellResponse {
        val normalizedTicker = ticker.trim().uppercase(Locale.US)
        val price = priceService.getLatestPrice(normalizedTicker) ?: throw TickerNotFoundException()

        val position = positionRepository.findByUserIdAndTicker(userId, normalizedTicker) ?: throw NoPositionException()

        if (quantity > position.quantity) throw InsufficientQuantityException()

        transactionRepository.save(
            Transaction(
                userId = userId,
                ticker = normalizedTicker,
                type = "SELL",
                quantity = quantity,
                priceAtOperation = price,
            ),
        )

        val remaining = position.quantity - quantity
        if (remaining == 0) {
            positionRepository.delete(position)
        } else {
            positionRepository.save(position.copy(quantity = remaining, updatedAt = LocalDateTime.now()))
        }

        return SellResponse(
            ticker = normalizedTicker,
            quantity = quantity,
            priceAtOperation = price,
            remainingQuantity = remaining,
        )
    }
}
