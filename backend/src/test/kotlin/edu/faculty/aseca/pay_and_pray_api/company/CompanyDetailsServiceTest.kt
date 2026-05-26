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
    fun `chooses revenue concept with newest data when primary tag is stale`() {
        fakeEdgar.submissions = appleSubmissions()
        fakeEdgar.concepts["Revenues"] =
            conceptOf(
                "Revenues",
                unit("2018-09-29", 265595.0, "10-K"),
            )
        fakeEdgar.concepts["RevenueFromContractWithCustomerExcludingAssessedTax"] =
            conceptOf(
                "RevenueFromContractWithCustomerExcludingAssessedTax",
                unit("2024-09-28", 391035.0, "10-K"),
                unit("2024-06-29", 85777.0, "10-Q"),
            )

        val result = service.getDetails("320193")

        assertEquals("2024-09-28", result.metrics.revenue[0].period)
        assertEquals(391035.0, result.metrics.revenue[0].value)
    }

    @Test
    fun `chooses better covered recent revenue concept over sparse newest concept`() {
        fakeEdgar.submissions =
            submissionsWithRecentReportDates(
                "2025-03-31",
                "2024-12-31",
                "2024-09-30",
                "2024-06-30",
                "2024-03-31",
            )
        fakeEdgar.concepts["Revenues"] =
            conceptOf(
                "Revenues",
                unit("2025-03-31", 1.0, "10-Q"),
            )
        fakeEdgar.concepts["RevenueFromContractWithCustomerExcludingAssessedTax"] =
            conceptOf(
                "RevenueFromContractWithCustomerExcludingAssessedTax",
                unit("2024-12-31", 100.0, "10-K"),
                unit("2024-09-30", 90.0, "10-Q"),
                unit("2024-06-30", 80.0, "10-Q"),
                unit("2024-03-31", 70.0, "10-Q"),
            )

        val result = service.getDetails("320193")

        assertEquals(4, result.metrics.revenue.size)
        assertEquals("2024-12-31", result.metrics.revenue[0].period)
        assertEquals(100.0, result.metrics.revenue[0].value)
    }

    @Test
    fun `chooses revenue concept with better recent filing coverage when sparse concept is newest`() {
        fakeEdgar.submissions =
            submissionsWithRecentReportDates(
                "2025-03-31",
                "2024-12-31",
                "2024-09-30",
                "2024-06-30",
                "2024-03-31",
                "2023-12-31",
            )
        fakeEdgar.concepts["Revenues"] =
            conceptOf(
                "Revenues",
                unit("2025-03-31", 1.0, "10-Q"),
                unit("2021-12-31", 2.0, "10-K"),
            )
        fakeEdgar.concepts["RevenueFromContractWithCustomerExcludingAssessedTax"] =
            conceptOf(
                "RevenueFromContractWithCustomerExcludingAssessedTax",
                unit("2024-12-31", 100.0, "10-K"),
                unit("2024-09-30", 90.0, "10-Q"),
                unit("2024-06-30", 80.0, "10-Q"),
                unit("2024-03-31", 70.0, "10-Q"),
                unit("2023-12-31", 60.0, "10-K"),
            )

        val result = service.getDetails("320193")

        assertEquals(5, result.metrics.revenue.size)
        assertEquals("2024-12-31", result.metrics.revenue[0].period)
    }

    @Test
    fun `falls back to company facts revenue concept when curated revenue tags are stale`() {
        fakeEdgar.submissions = appleSubmissions()
        fakeEdgar.concepts["RevenueFromContractWithCustomerExcludingAssessedTax"] =
            conceptOf(
                "RevenueFromContractWithCustomerExcludingAssessedTax",
                unit("2022-01-30", 26914.0, "10-K"),
            )
        fakeEdgar.concepts["NetIncomeLoss"] =
            conceptOf(
                "NetIncomeLoss",
                unit("2026-04-26", 58321.0, "10-Q"),
            )
        fakeEdgar.companyFacts =
            CompanyFacts(
                cik = "0001045810",
                entityName = "NVIDIA CORP",
                facts =
                    mapOf(
                        "nvidia" to
                            mapOf(
                                "Revenue" to
                                    CompanyFactConcept(
                                        label = "Revenue",
                                        units =
                                            mapOf(
                                                "USD" to
                                                    listOf(
                                                        unit("2026-04-26", 44062.0, "10-Q"),
                                                        unit("2026-01-25", 130497.0, "10-K"),
                                                        unit("2025-10-26", 57006.0, "10-Q"),
                                                        unit("2025-07-27", 46743.0, "10-Q"),
                                                    ),
                                            ),
                                    ),
                            ),
                    ),
            )

        val result = service.getDetails("1045810")

        assertEquals("2026-04-26", result.metrics.revenue[0].period)
        assertEquals(44062.0, result.metrics.revenue[0].value)
    }

    @Test
    fun `falls back to company facts revenue when curated revenue is one year behind net income`() {
        fakeEdgar.submissions = appleSubmissions()
        fakeEdgar.concepts["RevenueFromContractWithCustomerExcludingAssessedTax"] =
            conceptOf(
                "RevenueFromContractWithCustomerExcludingAssessedTax",
                unit("2025-03-31", 90234.0, "10-Q"),
                unit("2024-12-31", 350018.0, "10-K"),
                unit("2024-09-30", 253549.0, "10-Q"),
                unit("2024-06-30", 165281.0, "10-Q"),
            )
        fakeEdgar.concepts["NetIncomeLoss"] =
            conceptOf(
                "NetIncomeLoss",
                unit("2026-03-31", 62578.0, "10-Q"),
            )
        fakeEdgar.companyFacts =
            CompanyFacts(
                cik = "0001652044",
                entityName = "Alphabet Inc.",
                facts =
                    mapOf(
                        "alphabet" to
                            mapOf(
                                "Revenue" to
                                    CompanyFactConcept(
                                        label = "Revenue",
                                        units =
                                            mapOf(
                                                "USD" to
                                                    listOf(
                                                        unit("2026-03-31", 100000.0, "10-Q"),
                                                        unit("2025-12-31", 400000.0, "10-K"),
                                                        unit("2025-09-30", 300000.0, "10-Q"),
                                                        unit("2025-06-30", 200000.0, "10-Q"),
                                                    ),
                                            ),
                                    ),
                            ),
                    ),
            )

        val result = service.getDetails("1652044")

        assertEquals("2026-03-31", result.metrics.revenue[0].period)
        assertEquals(100000.0, result.metrics.revenue[0].value)
    }

    @Test
    fun `uses fallback liabilities concept when total liabilities is unavailable`() {
        fakeEdgar.submissions = appleSubmissions()
        fakeEdgar.concepts["LiabilitiesCurrent"] =
            conceptOf(
                "LiabilitiesCurrent",
                unit("2026-03-31", 181519.0, "10-Q"),
            )

        val result = service.getDetails("1018724")

        assertEquals(1, result.metrics.totalLiabilities.size)
        assertEquals(181519.0, result.metrics.totalLiabilities[0].value)
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
                            accessionNumber = listOf("0000320193-24-000123", "0000320193-24-000085", "acc-3"),
                            filingDate = listOf("2024-11-01", "2024-08-01", "2024-05-01"),
                            reportDate = listOf("2024-09-28", "2024-06-29", ""),
                            form = listOf("10-K", "10-Q", "8-K"),
                            primaryDocument = listOf("aapl-20240928.htm", "aapl-20240629.htm", "doc3.htm"),
                        ),
                    ),
            )

        val result = service.getDetails("320193")

        assertEquals(2, result.recentFilings.size)
        assertEquals("10-K", result.recentFilings[0].form)
        assertEquals("2024-09-28", result.recentFilings[0].reportDate)
        assertEquals(
            "https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/aapl-20240928.htm",
            result.recentFilings[0].url,
        )
        assertEquals("10-Q", result.recentFilings[1].form)
        assertEquals("2024-06-29", result.recentFilings[1].reportDate)
    }

    @Test
    fun `reportDate is null when empty string in EDGAR response`() {
        fakeEdgar.submissions =
            CompanySubmissions(
                cik = "0000320193",
                name = "Apple Inc.",
                tickers = listOf("AAPL"),
                filings =
                    RecentFilings(
                        RecentFilingsData(
                            accessionNumber = listOf("0000320193-24-000123"),
                            filingDate = listOf("2024-11-01"),
                            reportDate = listOf(""),
                            form = listOf("10-K"),
                            primaryDocument = listOf("aapl-20240928.htm"),
                        ),
                    ),
            )

        val result = service.getDetails("320193")

        assertEquals(1, result.recentFilings.size)
        assertEquals(null, result.recentFilings[0].reportDate)
    }

    @Test
    fun `url is null when primaryDocument is missing`() {
        fakeEdgar.submissions =
            CompanySubmissions(
                cik = "0000320193",
                name = "Apple Inc.",
                tickers = listOf("AAPL"),
                filings =
                    RecentFilings(
                        RecentFilingsData(
                            accessionNumber = listOf("0000320193-24-000123"),
                            filingDate = listOf("2024-11-01"),
                            reportDate = listOf("2024-09-28"),
                            form = listOf("10-K"),
                            primaryDocument = emptyList(),
                        ),
                    ),
            )

        val result = service.getDetails("320193")

        assertEquals(1, result.recentFilings.size)
        assertEquals(null, result.recentFilings[0].url)
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

    private fun submissionsWithRecentReportDates(vararg reportDates: String) =
        CompanySubmissions(
            cik = "0000320193",
            name = "Apple Inc.",
            tickers = listOf("AAPL"),
            filings =
                RecentFilings(
                    RecentFilingsData(
                        accessionNumber = reportDates.mapIndexed { i, _ -> "acc-$i" },
                        filingDate = reportDates.toList(),
                        reportDate = reportDates.toList(),
                        form = reportDates.mapIndexed { i, _ -> if (i == 1) "10-K" else "10-Q" },
                        primaryDocument = reportDates.mapIndexed { i, _ -> "doc-$i.htm" },
                    ),
                ),
        )

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
    var companyFacts: CompanyFacts = CompanyFacts("", "")
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

    override fun getCompanyFacts(cik: String): CompanyFacts = companyFacts

    override fun searchFullText(query: String): FullTextSearchResult = throw UnsupportedOperationException()

    override fun getCompanyTickers(): Map<String, CompanyTicker> = throw UnsupportedOperationException()
}
