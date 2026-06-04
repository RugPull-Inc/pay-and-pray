package edu.faculty.aseca.pay_and_pray_api.portfolio.transaction

import edu.faculty.aseca.pay_and_pray_api.portfolio.dto.TransactionResponse
import org.springframework.stereotype.Service
import java.time.ZoneOffset
import java.util.UUID

@Service
class TransactionServiceImpl(
    private val transactionRepository: TransactionRepository,
) : TransactionService {
    override fun getHistory(userId: UUID): List<TransactionResponse> =
        transactionRepository.findByUserIdOrderByCreatedAtDesc(userId).map { tx ->
            TransactionResponse(
                id = requireNotNull(tx.id),
                ticker = tx.ticker,
                type = tx.type,
                quantity = tx.quantity,
                priceAtOperation = tx.priceAtOperation,
                createdAt = tx.createdAt.toInstant(ZoneOffset.UTC),
            )
        }
}
