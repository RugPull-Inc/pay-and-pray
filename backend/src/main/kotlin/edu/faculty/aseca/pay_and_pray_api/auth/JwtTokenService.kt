package edu.faculty.aseca.pay_and_pray_api.auth

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.Date

@Service
class JwtTokenService(
    @Value("\${jwt.secret}") private val secret: String,
    @Value("\${jwt.expiration-ms}") private val expirationMs: Long
) : TokenService {

    private val key by lazy { Keys.hmacShaKeyFor(secret.toByteArray()) }

    override fun generate(userId: String): String = Jwts.builder()
        .subject(userId)
        .issuedAt(Date())
        .expiration(Date(System.currentTimeMillis() + expirationMs))
        .signWith(key)
        .compact()
}