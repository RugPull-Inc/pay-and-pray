package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.edgar.CompanyTicker

/**
 * Supplies a bundled ticker -> company map used when the live EDGAR
 * `company_tickers.json` endpoint is unreachable (SEC's WAF returns 403 to
 * automated clients). Keeps company search working offline / in demos.
 */
interface CompanyTickerFallback {
    fun load(): Map<String, CompanyTicker>
}
