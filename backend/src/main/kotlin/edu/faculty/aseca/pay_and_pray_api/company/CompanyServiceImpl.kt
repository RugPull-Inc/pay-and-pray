package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarClient
import org.springframework.stereotype.Service

@Service
class CompanyServiceImpl(
    private val edgarClient: EdgarClient,
) : CompanyService {
    @Volatile
    private var cache: List<CompanySearchResult>? = null

    override fun search(query: String): CompanySearchResponse {
        val tickers = companyCache()
        val q = query.trim().uppercase()
        val results =
            tickers
                .filter { r ->
                    r.ticker?.uppercase()?.startsWith(q) == true ||
                        r.name.uppercase().contains(q)
                }.take(10)
        return CompanySearchResponse(results = results, total = results.size)
    }

    override fun findCik(ticker: String): String? = TODO("Not yet implemented")

    private fun companyCache(): List<CompanySearchResult> = cache ?: loadCache().also { cache = it }

    private fun loadCache(): List<CompanySearchResult> =
        edgarClient.getCompanyTickers().values.map { t ->
            CompanySearchResult(
                name = t.name,
                ticker = t.ticker,
                cik = t.cikStr.toString(),
            )
        }
}
