package edu.faculty.aseca.pay_and_pray_api.watchlist.exception

class CompanyDataNotFoundException(
    ticker: String,
) : RuntimeException("No encontramos datos para $ticker")
