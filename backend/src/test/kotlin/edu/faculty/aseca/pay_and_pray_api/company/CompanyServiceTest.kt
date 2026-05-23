package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.edgar.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class CompanyServiceTest {
    private lateinit var fakeEdgar: FakeTickerEdgarClient
    private lateinit var service: CompanyService

    @BeforeEach
    fun setUp() {
        fakeEdgar = FakeTickerEdgarClient()
        service = CompanyService(fakeEdgar)
    }

    @Test
    fun `search by ticker prefix returns matching companies`() {
        fakeEdgar.tickers =
            mapOf(
                "0" to CompanyTicker(cikStr = 320193, name = "Apple Inc.", ticker = "AAPL"),
                "1" to CompanyTicker(cikStr = 789019, name = "Microsoft Corporation", ticker = "MSFT"),
            )

        val response = service.search("AAPL")

        assertEquals(1, response.total)
        assertEquals("Apple Inc.", response.results[0].name)
        assertEquals("AAPL", response.results[0].ticker)
        assertEquals("320193", response.results[0].cik)
    }

    @Test
    fun `search by name substring returns matching companies`() {
        fakeEdgar.tickers =
            mapOf(
                "0" to CompanyTicker(cikStr = 320193, name = "Apple Inc.", ticker = "AAPL"),
                "1" to CompanyTicker(cikStr = 789019, name = "Microsoft Corporation", ticker = "MSFT"),
                "2" to CompanyTicker(cikStr = 1234567, name = "Pineapple Corp", ticker = "PINE"),
            )

        val response = service.search("apple")

        assertEquals(2, response.total)
        val names = response.results.map { it.name }
        assertTrue(names.contains("Apple Inc."))
        assertTrue(names.contains("Pineapple Corp"))
    }

    @Test
    fun `search is case-insensitive`() {
        fakeEdgar.tickers =
            mapOf(
                "0" to CompanyTicker(cikStr = 320193, name = "Apple Inc.", ticker = "AAPL"),
            )

        val lower = service.search("aapl")
        val upper = service.search("AAPL")

        assertEquals(1, lower.total)
        assertEquals(1, upper.total)
    }

    @Test
    fun `search returns empty response when no matches`() {
        fakeEdgar.tickers =
            mapOf(
                "0" to CompanyTicker(cikStr = 320193, name = "Apple Inc.", ticker = "AAPL"),
            )

        val response = service.search("XYZXYZ999")

        assertEquals(0, response.total)
        assertTrue(response.results.isEmpty())
    }

    @Test
    fun `search limits results to 10`() {
        fakeEdgar.tickers =
            (1..20).associate { i ->
                "$i" to CompanyTicker(cikStr = i, name = "Corp $i", ticker = "C$i")
            }

        val response = service.search("Corp")

        assertEquals(10, response.total)
        assertEquals(10, response.results.size)
    }

    @Test
    fun `search uses cached tickers on second call`() {
        fakeEdgar.tickers =
            mapOf("0" to CompanyTicker(cikStr = 320193, name = "Apple Inc.", ticker = "AAPL"))

        service.search("AAPL")
        service.search("AAPL")

        assertEquals(1, fakeEdgar.getTickersCallCount)
    }

    @Test
    fun `search propagates EdgarApiException when EDGAR is down`() {
        fakeEdgar.throwOnGetTickers = true

        assertThrows<EdgarApiException> {
            service.search("Apple")
        }
    }

    @Test
    fun `cik is mapped as string from int`() {
        fakeEdgar.tickers =
            mapOf("0" to CompanyTicker(cikStr = 320193, name = "Apple Inc.", ticker = "AAPL"))

        val response = service.search("AAPL")

        assertEquals("320193", response.results[0].cik)
        assertNull(
            response.results[0]
                .ticker
                ?.let { if (it.isEmpty()) null else it }
                .let { null },
        )
        assertEquals("AAPL", response.results[0].ticker)
    }
}

private class FakeTickerEdgarClient : EdgarClient {
    var tickers: Map<String, CompanyTicker> = emptyMap()
    var throwOnGetTickers = false
    var getTickersCallCount = 0

    override fun getCompanyTickers(): Map<String, CompanyTicker> {
        if (throwOnGetTickers) throw EdgarApiException("EDGAR unavailable")
        getTickersCallCount++
        return tickers
    }

    override fun getCompanySubmissions(cik: String): CompanySubmissions = throw UnsupportedOperationException()

    override fun getCompanyFacts(cik: String): CompanyFacts = throw UnsupportedOperationException()

    override fun getCompanyConcept(
        cik: String,
        concept: String,
    ): CompanyConcept = throw UnsupportedOperationException()

    override fun searchFullText(query: String): FullTextSearchResult = throw UnsupportedOperationException()
}
