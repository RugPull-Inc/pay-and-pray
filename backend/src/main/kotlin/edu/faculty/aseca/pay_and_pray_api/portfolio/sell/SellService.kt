package edu.faculty.aseca.pay_and_pray_api.portfolio.sell

import edu.faculty.aseca.pay_and_pray_api.portfolio.dto.SellResponse
import java.util.UUID

interface SellService {
    fun sell(
        userId: UUID,
        ticker: String,
        quantity: Int,
    ): SellResponse
}
