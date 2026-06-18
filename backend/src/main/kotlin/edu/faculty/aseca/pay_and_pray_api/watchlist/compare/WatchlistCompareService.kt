package edu.faculty.aseca.pay_and_pray_api.watchlist.compare

import edu.faculty.aseca.pay_and_pray_api.watchlist.compare.dto.WatchlistCompareResponse
import java.util.UUID

interface WatchlistCompareService {
    fun compare(
        userId: UUID,
        ticker1: String,
        ticker2: String,
    ): WatchlistCompareResponse
}
