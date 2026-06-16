package edu.faculty.aseca.pay_and_pray_api.company

import org.springframework.stereotype.Service

@Service
class CompanyServiceImpl(
    private val tickerCache: CompanyTickerCache,
) : CompanyService {
    override fun search(query: String): CompanySearchResponse {
        val tickers = tickerCache.getTickers()
        val q = query.trim().uppercase()
        val results =
            tickers
                .filter { r ->
                    r.ticker?.uppercase()?.startsWith(q) == true ||
                        r.name.uppercase().contains(q)
                }.take(10)
        return CompanySearchResponse(results = results, total = results.size)
    }

    override fun findCik(ticker: String): String? =
        tickerCache.getTickers().firstOrNull { it.ticker?.uppercase() == ticker.uppercase() }?.cik
}
