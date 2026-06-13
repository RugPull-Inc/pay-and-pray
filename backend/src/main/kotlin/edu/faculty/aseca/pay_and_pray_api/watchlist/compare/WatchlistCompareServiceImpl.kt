package edu.faculty.aseca.pay_and_pray_api.watchlist.compare

import edu.faculty.aseca.pay_and_pray_api.company.CompanyDetailsService
import edu.faculty.aseca.pay_and_pray_api.company.CompanyService
import edu.faculty.aseca.pay_and_pray_api.price.PriceService
import edu.faculty.aseca.pay_and_pray_api.watchlist.WatchlistRepository
import edu.faculty.aseca.pay_and_pray_api.watchlist.compare.dto.WatchlistCompareResponse
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class WatchlistCompareServiceImpl(
    private val watchlistRepository: WatchlistRepository,
    private val companyService: CompanyService,
    private val companyDetailsService: CompanyDetailsService,
    private val priceService: PriceService,
) : WatchlistCompareService {
    override fun compare(
        userId: UUID,
        ticker1: String,
        ticker2: String,
    ): WatchlistCompareResponse = TODO("Not yet implemented")
}
