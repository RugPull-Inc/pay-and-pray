package edu.faculty.aseca.pay_and_pray_api.company

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/companies")
class CompanyController(private val service: CompanyService) {

    @GetMapping("/search")
    fun search(@RequestParam q: String): CompanySearchResponse = service.search(q)
}
