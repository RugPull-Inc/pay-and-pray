package edu.faculty.aseca.pay_and_pray_api.auth

interface TokenService {
    fun generate(userId: String): String
}