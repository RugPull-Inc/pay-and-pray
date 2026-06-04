package edu.faculty.aseca.pay_and_pray_api.trackedticker

interface TrackedTickerRepository {
    fun findByTicker(ticker: String): TrackedTicker?

    fun save(trackedTicker: TrackedTicker): TrackedTicker
}
