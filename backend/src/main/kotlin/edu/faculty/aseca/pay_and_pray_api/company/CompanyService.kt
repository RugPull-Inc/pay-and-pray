package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarClient
import org.springframework.stereotype.Service

@Service
class CompanyService(
    private val edgarClient: EdgarClient,
) {
    @Volatile
    private var cache: List<CompanySearchResult>? = null

    fun search(query: String): CompanySearchResponse {
        val tickers = cache ?: loadCache().also { cache = it }
        val q = query.trim().uppercase()
        val results =
            tickers
                .filter { r ->
                    r.ticker?.uppercase()?.startsWith(q) == true ||
                        r.name.uppercase().contains(q)
                }.take(10)
        return CompanySearchResponse(results = results, total = results.size)
    }

    private fun loadCache(): List<CompanySearchResult> =
        edgarClient.getCompanyTickers().values.map { t ->
            CompanySearchResult(
                name = t.name,
                ticker = t.ticker,
                cik = t.cikStr.toString(),
            )
        }
}