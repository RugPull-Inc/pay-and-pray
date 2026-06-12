package edu.faculty.aseca.pay_and_pray_api.portfolio.position

import java.util.UUID

interface PositionRepository {
    fun findByUserIdAndTicker(
        userId: UUID,
        ticker: String,
    ): Position?

    fun findAllByUserId(userId: UUID): List<Position>

    fun save(position: Position): Position

    fun delete(position: Position)
}
