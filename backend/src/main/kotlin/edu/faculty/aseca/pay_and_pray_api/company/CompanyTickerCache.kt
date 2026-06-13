package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarClient
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Component

@Component
class CompanyTickerCache(
    private val edgarClient: EdgarClient,
) {
    @Cacheable(CacheConfig.COMPANY_TICKERS_CACHE)
    fun getTickers(): List<CompanySearchResult> =
        edgarClient.getCompanyTickers().values.map { t ->
            CompanySearchResult(
                name = t.name,
                ticker = t.ticker,
                cik = t.cikStr.toString(),
            )
        }
}
