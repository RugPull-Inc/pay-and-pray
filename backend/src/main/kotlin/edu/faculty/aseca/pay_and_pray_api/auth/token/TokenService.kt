package edu.faculty.aseca.pay_and_pray_api.auth.token

interface TokenService {
    fun generate(userId: String): String

    /**
     * Returns the userId encoded in [token]. Throws
     * [edu.faculty.aseca.pay_and_pray_api.auth.exception.InvalidTokenException]
     * if the token is malformed, expired, or its signature does not verify.
     */
    fun getUserId(token: String): String
}
