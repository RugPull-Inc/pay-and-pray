package edu.faculty.aseca.pay_and_pray_api.price

import org.springframework.stereotype.Repository
import java.time.Instant

@Repository
class BatchRunRepositoryImpl(
    private val jpaRepo: JpaBatchRunRepository,
) : BatchRunRepository {
    override fun findTopSuccessCompletedAt(): Instant? = jpaRepo.findMaxCompletedAtSuccess()
}
