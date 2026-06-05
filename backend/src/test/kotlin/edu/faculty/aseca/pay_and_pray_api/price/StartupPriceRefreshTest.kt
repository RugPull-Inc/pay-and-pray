package edu.faculty.aseca.pay_and_pray_api.price

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class StartupPriceRefreshTest {
    @Test
    fun `refresh triggers batch when enabled`() {
        val batchTrigger = FakeBatchTriggerService()
        val refresh = StartupPriceRefresh(batchTrigger, enabled = true)

        refresh.refreshPrices()

        assertEquals(1, batchTrigger.calls)
    }

    @Test
    fun `refresh skips batch when disabled`() {
        val batchTrigger = FakeBatchTriggerService()
        val refresh = StartupPriceRefresh(batchTrigger, enabled = false)

        refresh.refreshPrices()

        assertEquals(0, batchTrigger.calls)
    }

    @Test
    fun `refresh does not fail startup when batch trigger fails`() {
        val refresh = StartupPriceRefresh(FailingBatchTriggerService(), enabled = true)

        refresh.refreshPrices()
    }
}

private class FakeBatchTriggerService : BatchTriggerService {
    var calls = 0

    override fun trigger() {
        calls++
    }
}

private class FailingBatchTriggerService : BatchTriggerService {
    override fun trigger(): Unit = throw RuntimeException("price-batch unreachable")
}
