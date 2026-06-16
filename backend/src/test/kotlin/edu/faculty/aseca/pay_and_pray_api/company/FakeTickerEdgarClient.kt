package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.edgar.CompanyConcept
import edu.faculty.aseca.pay_and_pray_api.edgar.CompanyFacts
import edu.faculty.aseca.pay_and_pray_api.edgar.CompanySubmissions
import edu.faculty.aseca.pay_and_pray_api.edgar.CompanyTicker
import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarApiException
import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarClient
import edu.faculty.aseca.pay_and_pray_api.edgar.FullTextSearchResult

class FakeTickerEdgarClient : EdgarClient {
    var tickers: Map<String, CompanyTicker> = emptyMap()
    var throwOnGetTickers = false
    var getTickersCallCount = 0

    override fun getCompanyTickers(): Map<String, CompanyTicker> {
        if (throwOnGetTickers) throw EdgarApiException("EDGAR unavailable")
        getTickersCallCount++
        return tickers
    }

    override fun getCompanySubmissions(cik: String): CompanySubmissions = throw UnsupportedOperationException()

    override fun getCompanyFacts(cik: String): CompanyFacts = throw UnsupportedOperationException()

    override fun getCompanyConcept(
        cik: String,
        concept: String,
    ): CompanyConcept = throw UnsupportedOperationException()

    override fun searchFullText(query: String): FullTextSearchResult = throw UnsupportedOperationException()
}
