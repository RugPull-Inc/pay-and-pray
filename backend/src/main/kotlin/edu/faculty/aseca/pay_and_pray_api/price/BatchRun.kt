package edu.faculty.aseca.pay_and_pray_api.price

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "batch_runs")
data class BatchRun(
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,
    @Column(name = "started_at", nullable = false)
    val startedAt: Instant,
    @Column(name = "completed_at")
    val completedAt: Instant? = null,
    @Column(nullable = false)
    val status: String,
    @Column(name = "error_summary")
    val errorSummary: String? = null,
)
