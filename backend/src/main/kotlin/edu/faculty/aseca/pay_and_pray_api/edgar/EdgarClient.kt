package edu.faculty.aseca.pay_and_pray_api.edgar

interface EdgarClient {
    fun getCompanySubmissions(cik: String): CompanySubmissions

    fun getCompanyFacts(cik: String): CompanyFacts

    fun getCompanyConcept(
        cik: String,
        concept: String,
    ): CompanyConcept

    fun searchFullText(query: String): FullTextSearchResult

    fun getCompanyTickers(): Map<String, CompanyTicker>
}
