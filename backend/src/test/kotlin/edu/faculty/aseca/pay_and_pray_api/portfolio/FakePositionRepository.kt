package edu.faculty.aseca.pay_and_pray_api.portfolio

import edu.faculty.aseca.pay_and_pray_api.portfolio.position.Position
import edu.faculty.aseca.pay_and_pray_api.portfolio.position.PositionRepository
import java.util.UUID

class FakePositionRepository : PositionRepository {
    val store = mutableListOf<Position>()

    override fun findByUserIdAndTicker(userId: UUID, ticker: String): Position? =
        store.find { it.id.userId == userId && it.id.ticker == ticker }

    override fun save(position: Position): Position =
        position.also {
            store.removeIf { it.id == position.id }
            store.add(it)
        }

    override fun delete(position: Position) {
        store.removeIf { it.id == position.id }
    }
}
