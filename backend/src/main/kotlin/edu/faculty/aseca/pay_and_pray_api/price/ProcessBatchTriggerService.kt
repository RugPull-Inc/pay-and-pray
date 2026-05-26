package edu.faculty.aseca.pay_and_pray_api.price

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class ProcessBatchTriggerService(
    @Value("\${batch.script-path:batch.py}") private val scriptPath: String,
) : BatchTriggerService {
    override fun trigger() {
        ProcessBuilder("python", scriptPath)
            .inheritIO()
            .start()
    }
}
