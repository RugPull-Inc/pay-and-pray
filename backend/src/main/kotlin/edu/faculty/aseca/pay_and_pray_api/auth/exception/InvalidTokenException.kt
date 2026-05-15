package edu.faculty.aseca.pay_and_pray_api.auth.exception

class InvalidTokenException(
    cause: Throwable? = null,
) : RuntimeException("Invalid token", cause)
