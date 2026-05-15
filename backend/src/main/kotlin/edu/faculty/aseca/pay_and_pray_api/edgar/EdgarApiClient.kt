package edu.faculty.aseca.pay_and_pray_api.edgar

import io.github.bucket4j.Bandwidth
import io.github.bucket4j.Bucket
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Component
import org.springframework.web.client.HttpStatusCodeException
import org.springframework.web.client.RestTemplate
import java.time.Duration

@Component
class EdgarApiClient(
    @Qualifier("edgarRestTemplate") private val restTemplate: RestTemplate,
    @Value("\${edgar.user-agent}") private val userAgent: String,
) : EdgarClient {
    private val bucket: Bucket =
        Bucket
            .builder()
            .addLimit(
                Bandwidth
                    .builder()
                    .capacity(10)
                    .refillGreedy(10, Duration.ofSeconds(1))
                    .build(),
            ).build()

    private fun String.padCik() = padStart(10, '0')

    private fun <T : Any> get(
        url: String,
        type: Class<T>,
    ): T {
        bucket.asBlocking().consume(1)
        return try {
            restTemplate.getForObject(url, type, emptyMap<String, Any>())
                ?: throw EdgarApiException("Empty response from EDGAR: $url")
        } catch (e: HttpStatusCodeException) {
            throw EdgarApiException("EDGAR returned ${e.statusCode} for $url", e)
        }
    }

    private fun <T : Any> get(
        url: String,
        type: ParameterizedTypeReference<T>,
    ): T {
        bucket.asBlocking().consume(1)
        return try {
            restTemplate.exchange(url, HttpMethod.GET, null, type, emptyMap<String, Any>()).body
                ?: throw EdgarApiException("Empty response from EDGAR: $url")
        } catch (e: HttpStatusCodeException) {
            throw EdgarApiException("EDGAR returned ${e.statusCode} for $url", e)
        }
    }

    override fun getCompanySubmissions(cik: String): CompanySubmissions =
        get("https://data.sec.gov/submissions/CIK${cik.padCik()}.json", CompanySubmissions::class.java)

    override fun getCompanyFacts(cik: String): CompanyFacts =
        get("https://data.sec.gov/api/xbrl/companyfacts/CIK${cik.padCik()}.json", CompanyFacts::class.java)

    override fun getCompanyConcept(
        cik: String,
        concept: String,
    ): CompanyConcept =
        get(
            "https://data.sec.gov/api/xbrl/companyconcept/CIK${cik.padCik()}/us-gaap/$concept.json",
            CompanyConcept::class.java,
        )

    // forms=10-K limits results to companies with annual reports — intentional for a portfolio tracker,
    // where all major US public companies file 10-K. Companies with only 10-Q or 8-K won't appear.
    override fun searchFullText(query: String): FullTextSearchResult =
        get(
            "https://efts.sec.gov/LATEST/search-index?q=${query.encodeForUrl()}&forms=10-K",
            FullTextSearchResult::class.java,
        )

    override fun getCompanyTickers(): Map<String, CompanyTicker> =
        get(
            "https://www.sec.gov/files/company_tickers.json",
            object : ParameterizedTypeReference<Map<String, CompanyTicker>>() {},
        )

    private fun String.encodeForUrl() = java.net.URLEncoder.encode(this, Charsets.UTF_8)
}
