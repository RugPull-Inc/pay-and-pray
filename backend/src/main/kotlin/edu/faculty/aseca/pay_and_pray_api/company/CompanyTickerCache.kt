package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.edgar.CompanyTicker
import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarApiException
import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarClient
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Component

@Component
class CompanyTickerCache(
    private val edgarClient: EdgarClient,
    private val fallback: CompanyTickerFallback,
    @Value("\${edgar.tickers-fallback.enabled:false}") private val fallbackEnabled: Boolean,
) {
    private val logger = LoggerFactory.getLogger(CompanyTickerCache::class.java)

    @Cacheable(CacheConfig.COMPANY_TICKERS_CACHE)
    fun getTickers(): List<CompanySearchResult> =
        loadTickers().values.map { t ->
            CompanySearchResult(
                name = t.name,
                ticker = t.ticker,
                cik = t.cikStr.toString(),
            )
        }

    private fun loadTickers(): Map<String, CompanyTicker> =
        try {
            edgarClient.getCompanyTickers()
        } catch (e: EdgarApiException) {
            if (!fallbackEnabled) throw e
            logger.warn("EDGAR company tickers unavailable ({}); using bundled fallback", e.message)
            fallback.load()
        }
}
