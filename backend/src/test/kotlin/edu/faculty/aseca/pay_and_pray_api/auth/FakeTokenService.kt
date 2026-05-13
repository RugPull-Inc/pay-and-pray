package edu.faculty.aseca.pay_and_pray_api.auth

import edu.faculty.aseca.pay_and_pray_api.auth.token.TokenService

class FakeTokenService : TokenService {
    override fun generate(userId: String): String = "fake-token-for-$userId"
}