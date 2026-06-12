package edu.faculty.aseca.pay_and_pray_api.portfolio

import edu.faculty.aseca.pay_and_pray_api.portfolio.position.Position
import edu.faculty.aseca.pay_and_pray_api.portfolio.position.PositionId
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertNull

class PortfolioServiceTest {
    private lateinit var positionRepository: FakePositionRepository
    private lateinit var priceService: FakePriceService
    private lateinit var service: PortfolioService

    @BeforeEach
    fun setUp() {
        positionRepository = FakePositionRepository()
        priceService = FakePriceService()
        service = PortfolioServiceImpl(positionRepository, priceService)
    }

    @Test
    fun `returns empty portfolio when user has no positions`() {
        val result = service.getPortfolio(UUID.randomUUID())

        assertEquals(emptyList(), result.positions)
        assertEquals(BigDecimal.ZERO, result.totalValue)
    }

    @Test
    fun `calculates currentValue, pnl and pnlPercentage for a single position`() {
        val userId = UUID.randomUUID()
        priceService.price = BigDecimal("200.00")
        positionRepository.save(position(userId, "AAPL", quantity = 5, avgBuyPrice = "150.00"))

        val result = service.getPortfolio(userId)

        assertEquals(1, result.positions.size)
        val pos = result.positions[0]
        assertEquals(BigDecimal("200.00"), pos.currentPrice)
        assertEquals(0, BigDecimal("1000.00").compareTo(pos.currentValue))
        assertEquals(0, BigDecimal("250.00").compareTo(pos.pnl))
        assertEquals(0, BigDecimal("33.33").compareTo(pos.pnlPercentage))
        assertEquals(0, BigDecimal("1000.00").compareTo(result.totalValue))
    }

    @Test
    fun `accumulates totalValue across multiple positions`() {
        val userId = UUID.randomUUID()
        priceService.price = BigDecimal("100.00")
        positionRepository.save(position(userId, "AAPL", quantity = 3, avgBuyPrice = "80.00"))
        positionRepository.save(position(userId, "MSFT", quantity = 2, avgBuyPrice = "90.00"))

        val result = service.getPortfolio(userId)

        assertEquals(2, result.positions.size)
        assertEquals(0, BigDecimal("500.00").compareTo(result.totalValue))
    }

    @Test
    fun `position with null price returns null calculated fields and excludes from totalValue`() {
        val userId = UUID.randomUUID()
        priceService.price = null
        positionRepository.save(position(userId, "NOPRICE", quantity = 10, avgBuyPrice = "50.00"))

        val result = service.getPortfolio(userId)

        val pos = result.positions[0]
        assertNull(pos.currentPrice)
        assertNull(pos.currentValue)
        assertNull(pos.pnl)
        assertNull(pos.pnlPercentage)
        assertEquals(0, BigDecimal.ZERO.compareTo(result.totalValue))
    }

    @Test
    fun `isolates positions by userId`() {
        val user1 = UUID.randomUUID()
        val user2 = UUID.randomUUID()
        positionRepository.save(position(user1, "AAPL", quantity = 1, avgBuyPrice = "100.00"))
        positionRepository.save(position(user2, "MSFT", quantity = 1, avgBuyPrice = "100.00"))

        val result = service.getPortfolio(user1)

        assertEquals(1, result.positions.size)
        assertEquals("AAPL", result.positions[0].ticker)
    }

    private fun position(
        userId: UUID,
        ticker: String,
        quantity: Int,
        avgBuyPrice: String,
    ) = Position(
        id = PositionId(userId, ticker),
        quantity = quantity,
        avgBuyPrice = BigDecimal(avgBuyPrice),
    )
}
