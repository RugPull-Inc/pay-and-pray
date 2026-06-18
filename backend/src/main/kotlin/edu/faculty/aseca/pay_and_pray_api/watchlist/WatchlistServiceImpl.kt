package edu.faculty.aseca.pay_and_pray_api.watchlist

import edu.faculty.aseca.pay_and_pray_api.portfolio.position.PositionRepository
import edu.faculty.aseca.pay_and_pray_api.watchlist.dto.WatchlistItemResponse
import edu.faculty.aseca.pay_and_pray_api.watchlist.exception.TickerNotInWatchlistException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.Locale
import java.util.UUID

@Service
@Transactional
class WatchlistServiceImpl(
    private val watchlistRepository: WatchlistRepository,
    private val positionRepository: PositionRepository,
) : WatchlistService {
    override fun addTicker(
        userId: UUID,
        ticker: String,
    ): Boolean {
        val normalizedTicker = ticker.trim().uppercase(Locale.US)

        if (watchlistRepository.findByUserIdAndTicker(userId, normalizedTicker) != null) {
            return false
        }

        watchlistRepository.save(WatchlistItem(userId = userId, ticker = normalizedTicker))
        return true
    }

    override fun removeTicker(
        userId: UUID,
        ticker: String,
    ) {
        val normalizedTicker = ticker.trim().uppercase(Locale.US)
        val item =
            watchlistRepository.findByUserIdAndTicker(userId, normalizedTicker)
                ?: throw TickerNotInWatchlistException()

        watchlistRepository.delete(item)
    }

    override fun getWatchlist(userId: UUID): List<WatchlistItemResponse> =
        watchlistRepository.findAllByUserId(userId).map { item ->
            WatchlistItemResponse(
                ticker = item.ticker,
                hasOpenPosition = positionRepository.findByUserIdAndTicker(userId, item.ticker) != null,
            )
        }
}
