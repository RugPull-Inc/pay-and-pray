"""
Locust load & stress test para la API de Pay & Pray.

Workflows (US 6.7 - 6.10 de docs/features/06_rendimiento_carga.feature):
  1. Register + Login -> POST /auth/register + /auth/login  (en on_start, 1 vez por usuario)
  2. Search           -> GET  /companies/search             (read, cache warm)
  3. View portfolio   -> GET  /portfolio                    (read, P&L)
  4. Buy              -> POST /portfolio/buy                (write)
  5. Sell-not-owned   -> POST /portfolio/sell               (error path -> 4xx ESPERADO)

Modo realista: cada virtual user crea SU PROPIA cuenta y se loguea (sin pool de tokens
compartido) -> cero contencion de escritura, cada portfolio independiente. El costo es
bcrypt (register+login) al spawnear cada usuario; Locust lo reporta en filas /auth/*
separadas de los workflows.

Workflow 5: la consigna exige virtual users que fallan al vender acciones que nunca
compraron. El 4xx es el comportamiento CORRECTO -> se marca como exito esperado y NO
infla el error rate. Solo 5xx y fallos de conexion/timeout cuentan como fallo real.

Antes de correr: levantar el stack (2 cores) y warmear (ver PLAN.md / warmup.py).
"""

import os
import random
import uuid

from locust import HttpUser, between, task

# Think-time entre acciones de un usuario, configurable por env. Default realista;
# en las corridas se usa 0 (WAIT_MIN=0 WAIT_MAX=0) para maxima presion por usuario.
WAIT_MIN = float(os.environ.get("WAIT_MIN", 0.5))
WAIT_MAX = float(os.environ.get("WAIT_MAX", 2.0))

# Timeout por request en segundos (0/unset = sin timeout). Bajo sobrecarga, hace que
# los requests colgados cuenten como FALLO explicito en vez de latencia ilegible.
REQUEST_TIMEOUT = float(os.environ.get("REQUEST_TIMEOUT", 0)) or None

PASSWORD = "password123"  # mismo que usa el DevDataSeeder del backend

# Tickers seedeados (backend/src/main/resources/dev/tracked-tickers.txt): tienen precio
# almacenado tras el warm-up, asi que buy/search funcionan.
TICKERS = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA", "JPM", "V", "NFLX"]

# Ticker para el workflow 5: esta en tracked-tickers (tiene precio) pero NUNCA se compra
# (no esta en TICKERS) -> el 4xx por "no poseido" es 100% confiable.
NEVER_OWNED_TICKER = "ORCL"

# Prefijos de busqueda (caen sobre el ticker cache, no EDGAR).
SEARCH_QUERIES = ["AAP", "MS", "GOO", "AMZ", "MET", "NVD", "TSL", "JPM", "NFL", "ORC"]


class PayAndPrayUser(HttpUser):
    # Pausa entre acciones de un mismo usuario (configurable, ver WAIT_MIN/MAX).
    wait_time = between(WAIT_MIN, WAIT_MAX)

    def on_start(self):
        """Cada virtual user crea su propia cuenta y se loguea (modo realista)."""
        self.token = None
        self.email = f"loadtest-{uuid.uuid4().hex[:12]}@rugpull.com"

        # Registro: 201 si es nuevo, 409 si ya existe (ambos OK para seguir al login).
        with self.client.post(
            "/auth/register",
            json={"email": self.email, "password": PASSWORD},
            name="POST /auth/register",
            catch_response=True,
        ) as resp:
            if resp.status_code in (201, 409):
                resp.success()
            else:
                resp.failure(f"register inesperado: {resp.status_code}")

        # Login -> guardar token para los endpoints autenticados.
        with self.client.post(
            "/auth/login",
            json={"email": self.email, "password": PASSWORD},
            name="POST /auth/login",
            catch_response=True,
        ) as resp:
            if resp.status_code == 200:
                self.token = resp.json().get("token")
                self.client.headers["Authorization"] = f"Bearer {self.token}"
                resp.success()
            else:
                resp.failure(f"login fallo: {resp.status_code}")

    @task(5)
    def search_company(self):
        """Workflow 2 - busqueda por ticker (read, cache warm). Endpoint publico."""
        q = random.choice(SEARCH_QUERIES)
        self.client.get(
            f"/companies/search?q={q}", name="GET /companies/search", timeout=REQUEST_TIMEOUT
        )

    @task(3)
    def view_portfolio(self):
        """Workflow 3 - ver portfolio con P&L (read autenticado)."""
        if not self.token:
            return
        self.client.get("/portfolio", name="GET /portfolio", timeout=REQUEST_TIMEOUT)

    @task(2)
    def buy_stock(self):
        """Workflow 4 - comprar accion (write autenticado)."""
        if not self.token:
            return
        ticker = random.choice(TICKERS)
        with self.client.post(
            "/portfolio/buy",
            json={"ticker": ticker, "quantity": 1},
            name="POST /portfolio/buy",
            timeout=REQUEST_TIMEOUT,
            catch_response=True,
        ) as resp:
            if resp.status_code is None:
                resp.failure("sin respuesta (timeout/conexion)")
            elif resp.status_code == 201:
                resp.success()
            elif resp.status_code == 404:
                resp.failure("buy 404: ticker sin precio (correr warmup.py)")
            else:
                resp.failure(f"buy inesperado: {resp.status_code}")

    @task(1)
    def sell_not_owned(self):
        """Workflow 5 - vender accion nunca comprada -> 4xx ESPERADO (US 6.10)."""
        if not self.token:
            return
        with self.client.post(
            "/portfolio/sell",
            json={"ticker": NEVER_OWNED_TICKER, "quantity": 999},
            name="POST /portfolio/sell (not owned -> 4xx)",
            timeout=REQUEST_TIMEOUT,
            catch_response=True,
        ) as resp:
            if resp.status_code is None:
                resp.failure("sin respuesta (timeout/conexion)")
            elif 400 <= resp.status_code < 500:
                resp.success()  # 4xx esperado: el sistema rechaza con claridad
            elif resp.status_code < 400:
                resp.failure(f"sell deberia fallar pero dio {resp.status_code}")
            else:
                resp.failure(f"sell 5xx: {resp.status_code}")
