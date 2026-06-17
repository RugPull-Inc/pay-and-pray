package edu.faculty.aseca.pay_and_pray_api.watchlist

import edu.faculty.aseca.pay_and_pray_api.watchlist.compare.WatchlistCompareService
import edu.faculty.aseca.pay_and_pray_api.watchlist.compare.dto.WatchlistCompareResponse
import edu.faculty.aseca.pay_and_pray_api.watchlist.dto.AddTickerRequest
import edu.faculty.aseca.pay_and_pray_api.watchlist.dto.TickerResponse
import edu.faculty.aseca.pay_and_pray_api.watchlist.dto.WatchlistResponse
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@Validated
@RestController
@RequestMapping("/watchlist")
class WatchlistController(
    private val watchlistService: WatchlistService,
    private val watchlistCompareService: WatchlistCompareService,
) {
    @PostMapping
    fun addTicker(
        @Valid @RequestBody request: AddTickerRequest,
        authentication: Authentication,
    ): ResponseEntity<TickerResponse> {
        val userId = UUID.fromString(authentication.principal as String)
        val wasAdded = watchlistService.addTicker(userId, request.ticker)
        val status = if (wasAdded) 201 else 200
        return ResponseEntity.status(status).body(TickerResponse(ticker = request.ticker))
    }

    @DeleteMapping("/{ticker}")
    fun removeTicker(
        @PathVariable ticker: String,
        authentication: Authentication,
    ): ResponseEntity<TickerResponse> {
        val userId = UUID.fromString(authentication.principal as String)
        watchlistService.removeTicker(userId, ticker)
        return ResponseEntity.ok(TickerResponse(ticker = ticker))
    }

    @GetMapping
    fun getWatchlist(authentication: Authentication): WatchlistResponse {
        val userId = UUID.fromString(authentication.principal as String)
        return WatchlistResponse(items = watchlistService.getWatchlist(userId))
    }

    @GetMapping("/compare")
    fun compare(
        @NotBlank @RequestParam ticker1: String,
        @NotBlank @RequestParam ticker2: String,
        authentication: Authentication,
    ): WatchlistCompareResponse {
        val userId = UUID.fromString(authentication.principal as String)
        return watchlistCompareService.compare(userId, ticker1, ticker2)
    }
}
