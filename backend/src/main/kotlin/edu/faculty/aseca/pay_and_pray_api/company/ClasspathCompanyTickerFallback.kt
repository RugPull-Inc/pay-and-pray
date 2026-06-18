package edu.faculty.aseca.pay_and_pray_api.company

import com.fasterxml.jackson.databind.ObjectMapper
import edu.faculty.aseca.pay_and_pray_api.edgar.CompanyTicker
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.ResourceLoader
import org.springframework.stereotype.Component

@Component
class ClasspathCompanyTickerFallback(
    private val resourceLoader: ResourceLoader,
    private val objectMapper: ObjectMapper,
    @Value("\${edgar.tickers-fallback.resource:classpath:dev/company-tickers-fallback.json}")
    private val resourcePath: String,
) : CompanyTickerFallback {
    // Parsed with readTree (not constructor binding) so it does not depend on
    // the Kotlin / parameter-names Jackson modules being registered.
    override fun load(): Map<String, CompanyTicker> {
        val root =
            resourceLoader
                .getResource(resourcePath)
                .inputStream
                .use { objectMapper.readTree(it) }

        val tickers = LinkedHashMap<String, CompanyTicker>()
        root.fields().forEach { (key, node) ->
            tickers[key] =
                CompanyTicker(
                    cikStr = node.get("cik_str").asInt(),
                    name = node.get("title").asText(),
                    ticker = node.get("ticker").asText(),
                )
        }
        return tickers
    }
}
