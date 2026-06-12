package edu.faculty.aseca.pay_and_pray_api.watchlist

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "watchlist_items")
data class WatchlistItem(
    @Id @GeneratedValue(strategy = GenerationType.UUID) val id: UUID? = null,
    @Column(name = "user_id") val userId: UUID,
    val ticker: String,
    @Column(name = "created_at", updatable = false) val createdAt: LocalDateTime = LocalDateTime.now(),
)
