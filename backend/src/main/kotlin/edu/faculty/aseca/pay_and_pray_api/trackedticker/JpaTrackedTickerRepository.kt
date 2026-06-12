package edu.faculty.aseca.pay_and_pray_api.trackedticker

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface JpaTrackedTickerRepository : JpaRepository<TrackedTicker, String>
