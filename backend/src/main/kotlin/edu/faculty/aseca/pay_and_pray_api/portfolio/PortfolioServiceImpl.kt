package edu.faculty.aseca.pay_and_pray_api.portfolio

import edu.faculty.aseca.pay_and_pray_api.portfolio.dto.PortfolioView
import edu.faculty.aseca.pay_and_pray_api.portfolio.dto.PositionView
import edu.faculty.aseca.pay_and_pray_api.portfolio.position.PositionRepository
import edu.faculty.aseca.pay_and_pray_api.price.PriceService
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.util.UUID

@Service
class PortfolioServiceImpl(
    private val positionRepository: PositionRepository,
    private val priceService: PriceService,
) : PortfolioService {
    override fun getPortfolio(userId: UUID): PortfolioView {
        val positions = positionRepository.findAllByUserId(userId)
        if (positions.isEmpty()) return PortfolioView(emptyList(), BigDecimal.ZERO)

        val views =
            positions.map { pos ->
                val currentPrice = priceService.getLatestPrice(pos.id.ticker)
                if (currentPrice != null) {
                    val qty = pos.quantity.toBigDecimal()
                    val currentValue = currentPrice.multiply(qty)
                    val pnl = currentPrice.subtract(pos.avgBuyPrice).multiply(qty)
                    val pnlPercentage =
                        currentPrice
                            .subtract(pos.avgBuyPrice)
                            .divide(pos.avgBuyPrice, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal("100"))
                            .setScale(2, RoundingMode.HALF_UP)
                    PositionView(
                        ticker = pos.id.ticker,
                        quantity = pos.quantity,
                        avgBuyPrice = pos.avgBuyPrice,
                        currentPrice = currentPrice,
                        currentValue = currentValue,
                        pnl = pnl,
                        pnlPercentage = pnlPercentage,
                    )
                } else {
                    PositionView(
                        ticker = pos.id.ticker,
                        quantity = pos.quantity,
                        avgBuyPrice = pos.avgBuyPrice,
                        currentPrice = null,
                        currentValue = null,
                        pnl = null,
                        pnlPercentage = null,
                    )
                }
            }

        val totalValue = views.mapNotNull { it.currentValue }.fold(BigDecimal.ZERO, BigDecimal::add)
        return PortfolioView(views, totalValue)
    }
}
