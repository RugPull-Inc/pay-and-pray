package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.edgar.CompanySubmissions
import edu.faculty.aseca.pay_and_pray_api.edgar.ConceptUnit
import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarApiException
import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarClient
import org.springframework.stereotype.Service

@Service
class CompanyDetailsService(
    private val edgarClient: EdgarClient,
) {
    companion object {
        private const val MAX_PERIODS = 8
        private const val MAX_FILINGS = 20
        private val RELEVANT_FORMS = setOf("10-K", "10-Q")
        private val REVENUE_TAGS =
            listOf("Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax", "SalesRevenueNet")
        private val NET_INCOME_TAGS = listOf("NetIncomeLoss")
        private val EPS_TAGS = listOf("EarningsPerShareBasic", "EarningsPerShareDiluted")
        private val ASSETS_TAGS = listOf("Assets")
        private val LIABILITIES_TAGS = listOf("Liabilities")
    }

    fun getDetails(cik: String): CompanyDetailsResponse {
        val submissions = edgarClient.getCompanySubmissions(cik)
        return CompanyDetailsResponse(
            cik = cik,
            name = submissions.name,
            ticker = submissions.tickers.firstOrNull(),
            metrics =
                CompanyMetrics(
                    revenue = fetchMetric(cik, REVENUE_TAGS),
                    netIncome = fetchMetric(cik, NET_INCOME_TAGS),
                    eps = fetchMetric(cik, EPS_TAGS),
                    totalAssets = fetchMetric(cik, ASSETS_TAGS),
                    totalLiabilities = fetchMetric(cik, LIABILITIES_TAGS),
                ),
            recentFilings = extractFilings(submissions),
        )
    }

    private fun fetchMetric(
        cik: String,
        tags: List<String>,
    ): List<MetricDataPoint> {
        for (tag in tags) {
            try {
                val concept = edgarClient.getCompanyConcept(cik, tag)
                return concept.units.values
                    .flatten()
                    .filter { it.form in RELEVANT_FORMS }
                    .sortedByDescending { it.end }
                    .distinctBy { it.end }
                    .take(MAX_PERIODS)
                    .map { it.toDataPoint() }
            } catch (e: EdgarApiException) {
                continue
            }
        }
        return emptyList()
    }

    private fun ConceptUnit.toDataPoint() =
        MetricDataPoint(
            period = end,
            value = value,
            form = form,
            filed = filed,
            fiscalYear = fy,
            fiscalPeriod = fp,
        )

    private fun extractFilings(submissions: CompanySubmissions): List<FilingEntry> {
        val recent = submissions.filings?.recent ?: return emptyList()
        return recent.accessionNumber.indices
            .map { i ->
                FilingEntry(
                    accessionNumber = recent.accessionNumber[i],
                    filingDate = recent.filingDate.getOrElse(i) { "" },
                    form = recent.form.getOrElse(i) { "" },
                    primaryDocument = recent.primaryDocument.getOrNull(i),
                )
            }.filter { it.form in RELEVANT_FORMS }
            .take(MAX_FILINGS)
    }
}
