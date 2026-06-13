package edu.faculty.aseca.pay_and_pray_api.watchlist.compare

import edu.faculty.aseca.pay_and_pray_api.company.CompanyDetailsResponse
import edu.faculty.aseca.pay_and_pray_api.company.CompanyDetailsService
import edu.faculty.aseca.pay_and_pray_api.company.CompanyMetrics
import edu.faculty.aseca.pay_and_pray_api.company.CompanyService
import edu.faculty.aseca.pay_and_pray_api.company.MetricDataPoint
import edu.faculty.aseca.pay_and_pray_api.price.PriceService
import edu.faculty.aseca.pay_and_pray_api.watchlist.WatchlistRepository
import edu.faculty.aseca.pay_and_pray_api.watchlist.compare.dto.CompanyComparisonResponse
import edu.faculty.aseca.pay_and_pray_api.watchlist.compare.dto.WatchlistCompareResponse
import edu.faculty.aseca.pay_and_pray_api.watchlist.exception.TickerNotInWatchlistException
import org.springframework.stereotype.Service
import java.math.BigDecimal
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
    ): WatchlistCompareResponse {
        val normalizedTicker1 = ticker1.uppercase()
        val normalizedTicker2 = ticker2.uppercase()

        requireInWatchlist(userId, normalizedTicker1)
        requireInWatchlist(userId, normalizedTicker2)

        return WatchlistCompareResponse(
            company1 = buildComparison(normalizedTicker1),
            company2 = buildComparison(normalizedTicker2),
        )
    }

    private fun requireInWatchlist(
        userId: UUID,
        ticker: String,
    ) {
        watchlistRepository.findByUserIdAndTicker(userId, ticker) ?: throw TickerNotInWatchlistException()
    }

    private fun buildComparison(ticker: String): CompanyComparisonResponse {
        val details = companyService.findCik(ticker)?.let { companyDetailsService.getDetails(it) }
        val currentPrice = priceService.getLatestPrice(ticker)
        val sharesOutstanding = details.latestValueOf { it.sharesOutstanding }

        return CompanyComparisonResponse(
            ticker = ticker,
            currentPrice = currentPrice,
            marketCap = marketCap(currentPrice, sharesOutstanding),
            revenueQuarterly = details.latestValueOf { it.revenue },
            netIncomeQuarterly = details.latestValueOf { it.netIncome },
            epsQuarterly = details.latestValueOf { it.eps },
            totalAssets = details.latestValueOf { it.totalAssets },
            totalLiabilities = details.latestValueOf { it.totalLiabilities },
            lastFiling = details?.recentFilings?.firstOrNull(),
            priceLastUpdatedAt = priceService.getLatestPriceUpdatedAt(ticker),
        )
    }

    private fun CompanyDetailsResponse?.latestValueOf(metric: (CompanyMetrics) -> List<MetricDataPoint>): Double? =
        this
            ?.metrics
            ?.let(metric)
            ?.firstOrNull()
            ?.value

    private fun marketCap(
        currentPrice: BigDecimal?,
        sharesOutstanding: Double?,
    ): BigDecimal? {
        if (currentPrice == null || sharesOutstanding == null) return null
        return currentPrice.multiply(BigDecimal.valueOf(sharesOutstanding))
    }
}
