package edu.faculty.aseca.pay_and_pray_api.company

import com.github.benmanes.caffeine.cache.Caffeine
import edu.faculty.aseca.pay_and_pray_api.edgar.CompanyConcept
import edu.faculty.aseca.pay_and_pray_api.edgar.CompanyFacts
import edu.faculty.aseca.pay_and_pray_api.edgar.CompanySubmissions
import edu.faculty.aseca.pay_and_pray_api.edgar.CompanyTicker
import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarClient
import edu.faculty.aseca.pay_and_pray_api.edgar.FullTextSearchResult
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.caffeine.CaffeineCache
import org.springframework.cache.support.SimpleCacheManager
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import kotlin.test.assertEquals

@SpringJUnitConfig(CompanyDetailsServiceCachingTest.Config::class)
class CompanyDetailsServiceCachingTest(
    @Autowired private val service: CompanyDetailsService,
    @Autowired private val fakeEdgar: FakeCountingEdgarClient,
    @Autowired private val cacheManager: CacheManager,
) {
    @BeforeEach
    fun reset() {
        cacheManager.getCache(CacheConfig.COMPANY_DETAILS_CACHE)?.clear()
        fakeEdgar.submissionsCallCount = 0
        fakeEdgar.conceptCallCount = 0
    }

    @Test
    fun `second call with same cik does not hit EdgarClient`() {
        service.getDetails("320193")
        service.getDetails("320193")

        assertEquals(1, fakeEdgar.submissionsCallCount)
    }

    @Test
    fun `different cik is not served from cache`() {
        service.getDetails("320193")
        service.getDetails("789019")

        assertEquals(2, fakeEdgar.submissionsCallCount)
    }

    @Configuration
    @EnableCaching
    class Config {
        @Bean
        fun cacheManager(): CacheManager =
            SimpleCacheManager().apply {
                setCaches(
                    listOf(CaffeineCache(CacheConfig.COMPANY_DETAILS_CACHE, Caffeine.newBuilder().build())),
                )
            }

        @Bean
        fun fakeEdgar(): FakeCountingEdgarClient = FakeCountingEdgarClient()

        @Bean
        fun detailsService(edgar: FakeCountingEdgarClient): CompanyDetailsService = CompanyDetailsService(edgar)
    }
}

class FakeCountingEdgarClient : EdgarClient {
    var submissionsCallCount = 0
    var conceptCallCount = 0

    override fun getCompanySubmissions(cik: String): CompanySubmissions {
        submissionsCallCount++
        return CompanySubmissions(cik = cik, name = "Apple Inc.", tickers = listOf("AAPL"))
    }

    override fun getCompanyConcept(
        cik: String,
        concept: String,
    ): CompanyConcept {
        conceptCallCount++
        return CompanyConcept(cik = cik, entityName = "Apple Inc.", tag = concept)
    }

    override fun getCompanyFacts(cik: String): CompanyFacts = CompanyFacts(cik = cik, entityName = "Apple Inc.")

    override fun getCompanyTickers(): Map<String, CompanyTicker> = emptyMap()

    override fun searchFullText(query: String): FullTextSearchResult = throw UnsupportedOperationException()
}
