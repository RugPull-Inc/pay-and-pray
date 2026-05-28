package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.edgar.CompanySubmissions
import edu.faculty.aseca.pay_and_pray_api.edgar.ConceptUnit
import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarApiException
import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarClient
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.client.HttpStatusCodeException
import java.time.LocalDate

@Service
class CompanyDetailsService(
    private val edgarClient: EdgarClient,
) {
    companion object {
        private const val MAX_PERIODS = 8
        private const val MAX_FILINGS = 20
        private const val MIN_CHART_SERIES_POINTS = 4
        private const val STALE_REVENUE_MONTHS = 6L
        private val RELEVANT_FORMS = setOf("10-K", "10-Q")
        private val REVENUE_TAGS =
            listOf("RevenueFromContractWithCustomerExcludingAssessedTax", "SalesRevenueNet", "Revenues")
        private val NET_INCOME_TAGS = listOf("NetIncomeLoss")
        private val EPS_TAGS = listOf("EarningsPerShareBasic", "EarningsPerShareDiluted")
        private val ASSETS_TAGS = listOf("Assets")
        private val LIABILITIES_TAGS =
            listOf("Liabilities", "LiabilitiesCurrent", "LiabilitiesAndStockholdersEquity")
    }

    fun getDetails(cik: String): CompanyDetailsResponse {
        val submissions = edgarClient.getCompanySubmissions(cik)
        val netIncome = fetchMetric(cik, NET_INCOME_TAGS)
        return CompanyDetailsResponse(
            cik = cik,
            name = submissions.name,
            ticker = submissions.tickers.firstOrNull(),
            metrics =
                CompanyMetrics(
                    revenue = fetchRevenueMetric(cik, netIncome),
                    netIncome = netIncome,
                    eps = fetchMetric(cik, EPS_TAGS),
                    totalAssets = fetchMetric(cik, ASSETS_TAGS),
                    totalLiabilities = fetchMetric(cik, LIABILITIES_TAGS),
                ),
            recentFilings = extractFilings(submissions, cik),
        )
    }

    private fun fetchMetric(
        cik: String,
        tags: List<String>,
    ): List<MetricDataPoint> {
        var fallback: List<MetricDataPoint> = emptyList()
        for (tag in tags) {
            try {
                val concept = edgarClient.getCompanyConcept(cik, tag)
                val dataPoints =
                    concept.units.values
                        .flatten()
                        .filter { it.form in RELEVANT_FORMS }
                        .sortedByDescending { it.end }
                        .distinctBy { it.end }
                        .take(MAX_PERIODS)
                        .map { it.toDataPoint() }
                if (dataPoints.size >= MIN_CHART_SERIES_POINTS) return dataPoints
                if (fallback.isEmpty()) fallback = dataPoints
            } catch (e: EdgarApiException) {
                val status = (e.cause as? HttpStatusCodeException)?.statusCode
                if (status != HttpStatus.NOT_FOUND) throw e
            }
        }
        return fallback
    }

    private fun fetchRevenueMetric(
        cik: String,
        referenceMetric: List<MetricDataPoint>,
    ): List<MetricDataPoint> {
        val curated = fetchMetric(cik, REVENUE_TAGS)
        if (!isRevenueStale(curated, referenceMetric)) return curated

        return fetchRevenueFromCompanyFacts(cik).ifEmpty { curated }
    }

    private fun isRevenueStale(
        revenue: List<MetricDataPoint>,
        referenceMetric: List<MetricDataPoint>,
    ): Boolean {
        val revenueLatest = revenue.firstOrNull()?.period?.let(LocalDate::parse) ?: return true
        val referenceLatest = referenceMetric.firstOrNull()?.period?.let(LocalDate::parse) ?: return false

        return revenueLatest.isBefore(referenceLatest.minusMonths(STALE_REVENUE_MONTHS))
    }

    private fun fetchRevenueFromCompanyFacts(cik: String): List<MetricDataPoint> {
        val candidates =
            edgarClient
                .getCompanyFacts(cik)
                .facts
                .flatMap { (_, concepts) ->
                    concepts.mapNotNull { (tag, concept) ->
                        if (!isRevenueLikeConcept(tag, concept.label, concept.description)) return@mapNotNull null
                        val points =
                            concept.units["USD"]
                                .orEmpty()
                                .filter { it.form in RELEVANT_FORMS }
                                .sortedByDescending { it.end }
                                .distinctBy { it.end }
                                .take(MAX_PERIODS)
                                .map { it.toDataPoint() }
                        if (points.isEmpty()) null else RevenueCandidate(points)
                    }
                }

        return candidates
            .maxWithOrNull(
                compareBy<RevenueCandidate> {
                    it.points
                        .firstOrNull()
                        ?.period
                        .orEmpty()
                }.thenBy { it.points.size },
            )?.points
            .orEmpty()
    }

    private fun isRevenueLikeConcept(
        tag: String,
        label: String?,
        description: String?,
    ): Boolean {
        val text = listOf(tag, label.orEmpty(), description.orEmpty()).joinToString(" ").lowercase()
        val includesRevenue = text.contains("revenue") || text.contains("sales")
        val excludes =
            listOf(
                "cost",
                "deferred",
                "unearned",
                "liabilit",
                "receivable",
                "tax",
                "remaining performance",
                "contract asset",
            ).any { text.contains(it) }

        return includesRevenue && !excludes
    }

    private data class RevenueCandidate(
        val points: List<MetricDataPoint>,
    )

    private fun ConceptUnit.toDataPoint() =
        MetricDataPoint(
            period = end,
            value = value,
            form = form,
            filed = filed,
            fiscalYear = fy,
            fiscalPeriod = fp,
        )

    private fun extractFilings(
        submissions: CompanySubmissions,
        cik: String,
    ): List<FilingEntry> {
        val recent = submissions.filings?.recent ?: return emptyList()
        return recent.accessionNumber.indices
            .map { i ->
                val accessionNumber = recent.accessionNumber[i]
                val primaryDocument = recent.primaryDocument.getOrNull(i)
                val accessionPath = accessionNumber.replace("-", "")
                FilingEntry(
                    accessionNumber = accessionNumber,
                    filingDate = recent.filingDate.getOrElse(i) { "" },
                    reportDate = recent.reportDate.getOrElse(i) { "" }.ifEmpty { null },
                    form = recent.form.getOrElse(i) { "" },
                    primaryDocument = primaryDocument,
                    url =
                        primaryDocument?.let {
                            "https://www.sec.gov/Archives/edgar/data/$cik/$accessionPath/$it"
                        },
                )
            }.filter { it.form in RELEVANT_FORMS }
            .take(MAX_FILINGS)
    }
}
