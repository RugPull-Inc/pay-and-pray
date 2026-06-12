package edu.faculty.aseca.pay_and_pray_api.watchlist.dto

data class WatchlistItemResponse(
    val ticker: String,
    val hasOpenPosition: Boolean,
)
