package edu.faculty.aseca.pay_and_pray_api.price

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.http.HttpMethod
import org.springframework.test.web.client.MockRestServiceServer
import org.springframework.test.web.client.match.MockRestRequestMatchers.method
import org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo
import org.springframework.test.web.client.response.MockRestResponseCreators.withServerError
import org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess
import org.springframework.web.client.HttpServerErrorException
import org.springframework.web.client.RestTemplate

class HttpBatchTriggerServiceTest {
    private lateinit var restTemplate: RestTemplate
    private lateinit var mockServer: MockRestServiceServer
    private lateinit var service: HttpBatchTriggerService

    @BeforeEach
    fun setUp() {
        restTemplate = RestTemplate()
        mockServer = MockRestServiceServer.createServer(restTemplate)
        service = HttpBatchTriggerService("http://price-batch:8081", restTemplate)
    }

    @Test
    fun `trigger sends POST to the configured service URL`() {
        mockServer
            .expect(requestTo("http://price-batch:8081/trigger"))
            .andExpect(method(HttpMethod.POST))
            .andRespond(withSuccess())

        service.trigger()

        mockServer.verify()
    }

    @Test
    fun `trigger throws when service returns 5xx`() {
        mockServer
            .expect(requestTo("http://price-batch:8081/trigger"))
            .andRespond(withServerError())

        assertThrows<HttpServerErrorException> { service.trigger() }
    }
}
