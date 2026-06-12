package edu.faculty.aseca.pay_and_pray_api.trackedticker

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "tracked_tickers")
data class TrackedTicker(
    @Id
    val ticker: String,
    @Column(nullable = false)
    val source: String,
    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),
)
