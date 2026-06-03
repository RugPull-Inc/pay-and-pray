package edu.faculty.aseca.pay_and_pray_api.portfolio.position

import org.springframework.stereotype.Component
import java.util.UUID

@Component
class PositionRepositoryImpl(
    private val jpa: JpaPositionRepository,
) : PositionRepository {
    override fun findByUserIdAndTicker(
        userId: UUID,
        ticker: String,
    ): Position? = jpa.findByIdUserIdAndIdTicker(userId, ticker)

    override fun save(position: Position): Position = jpa.save(position)

    override fun delete(position: Position) = jpa.delete(position)
}
