package edu.faculty.aseca.pay_and_pray_api.price

import org.springframework.stereotype.Service

@Service
class PriceService(
    private val batchRunRepository: BatchRunRepository,
) {
    fun getLastUpdated(): LastUpdatedResponse {
        val completedAt = batchRunRepository.findTopSuccessCompletedAt()
        return if (completedAt != null) {
            LastUpdatedResponse(lastUpdated = completedAt)
        } else {
            LastUpdatedResponse(lastUpdated = null, message = "El proceso nunca fue ejecutado")
        }
    }
}
