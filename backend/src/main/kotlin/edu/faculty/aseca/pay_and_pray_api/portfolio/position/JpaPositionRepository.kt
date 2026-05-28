package edu.faculty.aseca.pay_and_pray_api.portfolio.position

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface JpaPositionRepository : JpaRepository<Position, PositionId> {
    fun findByIdUserIdAndIdTicker(
        userId: UUID,
        ticker: String,
    ): Position?
}
