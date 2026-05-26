package edu.faculty.aseca.pay_and_pray_api.price

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.Instant

@Entity
@Table(name = "prices")
data class Price(
    @Id
    val ticker: String,
    @Column(nullable = false)
    val price: BigDecimal,
    @Column(name = "fetched_at", nullable = false)
    val fetchedAt: Instant,
)
