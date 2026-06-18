package edu.faculty.aseca.pay_and_pray_api.watchlist

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface JpaWatchlistRepository : JpaRepository<WatchlistItem, UUID> {
    fun findByUserIdAndTicker(
        userId: UUID,
        ticker: String,
    ): WatchlistItem?

    fun findByUserId(userId: UUID): List<WatchlistItem>
}
