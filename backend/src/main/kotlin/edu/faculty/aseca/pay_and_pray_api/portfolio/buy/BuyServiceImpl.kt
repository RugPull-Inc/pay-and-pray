package edu.faculty.aseca.pay_and_pray_api.portfolio.buy

import edu.faculty.aseca.pay_and_pray_api.portfolio.dto.BuyResponse
import edu.faculty.aseca.pay_and_pray_api.portfolio.exception.TickerNotFoundException
import edu.faculty.aseca.pay_and_pray_api.portfolio.position.Position
import edu.faculty.aseca.pay_and_pray_api.portfolio.position.PositionId
import edu.faculty.aseca.pay_and_pray_api.portfolio.position.PositionRepository
import edu.faculty.aseca.pay_and_pray_api.portfolio.transaction.Transaction
import edu.faculty.aseca.pay_and_pray_api.portfolio.transaction.TransactionRepository
import edu.faculty.aseca.pay_and_pray_api.price.PriceService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.RoundingMode
import java.time.LocalDateTime
import java.util.Locale
import java.util.UUID

@Service
@Transactional
class BuyServiceImpl(
    private val priceService: PriceService,
    private val positionRepository: PositionRepository,
    private val transactionRepository: TransactionRepository,
) : BuyService {
    override fun buy(
        userId: UUID,
        ticker: String,
        quantity: Int,
    ): BuyResponse {
        val normalizedTicker = ticker.trim().uppercase(Locale.US)
        val price = priceService.getLatestPrice(normalizedTicker) ?: throw TickerNotFoundException()

        transactionRepository.save(
            Transaction(
                userId = userId,
                ticker = normalizedTicker,
                type = "BUY",
                quantity = quantity,
                priceAtOperation = price,
            ),
        )

        val existing = positionRepository.findByUserIdAndTicker(userId, normalizedTicker)
        val updatedPosition =
            if (existing == null) {
                positionRepository.save(
                    Position(id = PositionId(userId, normalizedTicker), quantity = quantity, avgBuyPrice = price),
                )
            } else {
                val newQty = existing.quantity + quantity
                val newAvg =
                    (existing.quantity.toBigDecimal() * existing.avgBuyPrice + quantity.toBigDecimal() * price)
                        .divide(newQty.toBigDecimal(), 4, RoundingMode.HALF_UP)
                positionRepository.save(
                    existing.copy(quantity = newQty, avgBuyPrice = newAvg, updatedAt = LocalDateTime.now()),
                )
            }

        return BuyResponse(
            ticker = normalizedTicker,
            quantity = quantity,
            priceAtOperation = price,
            newQuantity = updatedPosition.quantity,
            newAvgBuyPrice = updatedPosition.avgBuyPrice,
        )
    }
}
