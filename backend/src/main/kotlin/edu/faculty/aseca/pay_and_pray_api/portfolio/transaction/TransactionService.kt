package edu.faculty.aseca.pay_and_pray_api.portfolio.transaction

import edu.faculty.aseca.pay_and_pray_api.portfolio.dto.TransactionResponse
import java.util.UUID

interface TransactionService {
    fun getHistory(userId: UUID): List<TransactionResponse>
}
