package edu.faculty.aseca.pay_and_pray_api.price

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.UUID

@Repository
interface JpaBatchRunRepository : JpaRepository<BatchRun, UUID> {
    @Query("SELECT MAX(b.completedAt) FROM BatchRun b WHERE b.status = 'SUCCESS'")
    fun findMaxCompletedAtSuccess(): Instant?
}
