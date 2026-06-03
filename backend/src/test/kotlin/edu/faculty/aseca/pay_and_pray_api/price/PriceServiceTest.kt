package edu.faculty.aseca.pay_and_pray_api.price

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertNull

class PriceServiceTest {
    private lateinit var repository: FakeBatchRunRepository
    private lateinit var service: PriceService

    @BeforeEach
    fun setUp() {
        repository = FakeBatchRunRepository()
        service = PriceServiceImpl(FakePriceRepository(), repository)
    }

    @Test
    fun `returns lastUpdated from most recent successful run`() {
        val completedAt = Instant.parse("2026-05-23T14:30:00Z")
        repository.add(batchRun(status = "SUCCESS", completedAt = completedAt))

        val result = service.getLastUpdated()

        assertEquals(completedAt, result.lastUpdated)
        assertNull(result.message)
    }

    @Test
    fun `returns null lastUpdated with message when no runs exist`() {
        val result = service.getLastUpdated()

        assertNull(result.lastUpdated)
        assertEquals("El proceso nunca fue ejecutado", result.message)
    }

    @Test
    fun `ignores failed runs and returns last successful completed_at`() {
        val successAt = Instant.parse("2026-05-20T10:00:00Z")
        repository.add(batchRun(status = "SUCCESS", completedAt = successAt))
        repository.add(batchRun(status = "FAILURE", completedAt = null))

        val result = service.getLastUpdated()

        assertEquals(successAt, result.lastUpdated)
    }

    @Test
    fun `returns null with message when only failed runs exist`() {
        repository.add(batchRun(status = "FAILURE", completedAt = null))

        val result = service.getLastUpdated()

        assertNull(result.lastUpdated)
        assertEquals("El proceso nunca fue ejecutado", result.message)
    }

    @Test
    fun `returns the most recent completed_at when multiple successes exist`() {
        val olderAt = Instant.parse("2026-05-20T10:00:00Z")
        val newerAt = Instant.parse("2026-05-23T14:30:00Z")
        repository.add(batchRun(status = "SUCCESS", completedAt = olderAt))
        repository.add(batchRun(status = "SUCCESS", completedAt = newerAt))

        val result = service.getLastUpdated()

        assertEquals(newerAt, result.lastUpdated)
    }

    private fun batchRun(
        status: String,
        completedAt: Instant?,
    ) = BatchRun(
        id = UUID.randomUUID(),
        startedAt = Instant.now(),
        completedAt = completedAt,
        status = status,
    )
}

private class FakePriceRepository : PriceRepository {
    override fun findByTicker(ticker: String): Price? = null
}

private class FakeBatchRunRepository : BatchRunRepository {
    private val runs = mutableListOf<BatchRun>()

    fun add(run: BatchRun) {
        runs.add(run)
    }

    override fun findTopSuccessCompletedAt(): Instant? =
        runs
            .filter { it.status == "SUCCESS" && it.completedAt != null }
            .maxByOrNull { it.completedAt!! }
            ?.completedAt
}
