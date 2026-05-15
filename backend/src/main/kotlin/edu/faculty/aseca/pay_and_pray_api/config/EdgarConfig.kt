package edu.faculty.aseca.pay_and_pray_api.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.client.ClientHttpRequestInterceptor
import org.springframework.web.client.RestTemplate

@Configuration
class EdgarConfig {
    @Bean
    fun edgarRestTemplate(
        @Value("\${edgar.user-agent}") userAgent: String,
    ): RestTemplate =
        RestTemplate().apply {
            interceptors =
                listOf(
                    ClientHttpRequestInterceptor { request, body, execution ->
                        request.headers.set("User-Agent", userAgent)
                        execution.execute(request, body)
                    },
                )
        }
}
