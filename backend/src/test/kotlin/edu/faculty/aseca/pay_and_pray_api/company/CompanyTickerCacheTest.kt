package edu.faculty.aseca.pay_and_pray_api.company

import com.github.benmanes.caffeine.cache.Caffeine
import edu.faculty.aseca.pay_and_pray_api.edgar.CompanyTicker
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

@SpringJUnitConfig(CompanyTickerCacheTest.Config::class)
class CompanyTickerCacheTest(
    @Autowired private val tickerCache: CompanyTickerCache,
    @Autowired private val fakeEdgar: FakeTickerEdgarClient,
) {
    @Test
    fun `second call with same cache key does not hit EdgarClient`() {
        fakeEdgar.tickers =
            mapOf("0" to CompanyTicker(cikStr = 320193, name = "Apple Inc.", ticker = "AAPL"))

        tickerCache.getTickers()
        tickerCache.getTickers()

        assertEquals(1, fakeEdgar.getTickersCallCount)
    }

    @Configuration
    @EnableCaching
    class Config {
        @Bean
        fun cacheManager(): CacheManager =
            SimpleCacheManager().apply {
                setCaches(
                    listOf(CaffeineCache(CacheConfig.COMPANY_TICKERS_CACHE, Caffeine.newBuilder().build())),
                )
            }

        @Bean
        fun fakeEdgar(): FakeTickerEdgarClient = FakeTickerEdgarClient()

        @Bean
        fun tickerCache(edgar: FakeTickerEdgarClient): CompanyTickerCache =
            CompanyTickerCache(edgar, FakeCompanyTickerFallback(), fallbackEnabled = false)
    }
}
