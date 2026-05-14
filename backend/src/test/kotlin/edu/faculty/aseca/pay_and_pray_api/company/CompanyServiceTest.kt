package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.edgar.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class CompanyServiceTest {

    private val service = CompanyService(FakeEdgarClient())

    @Test
    fun `search returns mapped results from EDGAR hits`() {
        FakeEdgarClient.nextResult = fullTextResult(
            hit("0000320193-24-000006", "Apple Inc.", "AAPL"),
            hit("0000789019-24-000001", "Microsoft Corporation", null)
        )

        val response = service.search("Apple")

        assertEquals(2, response.total)
        assertEquals("Apple Inc.", response.results[0].name)
        assertEquals("AAPL", response.results[0].ticker)
        assertEquals("320193", response.results[0].cik)
        assertEquals("Microsoft Corporation", response.results[1].name)
        assertNull(response.results[1].ticker)
    }

    @Test
    fun `search deduplicates companies with multiple filings`() {
        FakeEdgarClient.nextResult = fullTextResult(
            hit("0000320193-24-000001", "Apple Inc.", "AAPL"),
            hit("0000320193-23-000001", "Apple Inc.", "AAPL")
        )

        val response = service.search("Apple")

        assertEquals(1, response.total)
        assertEquals("Apple Inc.", response.results[0].name)
    }

    @Test
    fun `search returns empty response when no hits`() {
        FakeEdgarClient.nextResult = fullTextResult()

        val response = service.search("xyzxyzxyz123")

        assertEquals(0, response.total)
        assertTrue(response.results.isEmpty())
    }

    @Test
    fun `search propagates EdgarApiException when EDGAR is down`() {
        FakeEdgarClient.nextResult = null

        assertThrows<EdgarApiException> {
            service.search("Apple")
        }
    }

    private fun hit(id: String, entityName: String, ticker: String?): FullTextHit =
        FullTextHit(
            id = id,
            source = buildMap {
                put("entity_name", entityName)
                if (ticker != null) put("ticker_symbol", ticker)
            }
        )

    private fun fullTextResult(vararg hits: FullTextHit): FullTextSearchResult =
        FullTextSearchResult(
            hits = FullTextHits(
                total = FullTextTotal(value = hits.size, relation = "eq"),
                hits = hits.toList()
            )
        )
}

private class FakeEdgarClient : EdgarClient {

    companion object {
        var nextResult: FullTextSearchResult? = FullTextSearchResult(
            hits = FullTextHits(total = FullTextTotal(0, "eq"), hits = emptyList())
        )
    }

    override fun searchFullText(query: String): FullTextSearchResult =
        nextResult ?: throw EdgarApiException("EDGAR unavailable")

    override fun getCompanySubmissions(cik: String): CompanySubmissions = throw UnsupportedOperationException()
    override fun getCompanyFacts(cik: String): CompanyFacts = throw UnsupportedOperationException()
    override fun getCompanyConcept(cik: String, concept: String): CompanyConcept = throw UnsupportedOperationException()
    override fun getCompanyTickers(): Map<String, CompanyTicker> = throw UnsupportedOperationException()
}
