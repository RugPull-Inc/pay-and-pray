#!/usr/bin/env python3
import os
import sys
from datetime import datetime, timezone

import pandas as pd
import psycopg2
import yfinance as yf


def get_db_connection():
    return psycopg2.connect(
        host=os.environ["DB_HOST"],
        port=os.environ.get("DB_PORT", "5432"),
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
    )


def collect_tickers(conn) -> list[str]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT ticker FROM positions "
            "UNION "
            "SELECT ticker FROM watchlist_items"
        )
        rows = cur.fetchall()
    return list({row[0] for row in rows})


def fetch_prices(tickers: list[str]) -> dict[str, float]:
    if not tickers:
        return {}

    data = yf.download(tickers, period="1d", auto_adjust=True, progress=False)
    prices: dict[str, float] = {}

    try:
        if isinstance(data.columns, pd.MultiIndex):
            close_df = data["Close"]
            for ticker in tickers:
                if ticker in close_df.columns:
                    series = close_df[ticker].dropna()
                    if not series.empty:
                        prices[ticker] = float(series.iloc[-1])
        elif "Close" in data.columns and len(tickers) == 1:
            series = data["Close"].dropna()
            if not series.empty:
                prices[tickers[0]] = float(series.iloc[-1])
    except (KeyError, IndexError, TypeError, AttributeError):
        pass

    return prices


def upsert_prices(conn, prices: dict[str, float]) -> None:
    if not prices:
        return
    rows = [(ticker, price, datetime.now(timezone.utc)) for ticker, price in prices.items()]
    with conn.cursor() as cur:
        cur.executemany(
            """
            INSERT INTO prices (ticker, price, fetched_at)
            VALUES (%s, %s, %s)
            ON CONFLICT (ticker) DO UPDATE
            SET price = EXCLUDED.price, fetched_at = EXCLUDED.fetched_at
            """,
            rows,
        )
    conn.commit()


def record_batch_run(
    conn,
    started_at: datetime,
    status: str,
    error_summary: str | None = None,
) -> None:
    completed_at = datetime.now(timezone.utc) if status == "SUCCESS" else None
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO batch_runs (started_at, completed_at, status, error_summary)
            VALUES (%s, %s, %s, %s)
            """,
            (started_at, completed_at, status, error_summary),
        )
    conn.commit()


def run_batch() -> bool:
    started_at = datetime.now(timezone.utc)
    conn = None
    try:
        conn = get_db_connection()
        tickers = collect_tickers(conn)
        prices = fetch_prices(tickers)

        missing = [t for t in tickers if t not in prices]
        for t in missing:
            print(f"WARN: No price for {t}", file=sys.stderr)

        upsert_prices(conn, {t: prices[t] for t in tickers if t in prices})

        error_summary = "; ".join(f"No price for {t}" for t in missing) if missing else None
        record_batch_run(conn, started_at, "SUCCESS", error_summary)
        return True
    except Exception as exc:
        print(f"ERROR: Batch failed: {exc}", file=sys.stderr)
        if conn is not None:
            try:
                record_batch_run(conn, started_at, "FAILURE", str(exc))
            except Exception:
                pass
        return False
    finally:
        if conn is not None:
            conn.close()


if __name__ == "__main__":
    success = run_batch()
    sys.exit(0 if success else 1)
