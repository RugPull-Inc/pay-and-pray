package edu.faculty.aseca.pay_and_pray_api.watchlist

import edu.faculty.aseca.pay_and_pray_api.watchlist.dto.WatchlistItemResponse
import java.util.UUID

interface WatchlistService {
    fun addTicker(
        userId: UUID,
        ticker: String,
    ): Boolean

    fun removeTicker(
        userId: UUID,
        ticker: String,
    )

    fun getWatchlist(userId: UUID): List<WatchlistItemResponse>
}
