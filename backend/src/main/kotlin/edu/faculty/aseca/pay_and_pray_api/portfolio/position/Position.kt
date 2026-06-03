package edu.faculty.aseca.pay_and_pray_api.portfolio.position

import jakarta.persistence.AttributeOverride
import jakarta.persistence.AttributeOverrides
import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.Table
import java.io.Serializable
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

@Embeddable
data class PositionId(
    val userId: UUID,
    val ticker: String,
) : Serializable

@Entity
@Table(name = "positions")
data class Position(
    @EmbeddedId
    @AttributeOverrides(
        AttributeOverride(name = "userId", column = Column(name = "user_id")),
        AttributeOverride(name = "ticker", column = Column(name = "ticker")),
    )
    val id: PositionId,
    val quantity: Int,
    @Column(name = "avg_buy_price") val avgBuyPrice: BigDecimal,
    @Column(name = "created_at", updatable = false) val createdAt: LocalDateTime = LocalDateTime.now(),
    @Column(name = "updated_at") val updatedAt: LocalDateTime = LocalDateTime.now(),
)
