package edu.faculty.aseca.pay_and_pray_api.trackedticker

import org.springframework.stereotype.Component

@Component
class TrackedTickerRepositoryImpl(
    private val jpa: JpaTrackedTickerRepository,
) : TrackedTickerRepository {
    override fun findByTicker(ticker: String): TrackedTicker? = jpa.findById(ticker).orElse(null)

    override fun save(trackedTicker: TrackedTicker): TrackedTicker = jpa.save(trackedTicker)
}
