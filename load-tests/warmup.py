"""
Warm-up previo a la corrida de Locust. Solo stdlib (no instala nada).

Hace dos cosas para que las pruebas NO peguen a EDGAR ni fallen por falta de datos:
  1. POST /admin/prices/refresh  -> dispara el batch de precios (Yahoo Finance)
     para que los tickers tengan precio almacenado (necesario para 'buy').
  2. GET  /companies/search      -> warmea el ticker cache (un unico hit a EDGAR;
     despues queda cacheado 24h y la busqueda sirve desde cache).

Uso:
  python warmup.py                       # usa http://localhost:8080
  HOST=http://localhost:8080 python warmup.py
"""

import json
import os
import time
import urllib.request

HOST = os.environ.get("HOST", "http://localhost:8080")


def _request(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        f"{HOST}{path}",
        data=data,
        method=method,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.status, resp.read().decode()


def main():
    print(f"[warmup] host = {HOST}")

    print("[warmup] 1/2 disparando refresh de precios (POST /admin/prices/refresh)...")
    try:
        status, _ = _request("POST", "/admin/prices/refresh")
        print(f"[warmup]     -> {status} (202 = aceptado, el batch corre async)")
    except Exception as e:  # noqa: BLE001
        print(f"[warmup]     ! fallo el refresh: {e}")

    # Dar tiempo al batch a traer y persistir precios antes de buscar/comprar.
    print("[warmup]     esperando 15s a que el batch persista precios...")
    time.sleep(15)

    print("[warmup] 2/2 warmeando ticker cache (GET /companies/search)...")
    try:
        status, body = _request("GET", "/companies/search?q=AAP")
        n = len(json.loads(body).get("results", []))
        print(f"[warmup]     -> {status}, {n} resultados (ticker cache caliente)")
    except Exception as e:  # noqa: BLE001
        print(f"[warmup]     ! fallo la busqueda: {e}")

    print("[warmup] listo. Ya podes correr Locust.")


if __name__ == "__main__":
    main()
