package edu.faculty.aseca.pay_and_pray_api.dev

import edu.faculty.aseca.pay_and_pray_api.trackedticker.TrackedTicker
import edu.faculty.aseca.pay_and_pray_api.trackedticker.TrackedTickerRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.core.io.ResourceLoader
import org.springframework.stereotype.Component

@Component
class TrackedTickerDevSeeder(
    private val trackedTickerRepository: TrackedTickerRepository,
    private val resourceLoader: ResourceLoader,
    @Value("\${seed.tracked-tickers.enabled:true}") private val enabled: Boolean,
    @Value("\${seed.tracked-tickers.resource:classpath:dev/tracked-tickers.txt}") private val resourcePath: String,
) : ApplicationRunner {
    private val logger = LoggerFactory.getLogger(TrackedTickerDevSeeder::class.java)

    override fun run(args: ApplicationArguments) {
        if (!enabled) {
            logger.info("Tracked ticker seeding disabled")
            return
        }

        val tickers =
            try {
                loadTickers()
            } catch (e: Exception) {
                logger.warn("Failed to load tracked ticker seed from {}: {}", resourcePath, e.message)
                return
            }

        var inserted = 0
        var skipped = 0

        for (ticker in tickers) {
            if (trackedTickerRepository.findByTicker(ticker) != null) {
                skipped++
                continue
            }
            trackedTickerRepository.save(TrackedTicker(ticker = ticker, source = "DEV_SEED"))
            inserted++
        }

        logger.info("Tracked ticker seed completed: inserted={}, skipped={}", inserted, skipped)
    }

    private fun loadTickers(): List<String> =
        resourceLoader
            .getResource(resourcePath)
            .inputStream
            .bufferedReader()
            .useLines { lines ->
                lines
                    .map { it.trim() }
                    .filter { it.isNotEmpty() && !it.startsWith("#") }
                    .map { it.uppercase() }
                    .distinct()
                    .toList()
            }
}
