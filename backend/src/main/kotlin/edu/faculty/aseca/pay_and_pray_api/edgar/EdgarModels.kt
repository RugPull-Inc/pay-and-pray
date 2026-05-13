package edu.faculty.aseca.pay_and_pray_api.edgar

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty

@JsonIgnoreProperties(ignoreUnknown = true)
data class CompanySubmissions(
    val cik: String,
    val name: String,
    val tickers: List<String> = emptyList(),
    val exchanges: List<String> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class CompanyFacts(
    val cik: String,
    val entityName: String,
    val facts: Map<String, Any> = emptyMap()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class CompanyConcept(
    val cik: String,
    val entityName: String,
    val tag: String,
    val units: Map<String, Any> = emptyMap()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FullTextSearchResult(val hits: FullTextHits)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FullTextHits(
    val total: FullTextTotal,
    val hits: List<FullTextHit> = emptyList()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FullTextTotal(val value: Int, val relation: String)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FullTextHit(
    @JsonProperty("_id") val id: String,
    @JsonProperty("_source") val source: Map<String, Any> = emptyMap()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class CompanyTicker(
    @JsonProperty("cik_str") val cikStr: Int,
    val name: String,
    val ticker: String,
    val exchange: String = ""
)
