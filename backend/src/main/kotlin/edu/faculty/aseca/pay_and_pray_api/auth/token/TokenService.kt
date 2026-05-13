package edu.faculty.aseca.pay_and_pray_api.auth.token

interface TokenService {
    fun generate(userId: String): String
}