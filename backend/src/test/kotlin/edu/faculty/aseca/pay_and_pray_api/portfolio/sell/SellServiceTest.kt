package edu.faculty.aseca.pay_and_pray_api.portfolio.sell

import edu.faculty.aseca.pay_and_pray_api.portfolio.FakePositionRepository
import edu.faculty.aseca.pay_and_pray_api.portfolio.FakePriceService
import edu.faculty.aseca.pay_and_pray_api.portfolio.FakeTransactionRepository
import edu.faculty.aseca.pay_and_pray_api.portfolio.exception.InsufficientQuantityException
import edu.faculty.aseca.pay_and_pray_api.portfolio.exception.NoPositionException
import edu.faculty.aseca.pay_and_pray_api.portfolio.exception.TickerNotFoundException
import edu.faculty.aseca.pay_and_pray_api.portfolio.position.Position
import edu.faculty.aseca.pay_and_pray_api.portfolio.position.PositionId
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.math.BigDecimal
import java.util.UUID

class SellServiceTest {
    private lateinit var fakePriceService: FakePriceService
    private lateinit var fakePositionRepository: FakePositionRepository
    private lateinit var fakeTransactionRepository: FakeTransactionRepository
    private lateinit var sellService: SellService

    @BeforeEach
    fun setUp() {
        fakePriceService = FakePriceService()
        fakePositionRepository = FakePositionRepository()
        fakeTransactionRepository = FakeTransactionRepository()
        sellService = SellServiceImpl(fakePriceService, fakePositionRepository, fakeTransactionRepository)
    }

    @Test
    fun `sell reduces position quantity on partial sell`() {
        val userId = UUID.randomUUID()
        fakePositionRepository.save(
            Position(id = PositionId(userId, "AAPL"), quantity = 10, avgBuyPrice = BigDecimal("100.00")),
        )
        fakePriceService.price = BigDecimal("110.00")

        sellService.sell(userId, "AAPL", 4)

        val position = fakePositionRepository.findByUserIdAndTicker(userId, "AAPL")!!
        assertEquals(6, position.quantity)
    }

    @Test
    fun `sell deletes position when all units are sold`() {
        val userId = UUID.randomUUID()
        fakePositionRepository.save(
            Position(id = PositionId(userId, "AAPL"), quantity = 5, avgBuyPrice = BigDecimal("100.00")),
        )
        fakePriceService.price = BigDecimal("110.00")

        sellService.sell(userId, "AAPL", 5)

        assertNull(fakePositionRepository.findByUserIdAndTicker(userId, "AAPL"))
    }

    @Test
    fun `sell records a SELL transaction`() {
        val userId = UUID.randomUUID()
        fakePositionRepository.save(
            Position(id = PositionId(userId, "TSLA"), quantity = 8, avgBuyPrice = BigDecimal("200.00")),
        )
        fakePriceService.price = BigDecimal("220.00")

        sellService.sell(userId, "TSLA", 3)

        assertEquals(1, fakeTransactionRepository.store.size)
        val tx = fakeTransactionRepository.store.first()
        assertEquals("SELL", tx.type)
        assertEquals("TSLA", tx.ticker)
        assertEquals(3, tx.quantity)
        assertEquals(BigDecimal("220.00"), tx.priceAtOperation)
    }

    @Test
    fun `sell throws TickerNotFoundException when price is null`() {
        fakePriceService.price = null

        assertThrows<TickerNotFoundException> {
            sellService.sell(UUID.randomUUID(), "UNKNOWN", 1)
        }
    }

    @Test
    fun `sell throws NoPositionException when user has no position`() {
        fakePriceService.price = BigDecimal("100.00")

        assertThrows<NoPositionException> {
            sellService.sell(UUID.randomUUID(), "AAPL", 1)
        }
    }

    @Test
    fun `sell throws InsufficientQuantityException when selling more than owned`() {
        val userId = UUID.randomUUID()
        fakePositionRepository.save(
            Position(id = PositionId(userId, "AAPL"), quantity = 3, avgBuyPrice = BigDecimal("100.00")),
        )
        fakePriceService.price = BigDecimal("100.00")

        assertThrows<InsufficientQuantityException> {
            sellService.sell(userId, "AAPL", 5)
        }
    }

    @Test
    fun `sell returns correct response fields`() {
        val userId = UUID.randomUUID()
        fakePositionRepository.save(
            Position(id = PositionId(userId, "MSFT"), quantity = 10, avgBuyPrice = BigDecimal("300.00")),
        )
        fakePriceService.price = BigDecimal("350.00")

        val response = sellService.sell(userId, "MSFT", 4)

        assertEquals("MSFT", response.ticker)
        assertEquals(4, response.quantity)
        assertEquals(BigDecimal("350.00"), response.priceAtOperation)
        assertEquals(6, response.remainingQuantity)
    }
}
