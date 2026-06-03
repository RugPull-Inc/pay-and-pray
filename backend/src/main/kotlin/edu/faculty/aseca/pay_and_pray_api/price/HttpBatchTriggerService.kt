package edu.faculty.aseca.pay_and_pray_api.price

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate

@Service
class HttpBatchTriggerService(
    @Value("\${batch.service-url}") private val serviceUrl: String,
    private val restTemplate: RestTemplate,
) : BatchTriggerService {
    override fun trigger() {
        restTemplate.postForObject("$serviceUrl/trigger", null, Void::class.java)
    }
}
