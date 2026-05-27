package edu.faculty.aseca.pay_and_pray_api.portfolio

import edu.faculty.aseca.pay_and_pray_api.portfolio.buy.BuyService
import edu.faculty.aseca.pay_and_pray_api.portfolio.dto.BuyRequest
import edu.faculty.aseca.pay_and_pray_api.portfolio.dto.BuyResponse
import edu.faculty.aseca.pay_and_pray_api.portfolio.dto.SellRequest
import edu.faculty.aseca.pay_and_pray_api.portfolio.dto.SellResponse
import edu.faculty.aseca.pay_and_pray_api.portfolio.sell.SellService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/portfolio")
class PortfolioController(
    private val buyService: BuyService,
    private val sellService: SellService,
) {
    @PostMapping("/buy")
    fun buy(
        @Valid @RequestBody request: BuyRequest,
        authentication: Authentication,
    ): ResponseEntity<BuyResponse> {
        val userId = UUID.fromString(authentication.principal as String)
        return ResponseEntity.status(201).body(buyService.buy(userId, request.ticker, request.quantity))
    }

    @PostMapping("/sell")
    fun sell(
        @Valid @RequestBody request: SellRequest,
        authentication: Authentication,
    ): ResponseEntity<SellResponse> {
        val userId = UUID.fromString(authentication.principal as String)
        return ResponseEntity.ok(sellService.sell(userId, request.ticker, request.quantity))
    }
}
