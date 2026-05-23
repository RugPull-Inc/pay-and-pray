package edu.faculty.aseca.pay_and_pray_api.company

data class CompanySearchResponse(
    val results: List<CompanySearchResult>,
    val total: Int,
)
