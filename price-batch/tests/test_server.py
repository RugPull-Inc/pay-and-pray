import http.client
import sys
import os
import threading
from unittest.mock import patch

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def _single_request_server():
    from http.server import HTTPServer
    import server

    srv = HTTPServer(("127.0.0.1", 0), server.BatchHandler)
    t = threading.Thread(target=srv.handle_request, daemon=True)
    t.start()
    return srv


@patch("batch.run_batch", return_value=True)
def test_post_trigger_returns_200_on_success(mock_run):
    srv = _single_request_server()
    port = srv.server_address[1]

    conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
    conn.request("POST", "/trigger")
    resp = conn.getresponse()

    assert resp.status == 200
    mock_run.assert_called_once()
    srv.server_close()


@patch("batch.run_batch", return_value=False)
def test_post_trigger_returns_500_on_failure(mock_run):
    srv = _single_request_server()
    port = srv.server_address[1]

    conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
    conn.request("POST", "/trigger")
    resp = conn.getresponse()

    assert resp.status == 500
    srv.server_close()


def test_post_unknown_path_returns_404():
    srv = _single_request_server()
    port = srv.server_address[1]

    conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
    conn.request("POST", "/unknown")
    resp = conn.getresponse()

    assert resp.status == 404
    srv.server_close()


def test_get_health_returns_200():
    srv = _single_request_server()
    port = srv.server_address[1]

    conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
    conn.request("GET", "/health")
    resp = conn.getresponse()

    assert resp.status == 200
    srv.server_close()
