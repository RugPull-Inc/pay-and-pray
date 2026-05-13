package edu.faculty.aseca.pay_and_pray_api.company

data class CompanySearchResult(
    val name: String,
    val ticker: String?,
    val cik: String?
)
