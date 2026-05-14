package edu.faculty.aseca.pay_and_pray_api.user

import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class UserController {
    @GetMapping("/me")
    fun me(authentication: Authentication): UserResponse = UserResponse(userId = authentication.principal as String)
}

data class UserResponse(
    val userId: String,
)
