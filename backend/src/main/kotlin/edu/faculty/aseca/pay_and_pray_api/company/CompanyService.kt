package edu.faculty.aseca.pay_and_pray_api.company

interface CompanyService {
    fun search(query: String): CompanySearchResponse

    fun findCik(ticker: String): String?
}
