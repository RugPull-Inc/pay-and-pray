package edu.faculty.aseca.pay_and_pray_api.company

import org.springframework.stereotype.Service

@Service
class CompanyService(
    private val tickerCache: CompanyTickerCache,
) {
    fun search(query: String): CompanySearchResponse {
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
}
