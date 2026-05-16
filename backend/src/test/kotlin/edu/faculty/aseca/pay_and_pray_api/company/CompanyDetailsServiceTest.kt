package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.edgar.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.http.HttpStatus
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.HttpServerErrorException
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class CompanyDetailsServiceTest {
    private lateinit var fakeEdgar: FakeDetailsEdgarClient
    private lateinit var service: CompanyDetailsService

    @BeforeEach
    fun setUp() {
        fakeEdgar = FakeDetailsEdgarClient()
        service = CompanyDetailsService(fakeEdgar)
    }

    @Test
    fun `returns company name and first ticker from submissions`() {
        fakeEdgar.submissions = CompanySubmissions(cik = "0000320193", name = "Apple Inc.", tickers = listOf("AAPL"))

        val result = service.getDetails("320193")

        assertEquals("Apple Inc.", result.name)
        assertEquals("AAPL", result.ticker)
    }

    @Test
    fun `returns null ticker when company has no tickers`() {
        fakeEdgar.submissions = CompanySubmissions(cik = "0000000001", name = "No Ticker Corp", tickers = emptyList())

        val result = service.getDetails("1")

        assertNull(result.ticker)
    }

    @Test
    fun `returns revenue data points filtered to 10-K and 10-Q`() {
        fakeEdgar.submissions = appleSubmissions()
        fakeEdgar.concepts["Revenues"] =
            conceptOf(
                "Revenues",
                unit("2024-09-28", 391035.0, "10-K"),
                unit("2024-06-29", 85777.0, "10-Q"),
                unit("2024-06-29", 85777.0, "8-K"),
            )

        val result = service.getDetails("320193")

        assertEquals(2, result.metrics.revenue.size)
        assertTrue(result.metrics.revenue.none { it.form == "8-K" })
    }

    @Test
    fun `limits each metric to 8 most recent periods`() {
        fakeEdgar.submissions = appleSubmissions()
        val units =
            (1..12).map { i ->
                ConceptUnit(
                    end = "2024-${i.toString().padStart(2, '0')}-01",
                    value = i.toDouble(),
                    accn = "acc$i",
                    form = "10-Q",
                    filed = "2024-${i.toString().padStart(2, '0')}-15",
                )
            }
        fakeEdgar.concepts["Revenues"] = CompanyConcept("320193", "Apple Inc.", "Revenues", mapOf("USD" to units))

        val result = service.getDetails("320193")

        assertEquals(8, result.metrics.revenue.size)
    }

    @Test
    fun `returns most recent periods first`() {
        fakeEdgar.submissions = appleSubmissions()
        fakeEdgar.concepts["Revenues"] =
            conceptOf(
                "Revenues",
                unit("2023-09-30", 100.0, "10-K"),
                unit("2024-09-28", 391035.0, "10-K"),
            )

        val result = service.getDetails("320193")

        assertEquals("2024-09-28", result.metrics.revenue[0].period)
    }

    @Test
    fun `returns empty list for metric when no concept tag matches`() {
        fakeEdgar.submissions = appleSubmissions()

        val result = service.getDetails("320193")

        assertTrue(result.metrics.revenue.isEmpty())
        assertTrue(result.metrics.netIncome.isEmpty())
    }

    @Test
    fun `tries fallback concept tag when primary is not found`() {
        fakeEdgar.submissions = appleSubmissions()
        fakeEdgar.concepts["RevenueFromContractWithCustomerExcludingAssessedTax"] =
            conceptOf(
                "RevenueFromContractWithCustomerExcludingAssessedTax",
                unit("2024-09-28", 391035.0, "10-K"),
            )

        val result = service.getDetails("320193")

        assertEquals(1, result.metrics.revenue.size)
    }

    @Test
    fun `returns recent 10-K and 10-Q filings from submissions`() {
        fakeEdgar.submissions =
            CompanySubmissions(
                cik = "0000320193",
                name = "Apple Inc.",
                tickers = listOf("AAPL"),
                filings =
                    RecentFilings(
                        RecentFilingsData(
                            accessionNumber = listOf("acc-1", "acc-2", "acc-3"),
                            filingDate = listOf("2024-11-01", "2024-08-01", "2024-05-01"),
                            form = listOf("10-K", "10-Q", "8-K"),
                            primaryDocument = listOf("doc1.htm", "doc2.htm", "doc3.htm"),
                        ),
                    ),
            )

        val result = service.getDetails("320193")

        assertEquals(2, result.recentFilings.size)
        assertEquals("10-K", result.recentFilings[0].form)
        assertEquals("10-Q", result.recentFilings[1].form)
    }

    @Test
    fun `returns empty filings list when submissions has no filings`() {
        fakeEdgar.submissions = appleSubmissions() // filings = null

        val result = service.getDetails("320193")

        assertTrue(result.recentFilings.isEmpty())
    }

    @Test
    fun `propagates EdgarApiException when submissions call fails`() {
        fakeEdgar.throwOnSubmissions = true

        assertThrows<EdgarApiException> {
            service.getDetails("320193")
        }
    }

    @Test
    fun `propagates EdgarApiException when EDGAR returns 5xx during concept fetch`() {
        fakeEdgar.submissions = appleSubmissions()
        fakeEdgar.conceptServerError = true

        assertThrows<EdgarApiException> {
            service.getDetails("320193")
        }
    }

    private fun appleSubmissions() =
        CompanySubmissions(cik = "0000320193", name = "Apple Inc.", tickers = listOf("AAPL"))

    private fun conceptOf(
        tag: String,
        vararg units: ConceptUnit,
    ) = CompanyConcept(cik = "0000320193", entityName = "Apple Inc.", tag = tag, units = mapOf("USD" to units.toList()))

    private fun unit(
        end: String,
        value: Double,
        form: String,
    ) = ConceptUnit(end = end, value = value, accn = "acc-$end", form = form, filed = end)
}

private class FakeDetailsEdgarClient : EdgarClient {
    var submissions: CompanySubmissions = CompanySubmissions("", "", emptyList())
    var throwOnSubmissions = false
    var conceptServerError = false
    val concepts = mutableMapOf<String, CompanyConcept>()

    override fun getCompanySubmissions(cik: String): CompanySubmissions {
        if (throwOnSubmissions) throw EdgarApiException("EDGAR submissions unavailable")
        return submissions
    }

    override fun getCompanyConcept(
        cik: String,
        concept: String,
    ): CompanyConcept {
        if (conceptServerError) {
            throw EdgarApiException(
                "EDGAR 503",
                HttpServerErrorException(HttpStatus.SERVICE_UNAVAILABLE),
            )
        }
        return concepts[concept]
            ?: throw EdgarApiException("concept $concept not found", HttpClientErrorException(HttpStatus.NOT_FOUND))
    }

    override fun getCompanyFacts(cik: String): CompanyFacts = throw UnsupportedOperationException()

    override fun searchFullText(query: String): FullTextSearchResult = throw UnsupportedOperationException()

    override fun getCompanyTickers(): Map<String, CompanyTicker> = throw UnsupportedOperationException()
}
