# Load & Stress testing con Locust — Pay & Pray API

Pruebas de carga (load) y estrés (stress) sobre la API, requeridas por el TP
(F6, issue #73). Cubren las US **6.7–6.10** de `docs/features/06_rendimiento_carga.feature`.

## Idea en 30 segundos

- **Entorno fijo:** backend limitado a **2 cores** (reproducible + permite provocar el quiebre).
- **Auth realista:** cada virtual user **se registra y loguea** (sin pool de tokens) → cero contención.
- **Think-time 0** en todo: *load* = por debajo de la capacidad, *stress* = muy por encima.
- **Corridas en orden:** capacity (halla el knee) → load → soak → stress (dos modos) → recovery.

## Estrategia: Load vs Stress
- **Load:** carga normal sostenida, **por debajo** de la capacidad. Valida tiempos bajo
  umbral y 0 errores (US 6.7, 6.8). El **soak** es un load de 30 min para detectar fugas (6.9).
- **Stress:** carga **muy por encima** de la capacidad, rampa progresiva, para hallar el
  **punto de quiebre** y verificar **degradación controlada** (US 6.10).

## Decisiones de medición (fijas en todas las corridas)

Para que los resultados sean comparables y la narrativa única:

| Decisión | Valor | Por qué |
|---|---|---|
| **Entorno** | backend a **2 cores** (`docker-compose.stress.yml`) | techo de CPU reproducible e independiente de la máquina; permite provocar el quiebre (con 8 cores la app es tan liviana que no rompe) |
| **Auth** | **register + login real** por usuario (sin pool de tokens) | cada usuario su propia cuenta → cero contención de escritura, cada portfolio independiente, 100% representativo |
| **Think-time** | **0** (`WAIT_MIN=0 WAIT_MAX=0`) | máxima presión por usuario; *load* = por debajo del knee, *stress* = muy por encima |
| **Timeout** | **30 s** por request (`REQUEST_TIMEOUT=30`) | los requests colgados cuentan como fallo explícito, no como latencia ilegible |
| **Generador** | Locust `--processes 4` | reparte greenlets en cores; el backend (capado a 2) es el cuello, no el generador |
| **DB** | **reseteada antes de empezar** (`down -v`) | cero estado acumulado de corridas viejas |

**Implicación del auth real (clave para leer el stress):** register+login usan **bcrypt**
(lento a propósito, ~20-40 hashes/s a 2 cores). En load/soak es despreciable (los logins
ocurren sólo al spawnear, después corre limpio). En el **stress con onboarding masivo** el
bcrypt se vuelve el cuello durante la subida → es un **hallazgo legítimo** (*el onboarding
masivo satura el auth*), que se aísla midiendo dos modos de stress (ver Resultados).

## Workflows
| # | Workflow | Endpoint | Peso |
|---|---|---|---|
| 1 | Register + Login | `POST /auth/register` + `/auth/login` | en `on_start` |
| 2 | Búsqueda por ticker | `GET /companies/search` | 5 |
| 3 | Ver portfolio con P&L | `GET /portfolio` | 3 |
| 4 | Comprar acción | `POST /portfolio/buy` | 2 |
| 5 | Vender sin poseer → 4xx | `POST /portfolio/sell` (`ORCL`, nunca comprado) | 1 |

El workflow 5 lo exige la consigna (vender lo que no se posee → 4xx). El 4xx es el
resultado **correcto**, se marca como éxito esperado y no infla el error rate.

## Archivos
| Archivo | Para qué |
|---|---|
| `locustfile.py` | los 5 workflows (modo realista) |
| `step_load.py` | rampa escalonada para capacity / stress |
| `warmup.py` | precios + ticker cache (antes de medir) |
| `docker-compose.stress.yml` | override: backend a 2 cores |
| `requirements.txt` | dependencias (`locust`) |

## Cómo correr

### Prep (una vez)
```bash
# desde la raíz del repo: levantar el backend capado a 2 cores
docker compose -f docker-compose.yml -f load-tests/docker-compose.stress.yml up -d --build
docker inspect pay-and-pray-api --format '{{.HostConfig.NanoCpus}}'   # -> 2000000000 (2 cores)

cd load-tests
python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
python warmup.py                                                       # precios + ticker cache (evita 503 por cache frío)
mkdir -p results
```
Para corridas a > ~5k usuarios, subir el límite de file descriptors del generador:
`ulimit -n 200000` (en macOS el default 256 topa antes que el backend).

Loggear CPU/memoria en otra terminal durante cada corrida (opcional):
```bash
( while true; do docker stats --no-stream --format '{{.Name}},{{.CPUPerc}},{{.MemUsage}}' \
    pay-and-pray-api pay-and-pray-db; sleep 2; done )
```

### Corridas
```bash
# 1) Capacity — hallar el knee (rampa 0->2.500, pasos finos)
WAIT_MIN=0 WAIT_MAX=0 REQUEST_TIMEOUT=30 \
STEP_USERS=100 STEP_TIME=45 MAX_USERS=2500 STEP_SPAWN=50 \
locust -f step_load.py --host http://localhost:8080 --headless --processes 4 \
  --csv results/01_capacity --html results/01_capacity.html

# 2) Load — operación normal, -u = 60% del knee (US 6.7, 6.8)
WAIT_MIN=0 WAIT_MAX=0 REQUEST_TIMEOUT=30 \
locust -f locustfile.py --host http://localhost:8080 --headless --processes 4 \
  -u 300 -r 50 --run-time 10m --csv results/02_load --html results/02_load.html

# 3) Soak — estabilidad sostenida 30 min (US 6.9)
WAIT_MIN=0 WAIT_MAX=0 REQUEST_TIMEOUT=30 \
locust -f locustfile.py --host http://localhost:8080 --headless --processes 4 \
  -u 300 -r 50 --run-time 30m --csv results/03_soak --html results/03_soak.html

# 4) Stress-A — shock de onboarding, cohortes grandes (US 6.10)
WAIT_MIN=0 WAIT_MAX=0 REQUEST_TIMEOUT=30 \
STEP_USERS=1000 STEP_TIME=75 MAX_USERS=10000 STEP_SPAWN=50 \
locust -f step_load.py --host http://localhost:8080 --headless --processes 4 \
  --csv results/04_stress --html results/04_stress.html

# 6) Stress-B — carga gradual hasta el breakpoint (US 6.10)
WAIT_MIN=0 WAIT_MAX=0 REQUEST_TIMEOUT=30 \
STEP_USERS=150 STEP_TIME=60 MAX_USERS=10000 STEP_SPAWN=50 \
locust -f step_load.py --host http://localhost:8080 --headless --processes 4 \
  --csv results/06_stress_breakpoint --html results/06_stress_breakpoint.html
```
(Una corrida de *recovery* a baja carga tras el stress —`-u 150 --run-time 90s`— confirma
que el sistema vuelve a 0 errores: `results/05_recovery.html`.)

Al terminar, restaurar el backend a todos los cores: `docker compose up -d backend`.

### Cómo leer los resultados
- **Knee:** en el HTML / `*_stats_history.csv` (filas `Aggregated`), el nivel de usuarios
  donde el **RPS deja de subir** (la CPU satura y sólo crece la latencia) = capacidad.
- **`LOAD_USERS`** = ~60% del knee (zona cómoda). **Umbral p95** = p95 medido en load + margen.
- **Percentiles:** se usa **p95/p99, nunca el promedio** (esconde la cola). Brecha p50↔p99
  grande = saturación.
- **Error rate:** los **4xx esperados del workflow 5** (sell sin poseer) NO cuentan como fallo.

## Resultados

Corridas del 18/06/2026, backend a 2 cores, auth real, think-time 0, timeout 30s.
Los CSV/HTML crudos se generan en `results/` (gitignored); las cifras clave quedan abajo.

| Escenario | Usuarios | p50 | p95 | p99 | Throughput | Errores 5xx | Estado |
|---|---|---|---|---|---|---|---|
| Capacity (knee) | ~500 (knee) | 710 ms | 760 ms (en knee) | — | **~1.950 rps** (capacidad) | 0 | ✅ |
| Load (10 min) | 300 | 77 ms | 560 ms | 910 ms | ~1.836 rps | **0** | ✅ 6.7, 6.8 |
| Soak (30 min) | 300 | 73 ms | 410 ms | 760 ms | ~1.762 rps | **0** | ✅ 6.9 |
| Stress-A · shock onboarding (→10.000) | rampa, +1.000/escalón | — | 30 s+ (techo) | — | colapsa | **0** | ✅ 6.10 |
| Stress-B · carga gradual (→10.000) | rampa, +150/escalón | — | 230 ms→12 s (lineal) | — | ~2.000 rps hasta el quiebre | **0** | ✅ 6.10 |

> El único "fallo" del soak fue **1** `login 401` en 2,7M requests (race transitorio en
> `on_start`, no 5xx). En el stress-A todos los fallos son a **nivel de conexión** (reset /
> timeout 30s / disconnect) o `401` de auth — **cero 5xx**. El stress-B no tuvo **ningún**
> fallo hasta los **8.450 usuarios** (ver abajo); todos los fallos posteriores son
> connection reset — **cero 5xx**.

### Dimensionamiento (derivado, no acordado a priori)
- **Capacity:** el RPS se aplana en **~1.950 rps alrededor de 500 usuarios** (CPU a 2 cores
  saturada); por encima sólo crece la latencia. → **knee ≈ 500 usuarios**.
- **`LOAD_USERS` = 60% del knee = 300.** Zona cómoda: RPS aún sin saturar, p95 ~560ms, 0 errores.
- **Umbral p95 (US 6.8) = 1.000 ms** (p95 medido en load ~560ms + margen).
- **Error rate aceptable:** < 1% de 5xx (los 4xx esperados del workflow 5 no cuentan).

### Conclusiones por US
- **6.7 — Usuarios concurrentes.** 300 usuarios, 10 min, **0 errores 5xx** en 1.101.723 requests. ✅
- **6.8 — Tiempos bajo carga.** p95 agregado **560 ms < 1.000 ms** (workflows: search 110ms,
  portfolio/buy/sell ~680ms). ✅
- **6.9 — Estabilidad sostenida.** 30 min: p95 plano en **520–580 ms sin creep**, memoria
  estable en **1.01–1.05 GiB** (sin fugas), CPU ~205% constante. ✅
- **6.10 — Degradación controlada.** Validada en dos modos de stress:
  - **Stress-A (shock de onboarding, +1.000/escalón):** quiebre a **~1.050 usuarios**; por
    encima degrada por **descarte de conexiones + timeouts explícitos**, **sin 5xx ni
    corrupción**, sin crashear (memoria estable ~1.13 GiB). **Se recupera** al bajar la
    carga: a 150 usuarios vuelve a **0 errores, p95 230 ms**.
  - **Stress-B (carga gradual, +150/escalón):** **0 errores hasta 8.400 usuarios**;
    degradación 100% por latencia (p95 lineal 230 ms→12 s), throughput plano ~2.000 rps.
    **Breakpoint a 8.450 usuarios**, por **descarte de conexiones** (~22k `ConnectionReset`
    / `RemoteDisconnected`, sólo ~440 timeouts) → satura el **`max-connections=8192` de
    Tomcat** (default, sin tuning). El p95 se mantiene en ~12 s (no llega a 30 s) porque el
    exceso se descarta al instante en vez de colgarse: **load shedding controlado, cero 5xx**. ✅
- **Hallazgo (cuál es el cuello bajo stress):** comparando A vs B —misma DB (más inflada en B),
  misma carga de workflows, mismos 2 cores; la única diferencia es la **tasa de onboarding**—
  el quiebre del modo A (~1.050) **desaparece** en el modo B (recién a 8.450). → El cuello en
  la rampa **no son los workflows ni el volumen de datos, sino el `bcrypt` del auth**: meter
  ~1.000 `register`+`login` de golpe satura los cores. Coincide con lo anticipado: *el
  onboarding masivo satura el auth*. Con onboarding suave el sistema aguanta hasta el techo de
  **conexiones de Tomcat (~8.192)**, no de workflows.
