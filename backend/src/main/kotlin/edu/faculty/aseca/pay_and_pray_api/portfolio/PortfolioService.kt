package edu.faculty.aseca.pay_and_pray_api.portfolio

import edu.faculty.aseca.pay_and_pray_api.portfolio.dto.PortfolioView
import java.util.UUID

interface PortfolioService {
    fun getPortfolio(userId: UUID): PortfolioView
}
