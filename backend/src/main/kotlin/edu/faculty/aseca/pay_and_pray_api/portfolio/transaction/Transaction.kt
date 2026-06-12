package edu.faculty.aseca.pay_and_pray_api.portfolio.transaction

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "transactions")
data class Transaction(
    @Id @GeneratedValue(strategy = GenerationType.UUID) val id: UUID? = null,
    @Column(name = "user_id") val userId: UUID,
    val ticker: String,
    val type: String,
    val quantity: Int,
    @Column(name = "price_at_operation") val priceAtOperation: BigDecimal,
    @Column(name = "created_at", updatable = false) val createdAt: LocalDateTime = LocalDateTime.now(),
)
