package edu.faculty.aseca.pay_and_pray_api.edgar

import com.fasterxml.jackson.annotation.JsonProperty

data class ConceptUnit(
    val end: String,
    @JsonProperty("val") val value: Double,
    val accn: String,
    val fy: Int? = null,
    val fp: String? = null,
    val form: String,
    val filed: String,
    val frame: String? = null,
)

data class RecentFilingsData(
    val accessionNumber: List<String> = emptyList(),
    val filingDate: List<String> = emptyList(),
    val reportDate: List<String> = emptyList(),
    val form: List<String> = emptyList(),
    val primaryDocument: List<String> = emptyList(),
)

data class RecentFilings(
    val recent: RecentFilingsData = RecentFilingsData(),
)

data class CompanySubmissions(
    val cik: String,
    val name: String,
    val tickers: List<String> = emptyList(),
    val exchanges: List<String> = emptyList(),
    val filings: RecentFilings? = null,
)

data class CompanyFacts(
    val cik: String,
    val entityName: String,
    val facts: Map<String, Any> = emptyMap(),
)

data class CompanyConcept(
    val cik: String,
    val entityName: String,
    val tag: String,
    val units: Map<String, List<ConceptUnit>> = emptyMap(),
)

data class FullTextSearchResult(
    val hits: FullTextHits,
)

data class FullTextHits(
    val total: FullTextTotal,
    val hits: List<FullTextHit> = emptyList(),
)

data class FullTextTotal(
    val value: Int,
    val relation: String,
)

data class FullTextSource(
    @JsonProperty("entity_name") val entityName: String?,
    @JsonProperty("ticker_symbol") val tickerSymbol: String?,
)

data class FullTextHit(
    @JsonProperty("_id") val id: String,
    @JsonProperty("_source") val source: FullTextSource,
)

data class CompanyTicker(
    @JsonProperty("cik_str") val cikStr: Int,
    val name: String,
    val ticker: String,
    val exchange: String = "",
)
