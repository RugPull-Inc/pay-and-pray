package edu.faculty.aseca.pay_and_pray_api.company

data class CompanyDetailsResponse(
    val cik: String,
    val name: String,
    val ticker: String?,
    val metrics: CompanyMetrics,
    val recentFilings: List<FilingEntry>,
)

data class CompanyMetrics(
    val revenue: List<MetricDataPoint>,
    val netIncome: List<MetricDataPoint>,
    val eps: List<MetricDataPoint>,
    val totalAssets: List<MetricDataPoint>,
    val totalLiabilities: List<MetricDataPoint>,
)

data class MetricDataPoint(
    val period: String,
    val value: Double,
    val form: String,
    val filed: String,
    val fiscalYear: Int?,
    val fiscalPeriod: String?,
)

data class FilingEntry(
    val accessionNumber: String,
    val filingDate: String,
    val form: String,
    val primaryDocument: String?,
)
