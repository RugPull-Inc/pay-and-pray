package edu.faculty.aseca.pay_and_pray_api.me

import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class MeController {

    @GetMapping("/me")
    fun me(authentication: Authentication): MeResponse =
        MeResponse(userId = authentication.principal as String)
}

data class MeResponse(val userId: String)
