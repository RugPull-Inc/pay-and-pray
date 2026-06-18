package edu.faculty.aseca.pay_and_pray_api.company

interface CompanyDetailsService {
    fun getDetails(cik: String): CompanyDetailsResponse
}
