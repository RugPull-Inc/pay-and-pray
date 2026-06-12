package edu.faculty.aseca.pay_and_pray_api.portfolio.transaction

import java.util.UUID

interface TransactionRepository {
    fun save(transaction: Transaction): Transaction

    fun findByUserIdOrderByCreatedAtDesc(userId: UUID): List<Transaction>
}
