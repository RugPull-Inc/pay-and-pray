package edu.faculty.aseca.pay_and_pray_api.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.client.RestTemplate

@Configuration
class BatchConfig {
    @Bean
    fun batchRestTemplate(): RestTemplate = RestTemplate()
}
