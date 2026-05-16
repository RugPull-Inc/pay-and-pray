package edu.faculty.aseca.pay_and_pray_api.company

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/companies")
class CompanyController(
    private val service: CompanyService,
    private val detailsService: CompanyDetailsService,
) {
    @GetMapping("/search")
    fun search(
        @RequestParam q: String,
    ): CompanySearchResponse = service.search(q)

    @GetMapping("/{cik}/details")
    fun details(
        @PathVariable cik: String,
    ): CompanyDetailsResponse = detailsService.getDetails(cik)
}
