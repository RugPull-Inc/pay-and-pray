package edu.faculty.aseca.pay_and_pray_api.watchlist

import org.springframework.stereotype.Component
import java.util.UUID

@Component
class WatchlistRepositoryImpl(
    private val jpa: JpaWatchlistRepository,
) : WatchlistRepository {
    override fun findByUserIdAndTicker(
        userId: UUID,
        ticker: String,
    ): WatchlistItem? = jpa.findByUserIdAndTicker(userId, ticker)

    override fun findAllByUserId(userId: UUID): List<WatchlistItem> = jpa.findByUserId(userId)

    override fun save(item: WatchlistItem): WatchlistItem = jpa.save(item)

    override fun delete(item: WatchlistItem) = jpa.delete(item)
}
