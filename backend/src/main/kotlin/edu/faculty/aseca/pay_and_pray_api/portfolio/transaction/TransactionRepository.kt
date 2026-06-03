package edu.faculty.aseca.pay_and_pray_api.portfolio.transaction

interface TransactionRepository {
    fun save(transaction: Transaction): Transaction
}
