package edu.faculty.aseca.pay_and_pray_api.watchlist.compare

import edu.faculty.aseca.pay_and_pray_api.company.CompanyDetailsResponse
import edu.faculty.aseca.pay_and_pray_api.company.CompanyDetailsService

class FakeCompanyDetailsService : CompanyDetailsService {
    val detailsByCik = mutableMapOf<String, CompanyDetailsResponse>()

    override fun getDetails(cik: String): CompanyDetailsResponse =
        detailsByCik[cik] ?: throw NoSuchElementException("No details for cik $cik")
}
