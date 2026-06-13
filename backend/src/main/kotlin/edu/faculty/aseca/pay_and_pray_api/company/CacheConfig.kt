package edu.faculty.aseca.pay_and_pray_api.company

import com.github.benmanes.caffeine.cache.Caffeine
import org.springframework.cache.CacheManager
import org.springframework.cache.annotation.EnableCaching
import org.springframework.cache.caffeine.CaffeineCache
import org.springframework.cache.support.SimpleCacheManager
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.util.concurrent.TimeUnit

@Configuration
@EnableCaching
class CacheConfig {
    @Bean
    fun cacheManager(): CacheManager =
        SimpleCacheManager().apply {
            setCaches(
                listOf(
                    CaffeineCache(
                        COMPANY_DETAILS_CACHE,
                        Caffeine.newBuilder().expireAfterWrite(1, TimeUnit.HOURS).build(),
                    ),
                    CaffeineCache(
                        COMPANY_TICKERS_CACHE,
                        Caffeine.newBuilder().expireAfterWrite(24, TimeUnit.HOURS).build(),
                    ),
                ),
            )
        }

    companion object {
        const val COMPANY_DETAILS_CACHE = "companyDetails"
        const val COMPANY_TICKERS_CACHE = "companyTickers"
    }
}
