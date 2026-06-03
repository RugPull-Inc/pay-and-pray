#!/usr/bin/env python3
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

import batch as b


class BatchHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != "/health":
            self.send_response(404)
            self.end_headers()
            return
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path != "/trigger":
            self.send_response(404)
            self.end_headers()
            return
        success = b.run_batch()
        self.send_response(200 if success else 500)
        self.end_headers()

    def log_message(self, fmt, *args):
        pass


def main():
    port = int(os.environ.get("BATCH_PORT", "8081"))
    with HTTPServer(("0.0.0.0", port), BatchHandler) as httpd:
        print(f"Batch server listening on port {port}", flush=True)
        httpd.serve_forever()


if __name__ == "__main__":
    main()
