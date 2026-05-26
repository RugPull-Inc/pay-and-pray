package edu.faculty.aseca.pay_and_pray_api.auth.filter

import edu.faculty.aseca.pay_and_pray_api.auth.exception.InvalidTokenException
import edu.faculty.aseca.pay_and_pray_api.auth.token.TokenService
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthFilter(
    private val tokenService: TokenService,
) : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        chain: FilterChain,
    ) {
        val header = request.getHeader("Authorization")
        if (header != null && header.startsWith("Bearer ")) {
            val token = header.removePrefix("Bearer ")
            try {
                val userId = tokenService.getUserId(token)
                SecurityContextHolder.getContext().authentication =
                    UsernamePasswordAuthenticationToken(userId, null, emptyList())
            } catch (_: InvalidTokenException) {
                // Leave SecurityContext unauthenticated; the security chain
                // will reject protected requests with 401.
            }
        }
        chain.doFilter(request, response)
    }
}
