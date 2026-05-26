package edu.faculty.aseca.pay_and_pray_api.price

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class PriceController(
    private val batchTriggerService: BatchTriggerService,
    private val priceService: PriceService,
) {
    @PostMapping("/admin/prices/refresh")
    fun triggerRefresh(): ResponseEntity<Void> =
        try {
            batchTriggerService.trigger()
            ResponseEntity.accepted().build()
        } catch (e: Exception) {
            ResponseEntity.internalServerError().build()
        }

    @GetMapping("/prices/last-updated")
    fun lastUpdated(): ResponseEntity<LastUpdatedResponse> = ResponseEntity.ok(priceService.getLastUpdated())
}
