package edu.faculty.aseca.pay_and_pray_api.portfolio.transaction

import edu.faculty.aseca.pay_and_pray_api.portfolio.FakeTransactionRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class TransactionServiceTest {
    private lateinit var fakeTransactionRepository: FakeTransactionRepository
    private lateinit var transactionService: TransactionService

    @BeforeEach
    fun setUp() {
        fakeTransactionRepository = FakeTransactionRepository()
        transactionService = TransactionServiceImpl(fakeTransactionRepository)
    }

    private fun seed(
        userId: UUID,
        ticker: String,
        type: String,
        createdAt: LocalDateTime,
    ) {
        fakeTransactionRepository.store.add(
            Transaction(
                id = UUID.randomUUID(),
                userId = userId,
                ticker = ticker,
                type = type,
                quantity = 10,
                priceAtOperation = BigDecimal("100.00"),
                createdAt = createdAt,
            ),
        )
    }

    @Test
    fun `getHistory returns transactions ordered by createdAt descending`() {
        val userId = UUID.randomUUID()
        seed(userId, "AAPL", "BUY", LocalDateTime.of(2026, 6, 2, 10, 0))
        seed(userId, "AAPL", "SELL", LocalDateTime.of(2026, 6, 2, 11, 0))
        seed(userId, "MSFT", "BUY", LocalDateTime.of(2026, 6, 1, 9, 0))

        val history = transactionService.getHistory(userId)

        assertEquals(3, history.size)
        assertEquals("SELL", history[0].type)
        assertEquals("AAPL", history[1].ticker)
        assertEquals("MSFT", history[2].ticker)
    }

    @Test
    fun `getHistory returns empty list when user has no transactions`() {
        val history = transactionService.getHistory(UUID.randomUUID())

        assertTrue(history.isEmpty())
    }

    @Test
    fun `getHistory only returns transactions of the given user`() {
        val userId = UUID.randomUUID()
        val otherUserId = UUID.randomUUID()
        seed(userId, "AAPL", "BUY", LocalDateTime.of(2026, 6, 2, 10, 0))
        seed(otherUserId, "TSLA", "BUY", LocalDateTime.of(2026, 6, 2, 12, 0))

        val history = transactionService.getHistory(userId)

        assertEquals(1, history.size)
        assertEquals("AAPL", history[0].ticker)
    }

    @Test
    fun `getHistory maps createdAt to UTC instant`() {
        val userId = UUID.randomUUID()
        seed(userId, "AAPL", "BUY", LocalDateTime.of(2026, 6, 2, 11, 0))

        val history = transactionService.getHistory(userId)

        assertEquals(Instant.parse("2026-06-02T11:00:00Z"), history[0].createdAt)
        assertEquals(
            LocalDateTime.of(2026, 6, 2, 11, 0).toInstant(ZoneOffset.UTC),
            history[0].createdAt,
        )
    }
}
