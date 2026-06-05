package edu.faculty.aseca.pay_and_pray_api.price

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class StartupPriceRefresh(
    private val batchTriggerService: BatchTriggerService,
    @Value("\${prices.refresh-on-startup.enabled:true}") private val enabled: Boolean,
) {
    private val logger = LoggerFactory.getLogger(StartupPriceRefresh::class.java)

    @EventListener(ApplicationReadyEvent::class)
    fun refreshPrices() {
        if (!enabled) {
            logger.info("Startup price refresh disabled")
            return
        }

        try {
            batchTriggerService.trigger()
            logger.info("Startup price refresh triggered")
        } catch (e: Exception) {
            logger.warn("Startup price refresh failed: {}", e.message)
        }
    }
}
