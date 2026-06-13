package edu.faculty.aseca.pay_and_pray_api.watchlist.compare

import edu.faculty.aseca.pay_and_pray_api.company.CompanySearchResponse
import edu.faculty.aseca.pay_and_pray_api.company.CompanyService

class FakeCompanyService : CompanyService {
    val cikByTicker = mutableMapOf<String, String>()

    override fun search(query: String): CompanySearchResponse = CompanySearchResponse(results = emptyList(), total = 0)

    override fun findCik(ticker: String): String? = cikByTicker[ticker]
}
