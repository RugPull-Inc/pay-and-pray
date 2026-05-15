package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarClient
import edu.faculty.aseca.pay_and_pray_api.edgar.FullTextHit
import org.springframework.stereotype.Service

@Service
class CompanyService(
    private val edgarClient: EdgarClient,
) {
    fun search(query: String): CompanySearchResponse {
        val results =
            edgarClient
                .searchFullText(query)
                .hits.hits
                .map { it.toSearchResult() }
                .distinctBy { it.name }
        return CompanySearchResponse(results = results, total = results.size)
    }

    private fun FullTextHit.toSearchResult() =
        CompanySearchResult(
            name = source.entityName ?: "Unknown",
            ticker = source.tickerSymbol,
            cik = id.substringBefore('-').trimStart('0').ifEmpty { null },
        )
}
