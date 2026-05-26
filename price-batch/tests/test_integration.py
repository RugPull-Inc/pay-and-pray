"""
Integration tests — hit real Yahoo Finance and a real Postgres (testcontainers).
Run with: pytest tests/test_integration.py -m integration
Requires Docker and network access.
"""
import os
import sys
import pytest
import psycopg2

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import batch as b

pytest.importorskip("testcontainers", reason="testcontainers not installed")
from testcontainers.postgres import PostgresContainer

SCHEMA = """
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE prices (
        ticker     VARCHAR(20) PRIMARY KEY,
        price      DECIMAL(12, 4) NOT NULL,
        fetched_at TIMESTAMP WITH TIME ZONE NOT NULL
    );

    CREATE TABLE batch_runs (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        started_at    TIMESTAMP WITH TIME ZONE NOT NULL,
        completed_at  TIMESTAMP WITH TIME ZONE,
        status        VARCHAR(10) NOT NULL,
        error_summary TEXT
    );

    CREATE TABLE positions (
        id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticker VARCHAR(20) NOT NULL
    );

    CREATE TABLE watchlist_items (
        id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticker VARCHAR(20) NOT NULL
    );
"""


@pytest.fixture(scope="module")
def pg():
    with PostgresContainer("postgres:16") as container:
        conn = psycopg2.connect(
            host=container.get_container_host_ip(),
            port=container.get_exposed_port(5432),
            dbname=container.dbname,
            user=container.username,
            password=container.password,
        )
        with conn.cursor() as cur:
            cur.execute(SCHEMA)
        conn.commit()
        conn.close()

        os.environ["DB_HOST"] = container.get_container_host_ip()
        os.environ["DB_PORT"] = str(container.get_exposed_port(5432))
        os.environ["DB_NAME"] = container.dbname
        os.environ["DB_USER"] = container.username
        os.environ["DB_PASSWORD"] = container.password

        yield container


@pytest.mark.integration
def test_batch_fetches_aapl_price_and_persists_in_db(pg):
    conn = psycopg2.connect(
        host=pg.get_container_host_ip(),
        port=pg.get_exposed_port(5432),
        dbname=pg.dbname,
        user=pg.username,
        password=pg.password,
    )
    with conn.cursor() as cur:
        cur.execute("DELETE FROM prices")
        cur.execute("DELETE FROM batch_runs")
        cur.execute("DELETE FROM positions")
        cur.execute("INSERT INTO positions (ticker) VALUES ('AAPL')")
    conn.commit()
    conn.close()

    success = b.run_batch()

    assert success is True

    conn = psycopg2.connect(
        host=pg.get_container_host_ip(),
        port=pg.get_exposed_port(5432),
        dbname=pg.dbname,
        user=pg.username,
        password=pg.password,
    )
    with conn.cursor() as cur:
        cur.execute("SELECT price FROM prices WHERE ticker = 'AAPL'")
        row = cur.fetchone()
        cur.execute("SELECT status, completed_at FROM batch_runs ORDER BY started_at DESC LIMIT 1")
        run = cur.fetchone()
    conn.close()

    assert row is not None, "AAPL price not found in DB"
    assert float(row[0]) > 0, "Price should be positive"
    assert run[0] == "SUCCESS"
    assert run[1] is not None, "completed_at should be set on success"
