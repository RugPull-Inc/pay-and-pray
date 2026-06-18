package edu.faculty.aseca.pay_and_pray_api.watchlist

import java.util.UUID

interface WatchlistRepository {
    fun findByUserIdAndTicker(
        userId: UUID,
        ticker: String,
    ): WatchlistItem?

    fun findAllByUserId(userId: UUID): List<WatchlistItem>

    fun save(item: WatchlistItem): WatchlistItem

    fun delete(item: WatchlistItem)
}
