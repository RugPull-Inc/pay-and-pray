package edu.faculty.aseca.pay_and_pray_api.portfolio.buy

import edu.faculty.aseca.pay_and_pray_api.portfolio.FakePositionRepository
import edu.faculty.aseca.pay_and_pray_api.portfolio.FakePriceService
import edu.faculty.aseca.pay_and_pray_api.portfolio.FakeTransactionRepository
import edu.faculty.aseca.pay_and_pray_api.portfolio.exception.TickerNotFoundException
import edu.faculty.aseca.pay_and_pray_api.portfolio.position.Position
import edu.faculty.aseca.pay_and_pray_api.portfolio.position.PositionId
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.math.BigDecimal
import java.util.UUID

class BuyServiceTest {
    private lateinit var fakePriceService: FakePriceService
    private lateinit var fakePositionRepository: FakePositionRepository
    private lateinit var fakeTransactionRepository: FakeTransactionRepository
    private lateinit var buyService: BuyService

    @BeforeEach
    fun setUp() {
        fakePriceService = FakePriceService()
        fakePositionRepository = FakePositionRepository()
        fakeTransactionRepository = FakeTransactionRepository()
        buyService = BuyServiceImpl(fakePriceService, fakePositionRepository, fakeTransactionRepository)
    }

    @Test
    fun `buy creates a new position when none exists`() {
        val userId = UUID.randomUUID()
        fakePriceService.price = BigDecimal("100.00")

        buyService.buy(userId, "AAPL", 10)

        val position = fakePositionRepository.findByUserIdAndTicker(userId, "AAPL")
        assertNotNull(position)
        assertEquals(10, position!!.quantity)
        assertEquals(BigDecimal("100.00"), position.avgBuyPrice)
    }

    @Test
    fun `buy updates quantity and weighted average on existing position`() {
        val userId = UUID.randomUUID()
        fakePositionRepository.save(
            Position(id = PositionId(userId, "AAPL"), quantity = 10, avgBuyPrice = BigDecimal("100.00")),
        )
        fakePriceService.price = BigDecimal("120.00")

        buyService.buy(userId, "AAPL", 10)

        val position = fakePositionRepository.findByUserIdAndTicker(userId, "AAPL")!!
        assertEquals(20, position.quantity)
        assertEquals(BigDecimal("110.0000"), position.avgBuyPrice)
    }

    @Test
    fun `buy records a BUY transaction`() {
        val userId = UUID.randomUUID()
        fakePriceService.price = BigDecimal("50.00")

        buyService.buy(userId, "TSLA", 5)

        assertEquals(1, fakeTransactionRepository.store.size)
        val tx = fakeTransactionRepository.store.first()
        assertEquals("BUY", tx.type)
        assertEquals("TSLA", tx.ticker)
        assertEquals(5, tx.quantity)
        assertEquals(BigDecimal("50.00"), tx.priceAtOperation)
    }

    @Test
    fun `buy throws TickerNotFoundException when price is null`() {
        fakePriceService.price = null

        assertThrows<TickerNotFoundException> {
            buyService.buy(UUID.randomUUID(), "UNKNOWN", 1)
        }
    }

    @Test
    fun `buy returns correct response fields`() {
        val userId = UUID.randomUUID()
        fakePriceService.price = BigDecimal("200.00")

        val response = buyService.buy(userId, "MSFT", 3)

        assertEquals("MSFT", response.ticker)
        assertEquals(3, response.quantity)
        assertEquals(BigDecimal("200.00"), response.priceAtOperation)
        assertEquals(3, response.newQuantity)
        assertEquals(BigDecimal("200.00"), response.newAvgBuyPrice)
    }
}
