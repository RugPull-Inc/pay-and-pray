package edu.faculty.aseca.pay_and_pray_api.dev

import edu.faculty.aseca.pay_and_pray_api.trackedticker.FakeTrackedTickerRepository
import edu.faculty.aseca.pay_and_pray_api.trackedticker.TrackedTicker
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import org.springframework.boot.DefaultApplicationArguments
import org.springframework.core.io.DefaultResourceLoader
import java.nio.file.Path
import kotlin.io.path.writeText
import kotlin.test.assertEquals

class TrackedTickerDevSeederTest {
    private val args = DefaultApplicationArguments(*emptyArray<String>())

    @Test
    fun `seeds tracked tickers from file`(
        @TempDir tempDir: Path,
    ) {
        val repo = FakeTrackedTickerRepository()
        val file = tempDir.resolve("tracked-tickers.txt")
        file.writeText(
            """
            AAPL
            msft
            # comment

            gme
            """.trimIndent(),
        )

        val seeder =
            TrackedTickerDevSeeder(
                repo,
                DefaultResourceLoader(),
                enabled = true,
                resourcePath = "file:${file.toAbsolutePath()}",
            )

        seeder.run(args)

        assertEquals(setOf("AAPL", "MSFT", "GME"), repo.store.keys)
        assertEquals("DEV_SEED", repo.store["AAPL"]?.source)
    }

    @Test
    fun `seeding is idempotent`(
        @TempDir tempDir: Path,
    ) {
        val repo = FakeTrackedTickerRepository()
        repo.save(TrackedTicker(ticker = "AAPL", source = "DEV_SEED"))
        val file = tempDir.resolve("tracked-tickers.txt")
        file.writeText("AAPL\nMSFT\n")

        val seeder =
            TrackedTickerDevSeeder(
                repo,
                DefaultResourceLoader(),
                enabled = true,
                resourcePath = "file:${file.toAbsolutePath()}",
            )

        seeder.run(args)
        seeder.run(args)

        assertEquals(2, repo.store.size)
        assertEquals(setOf("AAPL", "MSFT"), repo.store.keys)
    }

    @Test
    fun `disabled seeder does nothing`(
        @TempDir tempDir: Path,
    ) {
        val repo = FakeTrackedTickerRepository()
        val file = tempDir.resolve("tracked-tickers.txt")
        file.writeText("AAPL\nMSFT\n")

        val seeder =
            TrackedTickerDevSeeder(
                repo,
                DefaultResourceLoader(),
                enabled = false,
                resourcePath = "file:${file.toAbsolutePath()}",
            )

        seeder.run(args)

        assertEquals(0, repo.store.size)
    }
}
