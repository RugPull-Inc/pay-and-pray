package edu.faculty.aseca.pay_and_pray_api.company

import edu.faculty.aseca.pay_and_pray_api.edgar.EdgarApiException
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/companies")
class CompanySearchController(private val service: CompanySearchService) {

    @GetMapping("/search")
    fun search(@RequestParam q: String): CompanySearchResponse = service.search(q)

    @ExceptionHandler(EdgarApiException::class)
    fun handleEdgarUnavailable(e: EdgarApiException): ResponseEntity<Map<String, String>> =
        ResponseEntity.status(503).body(mapOf("error" to "EDGAR service unavailable. Please try again later."))
}
