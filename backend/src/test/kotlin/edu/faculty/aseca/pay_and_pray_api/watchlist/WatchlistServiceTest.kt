package edu.faculty.aseca.pay_and_pray_api.watchlist

import edu.faculty.aseca.pay_and_pray_api.portfolio.position.Position
import edu.faculty.aseca.pay_and_pray_api.portfolio.position.PositionId
import edu.faculty.aseca.pay_and_pray_api.watchlist.exception.TickerNotInWatchlistException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.math.BigDecimal
import java.util.UUID

class WatchlistServiceTest {
    private lateinit var fakeWatchlistRepository: FakeWatchlistRepository
    private lateinit var fakePositionRepository: FakePositionRepository
    private lateinit var watchlistService: WatchlistService

    @BeforeEach
    fun setUp() {
        fakeWatchlistRepository = FakeWatchlistRepository()
        fakePositionRepository = FakePositionRepository()
        watchlistService = WatchlistServiceImpl(fakeWatchlistRepository, fakePositionRepository)
    }

    @Test
    fun `addTicker adds a new ticker to the watchlist`() {
        val userId = UUID.randomUUID()

        watchlistService.addTicker(userId, "AAPL")

        assertNotNull(fakeWatchlistRepository.findByUserIdAndTicker(userId, "AAPL"))
    }

    @Test
    fun `addTicker normalizes the ticker to uppercase`() {
        val userId = UUID.randomUUID()

        watchlistService.addTicker(userId, "aapl")

        assertNotNull(fakeWatchlistRepository.findByUserIdAndTicker(userId, "AAPL"))
    }

    @Test
    fun `addTicker returns true when the ticker was inserted`() {
        val userId = UUID.randomUUID()

        val wasAdded = watchlistService.addTicker(userId, "AAPL")

        assertTrue(wasAdded)
    }

    @Test
    fun `addTicker does not duplicate an already existing ticker`() {
        val userId = UUID.randomUUID()
        watchlistService.addTicker(userId, "AAPL")

        watchlistService.addTicker(userId, "AAPL")

        assertEquals(1, fakeWatchlistRepository.findAllByUserId(userId).size)
    }

    @Test
    fun `addTicker returns false when the ticker already existed`() {
        val userId = UUID.randomUUID()
        watchlistService.addTicker(userId, "AAPL")

        val wasAddedAgain = watchlistService.addTicker(userId, "AAPL")

        assertFalse(wasAddedAgain)
    }

    @Test
    fun `removeTicker removes an existing ticker from the watchlist`() {
        val userId = UUID.randomUUID()
        watchlistService.addTicker(userId, "AAPL")

        watchlistService.removeTicker(userId, "AAPL")

        assertNull(fakeWatchlistRepository.findByUserIdAndTicker(userId, "AAPL"))
    }

    @Test
    fun `removeTicker throws TickerNotInWatchlistException when ticker is not in the watchlist`() {
        val userId = UUID.randomUUID()

        assertThrows<TickerNotInWatchlistException> {
            watchlistService.removeTicker(userId, "AAPL")
        }
    }

    @Test
    fun `removeTicker throws TickerNotInWatchlistException when the ticker belongs to another user`() {
        val userId = UUID.randomUUID()
        val otherUserId = UUID.randomUUID()
        watchlistService.addTicker(otherUserId, "AAPL")

        assertThrows<TickerNotInWatchlistException> {
            watchlistService.removeTicker(userId, "AAPL")
        }
    }

    @Test
    fun `getWatchlist marks ticker as hasOpenPosition true when user has an open position`() {
        val userId = UUID.randomUUID()
        watchlistService.addTicker(userId, "AAPL")
        fakePositionRepository.save(
            Position(id = PositionId(userId, "AAPL"), quantity = 10, avgBuyPrice = BigDecimal("100.00")),
        )

        val watchlist = watchlistService.getWatchlist(userId)

        assertEquals(1, watchlist.size)
        assertEquals("AAPL", watchlist[0].ticker)
        assertTrue(watchlist[0].hasOpenPosition)
    }

    @Test
    fun `getWatchlist marks ticker as hasOpenPosition false when user has no open position`() {
        val userId = UUID.randomUUID()
        watchlistService.addTicker(userId, "AAPL")

        val watchlist = watchlistService.getWatchlist(userId)

        assertEquals(1, watchlist.size)
        assertEquals("AAPL", watchlist[0].ticker)
        assertFalse(watchlist[0].hasOpenPosition)
    }

    @Test
    fun `getWatchlist returns an empty list when the user has no items`() {
        val userId = UUID.randomUUID()

        val watchlist = watchlistService.getWatchlist(userId)

        assertTrue(watchlist.isEmpty())
    }
}
