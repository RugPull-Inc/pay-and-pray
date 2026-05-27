package edu.faculty.aseca.pay_and_pray_api.portfolio.buy

import edu.faculty.aseca.pay_and_pray_api.portfolio.dto.BuyResponse
import java.util.UUID

interface BuyService {
    fun buy(userId: UUID, ticker: String, quantity: Int): BuyResponse
}
