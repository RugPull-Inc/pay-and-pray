package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarClient
import org.springframework.stereotype.Service

@Service
class CompanySearchService(private val edgarClient: EdgarClient) {

    fun search(query: String): CompanySearchResponse {
        val raw = edgarClient.searchFullText(query)
        val results = raw.hits.hits
            .map { hit ->
                CompanySearchResult(
                    name   = hit.source["entity_name"] as? String ?: "Unknown",
                    ticker = hit.source["ticker_symbol"] as? String,
                    cik    = hit.id.substringBefore('-').trimStart('0').ifEmpty { null }
                )
            }
            .distinctBy { it.name }
        return CompanySearchResponse(results = results, total = results.size)
    }
}
