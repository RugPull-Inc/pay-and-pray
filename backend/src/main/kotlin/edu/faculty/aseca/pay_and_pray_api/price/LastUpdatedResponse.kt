package edu.faculty.aseca.pay_and_pray_api.price

import com.fasterxml.jackson.annotation.JsonInclude
import java.time.Instant

data class LastUpdatedResponse(
    val lastUpdated: Instant? = null,
    @get:JsonInclude(JsonInclude.Include.NON_NULL)
    val message: String? = null,
)
