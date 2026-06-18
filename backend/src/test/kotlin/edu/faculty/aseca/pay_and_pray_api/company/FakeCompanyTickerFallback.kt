package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.edgar.CompanyTicker

class FakeCompanyTickerFallback(
    private val tickers: Map<String, CompanyTicker> = emptyMap(),
) : CompanyTickerFallback {
    var loadCallCount = 0

    override fun load(): Map<String, CompanyTicker> {
        loadCallCount++
        return tickers
    }
}
