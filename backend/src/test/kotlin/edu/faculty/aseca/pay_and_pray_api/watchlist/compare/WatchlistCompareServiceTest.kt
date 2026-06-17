package edu.faculty.aseca.pay_and_pray_api.watchlist.compare

import edu.faculty.aseca.pay_and_pray_api.company.CompanyDetailsResponse
import edu.faculty.aseca.pay_and_pray_api.company.CompanyMetrics
import edu.faculty.aseca.pay_and_pray_api.company.FilingEntry
import edu.faculty.aseca.pay_and_pray_api.company.MetricDataPoint
import edu.faculty.aseca.pay_and_pray_api.watchlist.FakeWatchlistRepository
import edu.faculty.aseca.pay_and_pray_api.watchlist.WatchlistItem
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.Instant
import java.util.UUID

class WatchlistCompareServiceTest {
    private lateinit var fakeWatchlistRepository: FakeWatchlistRepository
    private lateinit var fakeCompanyService: FakeCompanyService
    private lateinit var fakeCompanyDetailsService: FakeCompanyDetailsService
    private lateinit var fakePriceService: FakePriceService
    private lateinit var service: WatchlistCompareService

    private val userId = UUID.randomUUID()
    private val aaplCik = "320193"
    private val googlCik = "1652044"

    @BeforeEach
    fun setUp() {
        fakeWatchlistRepository = FakeWatchlistRepository()
        fakeCompanyService = FakeCompanyService()
        fakeCompanyDetailsService = FakeCompanyDetailsService()
        fakePriceService = FakePriceService()
        service =
            WatchlistCompareServiceImpl(
                fakeWatchlistRepository,
                fakeCompanyService,
                fakeCompanyDetailsService,
                fakePriceService,
            )
    }

    private fun addToWatchlist(ticker: String) {
        fakeWatchlistRepository.save(WatchlistItem(userId = userId, ticker = ticker))
    }

    private fun metricDataPoint(value: Double) =
        MetricDataPoint(
            period = "2024-09-28",
            value = value,
            form = "10-Q",
            filed = "2024-10-30",
            fiscalYear = 2024,
            fiscalPeriod = "Q3",
        )

    private fun fullDetails(
        cik: String,
        ticker: String,
    ) = CompanyDetailsResponse(
        cik = cik,
        name = "$ticker Inc.",
        ticker = ticker,
        metrics =
            CompanyMetrics(
                revenue = listOf(metricDataPoint(100.0)),
                netIncome = listOf(metricDataPoint(20.0)),
                eps = listOf(metricDataPoint(1.5)),
                totalAssets = listOf(metricDataPoint(500.0)),
                totalLiabilities = listOf(metricDataPoint(300.0)),
                sharesOutstanding = listOf(metricDataPoint(10.0)),
            ),
        recentFilings =
            listOf(
                FilingEntry(
                    accessionNumber = "0000320193-24-000123",
                    filingDate = "2024-11-01",
                    reportDate = "2024-09-28",
                    form = "10-Q",
                    primaryDocument = "doc.htm",
                    url = "https://www.sec.gov/Archives/edgar/data/$cik/doc.htm",
                ),
            ),
    )

    private fun setupCompanyWithFullData(
        ticker: String,
        cik: String,
        price: BigDecimal,
        updatedAt: Instant,
    ) {
        addToWatchlist(ticker)
        fakeCompanyService.cikByTicker[ticker] = cik
        fakeCompanyDetailsService.detailsByCik[cik] = fullDetails(cik, ticker)
        fakePriceService.priceByTicker[ticker] = price
        fakePriceService.updatedAtByTicker[ticker] = updatedAt
    }

    @Test
    fun `returns both companies with their correct ticker when both are in the watchlist`() {
        setupCompanyWithFullData("AAPL", aaplCik, BigDecimal("150.00"), Instant.parse("2024-11-01T00:00:00Z"))
        setupCompanyWithFullData("GOOGL", googlCik, BigDecimal("140.00"), Instant.parse("2024-11-01T00:00:00Z"))

        val response = service.compare(userId, "AAPL", "GOOGL")

        assertEquals("AAPL", response.company1.ticker)
        assertEquals("GOOGL", response.company2.ticker)
    }

    @Test
    fun `response includes all required fields for each company`() {
        setupCompanyWithFullData("AAPL", aaplCik, BigDecimal("150.00"), Instant.parse("2024-11-01T00:00:00Z"))
        setupCompanyWithFullData("GOOGL", googlCik, BigDecimal("140.00"), Instant.parse("2024-11-01T00:00:00Z"))

        val response = service.compare(userId, "AAPL", "GOOGL")

        val company1 = response.company1
        assertNotNull(company1.currentPrice)
        assertNotNull(company1.marketCap)
        assertNotNull(company1.revenueQuarterly)
        assertNotNull(company1.netIncomeQuarterly)
        assertNotNull(company1.epsQuarterly)
        assertNotNull(company1.totalAssets)
        assertNotNull(company1.totalLiabilities)
        assertNotNull(company1.lastFiling)
        assertNotNull(company1.priceLastUpdatedAt)
    }

    @Test
    fun `optional fields are explicitly null when a company has partial metrics and no price`() {
        setupCompanyWithFullData("AAPL", aaplCik, BigDecimal("150.00"), Instant.parse("2024-11-01T00:00:00Z"))

        addToWatchlist("GOOGL")
        fakeCompanyService.cikByTicker["GOOGL"] = googlCik
        fakeCompanyDetailsService.detailsByCik[googlCik] =
            fullDetails(googlCik, "GOOGL").let { details ->
                details.copy(
                    metrics =
                        details.metrics.copy(
                            revenue = emptyList(),
                            netIncome = emptyList(),
                            eps = emptyList(),
                        ),
                )
            }
        // no price configured for GOOGL

        val response = service.compare(userId, "AAPL", "GOOGL")

        val googl = response.company2
        assertNull(googl.revenueQuarterly)
        assertNull(googl.netIncomeQuarterly)
        assertNull(googl.epsQuarterly)
        assertNull(googl.currentPrice)
        assertNull(googl.priceLastUpdatedAt)
    }

    @Test
    fun `returns the latest registered price as currentPrice`() {
        setupCompanyWithFullData("AAPL", aaplCik, BigDecimal("155.00"), Instant.parse("2024-11-02T00:00:00Z"))
        setupCompanyWithFullData("GOOGL", googlCik, BigDecimal("140.00"), Instant.parse("2024-11-01T00:00:00Z"))

        val response = service.compare(userId, "AAPL", "GOOGL")

        assertEquals(BigDecimal("155.00"), response.company1.currentPrice)
    }
}
