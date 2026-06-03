package edu.faculty.aseca.pay_and_pray_api.portfolio

import edu.faculty.aseca.pay_and_pray_api.portfolio.transaction.Transaction
import edu.faculty.aseca.pay_and_pray_api.portfolio.transaction.TransactionRepository
import java.util.UUID

class FakeTransactionRepository : TransactionRepository {
    val store = mutableListOf<Transaction>()

    override fun save(transaction: Transaction): Transaction =
        transaction.copy(id = UUID.randomUUID()).also { store.add(it) }
}
