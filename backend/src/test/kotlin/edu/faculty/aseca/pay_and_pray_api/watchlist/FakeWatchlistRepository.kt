package edu.faculty.aseca.pay_and_pray_api.watchlist

import java.util.UUID

class FakeWatchlistRepository : WatchlistRepository {
    val store = mutableListOf<WatchlistItem>()

    override fun findByUserIdAndTicker(
        userId: UUID,
        ticker: String,
    ): WatchlistItem? = store.find { it.userId == userId && it.ticker == ticker }

    override fun findAllByUserId(userId: UUID): List<WatchlistItem> = store.filter { it.userId == userId }

    override fun save(item: WatchlistItem): WatchlistItem =
        item.also {
            store.removeIf { it.userId == item.userId && it.ticker == item.ticker }
            store.add(it)
        }

    override fun delete(item: WatchlistItem) {
        store.removeIf { it.userId == item.userId && it.ticker == item.ticker }
    }
}
