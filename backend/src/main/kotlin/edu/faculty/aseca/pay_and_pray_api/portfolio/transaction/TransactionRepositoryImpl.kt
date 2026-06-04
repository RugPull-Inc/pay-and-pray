package edu.faculty.aseca.pay_and_pray_api.portfolio.transaction

import org.springframework.stereotype.Component
import java.util.UUID

@Component
class TransactionRepositoryImpl(
    private val jpa: JpaTransactionRepository,
) : TransactionRepository {
    override fun save(transaction: Transaction): Transaction = jpa.save(transaction)

    override fun findByUserIdOrderByCreatedAtDesc(userId: UUID): List<Transaction> =
        jpa.findByUserIdOrderByCreatedAtDesc(userId)
}
