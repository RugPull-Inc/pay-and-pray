package edu.faculty.aseca.pay_and_pray_api.price

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "prices")
data class Price(
    @Id val ticker: String,
    val price: BigDecimal,
    @Column(name = "updated_at") val updatedAt: LocalDateTime = LocalDateTime.now(),
)
