import sys
import os
import pytest
from unittest.mock import MagicMock, patch, call
import pandas as pd
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import batch as b


# ── helpers ──────────────────────────────────────────────────────────────────

def _make_close_df(ticker_prices: dict) -> pd.DataFrame:
    """MultiIndex DataFrame as yfinance returns for a list of tickers."""
    tickers = list(ticker_prices.keys())
    columns = pd.MultiIndex.from_tuples([("Close", t) for t in tickers])
    return pd.DataFrame([[ticker_prices[t] for t in tickers]], columns=columns)


# ── collect_tickers ───────────────────────────────────────────────────────────

def test_collect_tickers_deduplicates_across_tables():
    conn = MagicMock()
    cur = conn.cursor.return_value.__enter__.return_value
    cur.fetchall.return_value = [("AAPL",), ("MSFT",), ("AAPL",)]

    result = b.collect_tickers(conn)

    assert set(result) == {"AAPL", "MSFT"}
    assert len(result) == 2


def test_collect_tickers_queries_both_tables():
    conn = MagicMock()
    cur = conn.cursor.return_value.__enter__.return_value
    cur.fetchall.return_value = []

    b.collect_tickers(conn)

    sql = cur.execute.call_args[0][0]
    assert "positions" in sql.lower()
    assert "watchlist_items" in sql.lower()


def test_collect_tickers_returns_empty_when_no_data():
    conn = MagicMock()
    cur = conn.cursor.return_value.__enter__.return_value
    cur.fetchall.return_value = []

    assert b.collect_tickers(conn) == []


# ── fetch_prices ──────────────────────────────────────────────────────────────

@patch("batch.yf")
def test_fetch_prices_returns_close_price_per_ticker(mock_yf):
    mock_yf.download.return_value = _make_close_df({"AAPL": 185.50, "MSFT": 420.00})

    result = b.fetch_prices(["AAPL", "MSFT"])

    assert result["AAPL"] == pytest.approx(185.50)
    assert result["MSFT"] == pytest.approx(420.00)


@patch("batch.yf")
def test_fetch_prices_omits_ticker_with_no_data(mock_yf):
    mock_yf.download.return_value = _make_close_df({"AAPL": 185.50})

    result = b.fetch_prices(["AAPL", "INVALID_XYZ"])

    assert "AAPL" in result
    assert "INVALID_XYZ" not in result


def test_fetch_prices_returns_empty_dict_for_empty_list():
    result = b.fetch_prices([])
    assert result == {}


# ── upsert_price ──────────────────────────────────────────────────────────────

def test_upsert_price_executes_insert_on_conflict():
    conn = MagicMock()
    cur = conn.cursor.return_value.__enter__.return_value

    b.upsert_price(conn, "AAPL", 185.50)

    sql, params = cur.execute.call_args[0]
    assert "INSERT INTO prices" in sql
    assert "ON CONFLICT" in sql
    assert params[0] == "AAPL"
    assert params[1] == pytest.approx(185.50)
    conn.commit.assert_called_once()


# ── record_batch_run ──────────────────────────────────────────────────────────

def test_record_batch_run_sets_completed_at_on_success():
    conn = MagicMock()
    cur = conn.cursor.return_value.__enter__.return_value
    started = datetime.now(timezone.utc)

    b.record_batch_run(conn, started, "SUCCESS")

    _, params = cur.execute.call_args[0]
    assert params[2] == "SUCCESS"
    assert params[1] is not None


def test_record_batch_run_leaves_completed_at_null_on_failure():
    conn = MagicMock()
    cur = conn.cursor.return_value.__enter__.return_value
    started = datetime.now(timezone.utc)

    b.record_batch_run(conn, started, "FAILURE", "fatal error")

    _, params = cur.execute.call_args[0]
    assert params[2] == "FAILURE"
    assert params[1] is None


def test_record_batch_run_stores_error_summary():
    conn = MagicMock()
    cur = conn.cursor.return_value.__enter__.return_value
    started = datetime.now(timezone.utc)

    b.record_batch_run(conn, started, "FAILURE", "DB unreachable")

    _, params = cur.execute.call_args[0]
    assert params[3] == "DB unreachable"


# ── run_batch ─────────────────────────────────────────────────────────────────

@patch("batch.yf")
@patch("batch.get_db_connection")
def test_run_batch_returns_true_on_success(mock_get_conn, mock_yf):
    conn = MagicMock()
    mock_get_conn.return_value = conn
    cur = conn.cursor.return_value.__enter__.return_value
    cur.fetchall.return_value = [("AAPL",)]
    mock_yf.download.return_value = _make_close_df({"AAPL": 185.50})

    assert b.run_batch() is True


@patch("batch.yf")
@patch("batch.get_db_connection")
def test_run_batch_ticker_with_no_price_does_not_interrupt_others(mock_get_conn, mock_yf):
    conn = MagicMock()
    mock_get_conn.return_value = conn
    cur = conn.cursor.return_value.__enter__.return_value
    cur.fetchall.return_value = [("AAPL",), ("INVALID_XYZ",)]
    mock_yf.download.return_value = _make_close_df({"AAPL": 185.50})

    result = b.run_batch()

    assert result is True
    price_inserts = [c for c in cur.execute.call_args_list if "INSERT INTO prices" in str(c)]
    assert len(price_inserts) == 1


@patch("batch.yf")
@patch("batch.get_db_connection")
def test_run_batch_records_success_status(mock_get_conn, mock_yf):
    conn = MagicMock()
    mock_get_conn.return_value = conn
    cur = conn.cursor.return_value.__enter__.return_value
    cur.fetchall.return_value = [("AAPL",)]
    mock_yf.download.return_value = _make_close_df({"AAPL": 185.50})

    b.run_batch()

    batch_run_calls = [c for c in cur.execute.call_args_list if "INSERT INTO batch_runs" in str(c)]
    assert len(batch_run_calls) == 1
    _, params = batch_run_calls[0][0]
    assert params[2] == "SUCCESS"
    assert params[1] is not None  # completed_at set


@patch("batch.get_db_connection")
def test_run_batch_returns_false_on_db_connection_failure(mock_get_conn):
    mock_get_conn.side_effect = Exception("Connection refused")

    assert b.run_batch() is False


@patch("batch.yf")
@patch("batch.get_db_connection")
def test_run_batch_records_failure_without_completed_at_on_fatal_error(mock_get_conn, mock_yf):
    conn = MagicMock()
    mock_get_conn.return_value = conn
    cur = conn.cursor.return_value.__enter__.return_value
    cur.fetchall.side_effect = Exception("DB error")

    result = b.run_batch()

    assert result is False
    batch_run_calls = [c for c in cur.execute.call_args_list if "INSERT INTO batch_runs" in str(c)]
    assert len(batch_run_calls) == 1
    _, params = batch_run_calls[0][0]
    assert params[2] == "FAILURE"
    assert params[1] is None  # completed_at NOT set
