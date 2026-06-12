package edu.faculty.aseca.pay_and_pray_api.price

import java.time.Instant

interface BatchRunRepository {
    fun findTopSuccessCompletedAt(): Instant?
}
