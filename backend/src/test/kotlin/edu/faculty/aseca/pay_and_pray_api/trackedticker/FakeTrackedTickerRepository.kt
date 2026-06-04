package edu.faculty.aseca.pay_and_pray_api.trackedticker

class FakeTrackedTickerRepository : TrackedTickerRepository {
    val store = linkedMapOf<String, TrackedTicker>()

    override fun findByTicker(ticker: String): TrackedTicker? = store[ticker]

    override fun save(trackedTicker: TrackedTicker): TrackedTicker = trackedTicker.also { store[it.ticker] = it }
}
