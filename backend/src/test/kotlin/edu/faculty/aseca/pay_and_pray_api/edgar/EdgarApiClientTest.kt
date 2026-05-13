package edu.faculty.aseca.pay_and_pray_api.edgar

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.client.ClientHttpRequestInterceptor
import org.springframework.test.web.client.MockRestServiceServer
import org.springframework.test.web.client.match.MockRestRequestMatchers.*
import org.springframework.test.web.client.response.MockRestResponseCreators.*
import org.springframework.web.client.RestTemplate
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class EdgarApiClientTest {

    private lateinit var mockServer: MockRestServiceServer
    private lateinit var client: EdgarApiClient

    private val testUserAgent = "PayAndPray/1.0 test@test.com"

    @BeforeEach
    fun setUp() {
        val restTemplate = RestTemplate().apply {
            interceptors = mutableListOf(ClientHttpRequestInterceptor { request, body, execution ->
                request.headers.set("User-Agent", testUserAgent)
                execution.execute(request, body)
            })
        }
        mockServer = MockRestServiceServer.createServer(restTemplate)
        client = EdgarApiClient(restTemplate, testUserAgent)
    }

    @Test
    fun `getCompanySubmissions pads cik to 10 digits and returns parsed response`() {
        mockServer.expect(requestTo("https://data.sec.gov/submissions/CIK0000320193.json"))
            .andExpect(method(HttpMethod.GET))
            .andRespond(
                withSuccess(
                    """{"cik":"0000320193","name":"Apple Inc.","tickers":["AAPL"],"exchanges":["Nasdaq"]}""",
                    MediaType.APPLICATION_JSON
                )
            )

        val result = client.getCompanySubmissions("320193")

        assertEquals("0000320193", result.cik)
        assertEquals("Apple Inc.", result.name)
        assertEquals(listOf("AAPL"), result.tickers)
        mockServer.verify()
    }

    @Test
    fun `getCompanyFacts returns parsed response`() {
        mockServer.expect(requestTo("https://data.sec.gov/api/xbrl/companyfacts/CIK0000320193.json"))
            .andRespond(
                withSuccess(
                    """{"cik":"0000320193","entityName":"Apple Inc.","facts":{}}""",
                    MediaType.APPLICATION_JSON
                )
            )

        val result = client.getCompanyFacts("320193")

        assertEquals("0000320193", result.cik)
        assertEquals("Apple Inc.", result.entityName)
        mockServer.verify()
    }

    @Test
    fun `getCompanyConcept includes concept in url`() {
        mockServer.expect(requestTo("https://data.sec.gov/api/xbrl/companyconcept/CIK0000320193/us-gaap/Revenues.json"))
            .andRespond(
                withSuccess(
                    """{"cik":"0000320193","entityName":"Apple Inc.","tag":"Revenues","units":{}}""",
                    MediaType.APPLICATION_JSON
                )
            )

        val result = client.getCompanyConcept("320193", "Revenues")

        assertEquals("Revenues", result.tag)
        mockServer.verify()
    }

    @Test
    fun `searchFullText encodes query and returns hits`() {
        mockServer.expect(requestTo("https://efts.sec.gov/LATEST/search-index?q=Apple+Inc&forms=10-K"))
            .andRespond(
                withSuccess(
                    """{"hits":{"total":{"value":1,"relation":"eq"},"hits":[{"_id":"abc","_source":{}}]}}""",
                    MediaType.APPLICATION_JSON
                )
            )

        val result = client.searchFullText("Apple Inc")

        assertEquals(1, result.hits.total.value)
        assertEquals(1, result.hits.hits.size)
        mockServer.verify()
    }

    @Test
    fun `getCompanyTickers parses ordinal-keyed map`() {
        mockServer.expect(requestTo("https://www.sec.gov/files/company_tickers.json"))
            .andRespond(
                withSuccess(
                    """{"0":{"cik_str":320193,"name":"Apple Inc.","ticker":"AAPL","exchange":"Nasdaq"}}""",
                    MediaType.APPLICATION_JSON
                )
            )

        val result = client.getCompanyTickers()

        assertNotNull(result["0"])
        assertEquals("AAPL", result["0"]?.ticker)
        mockServer.verify()
    }

    @Test
    fun `http error wraps in EdgarApiException`() {
        mockServer.expect(requestTo("https://data.sec.gov/submissions/CIK0000000001.json"))
            .andRespond(withStatus(HttpStatus.NOT_FOUND))

        assertThrows<EdgarApiException> {
            client.getCompanySubmissions("1")
        }
        mockServer.verify()
    }

    @Test
    fun `cik with leading zeros is not double-padded`() {
        mockServer.expect(requestTo("https://data.sec.gov/submissions/CIK0000320193.json"))
            .andRespond(
                withSuccess(
                    """{"cik":"0000320193","name":"Apple Inc.","tickers":[],"exchanges":[]}""",
                    MediaType.APPLICATION_JSON
                )
            )

        client.getCompanySubmissions("0000320193")
        mockServer.verify()
    }

    @Test
    fun `user-agent header is present in every request`() {
        mockServer.expect(requestTo("https://data.sec.gov/submissions/CIK0000320193.json"))
            .andExpect(header("User-Agent", "PayAndPray/1.0 test@test.com"))
            .andRespond(
                withSuccess(
                    """{"cik":"0000320193","name":"Apple Inc.","tickers":[],"exchanges":[]}""",
                    MediaType.APPLICATION_JSON
                )
            )

        client.getCompanySubmissions("320193")
        mockServer.verify()
    }
}
