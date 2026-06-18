# Informe Final — Pay & Pray

**Aseguramiento de la Calidad del Software — 1er Cuatrimestre 2026**

Integrantes: Fernando Santisi, Juan Decoud, Juan Luis Martinó, Julián Ritondale, Sofía Keczeli

---

## Índice

1. Introducción y enfoque de calidad
2. Arquitectura general y justificación
3. Integraciones externas (SEC EDGAR y Yahoo Finance)
4. Docker y entorno local
5. CI/CD, versionado y flujo de Git
6. Features y user stories
7. Estrategia de testing
8. Performance testing con Locust (load vs. stress)
9. Aplicación mobile (Capacitor)
10. Decisiones de diseño destacadas
11. Posibles puntos de mejora
12. Conclusión

---

## 1. Introducción y enfoque de calidad

Pay & Pray es un *portfolio tracker* de acciones cotizadas en mercados de Estados Unidos, 
disponible como aplicación web y mobile sobre una misma API. El usuario puede registrar
operaciones de compra y venta, consultar el valor y la ganancia/pérdida de sus posiciones,
seguir empresas en una watchlist y acceder a información financiera oficial. El sistema se
apoya en dos fuentes de datos externas reales: la API pública EDGAR de la SEC para los
datos financieros, y Yahoo Finance para los precios de mercado.

Sin embargo, el producto en sí fue el medio, no el fin. La consigna pedía un sistema
deliberadamente minimalista, y el objetivo real del trabajo era **poner en práctica los
mecanismos de aseguramiento de la calidad** sobre un caso con suficiente complejidad de
dominio (cálculo de P&L, integraciones externas inestables, rate limiting) como para que
esas técnicas tuvieran sentido. Todo el informe está organizado, entonces, alrededor de una
pregunta: *qué decidimos y por qué*, más que *qué construimos*.

### Tesis de calidad: Hacer el sistema fácil de testear

La decisión que más condicionó al resto fue tratar la **testeabilidad como un requisito de
diseño**, y no como una consecuencia. En la práctica esto se tradujo en reglas concretas que
aplicamos de forma sistemática en el backend:

- Cada capa se expone detrás de una **interfaz** (`Service`/`ServiceImpl`,
  `Repository`/`RepositoryImpl`), de modo que las dependencias se pueden reemplazar en los
  tests sin tocar la lógica que las usa.
- El acceso a datos vive aislado: una única clase conoce JPA, y el resto del sistema habla
  contra una interfaz de dominio. Eso permite testear la lógica de negocio sin base de
  datos.
- Cada integración externa (por ejemplo `EdgarClient`) se define como una interfaz con
  exactamente los métodos que la app necesita, y una sola implementación concreta maneja
  el HTTP, el rate limiting y el envoltorio de errores. Así la integración se puede
  *fakear* en los tests sin depender del servicio real ni de librerías de mocking.

Esta orientación se sostuvo hasta en los detalles del testing: los tests unitarios usan
implementaciones falsas escritas a mano (`Fake*`) en lugar de Mockito, porque preferimos
dobles de prueba explícitos y con comportamiento controlable (flags y contadores de
llamadas) antes que expectativas mágicas. Cuando un test necesitaba la base de datos real,
lo subimos un escalón: los tests de integración levantan PostgreSQL con Testcontainers y
ejercitan la API completa por HTTP. La pirámide de tests fue el reflejo directo de cómo 
está construido el sistema.

### Cómo organizamos el avance

El trabajo se estructuró en seis features, documentadas con sus user stories y criterios de
aceptación en [`docs/user-stories.md`](./user-stories.md):

| # | Feature | Núcleo |
|---|---------|--------|
| 1 | Gestión de cuenta de usuario | registro, login, JWT |
| 2 | Búsqueda y consulta de empresas | integración con SEC EDGAR |
| 3 | Proceso de actualización de precios | batch contra Yahoo Finance |
| 4 | Gestión de portfolio | compra, venta, historial, P&L |
| 5 | Watchlist | seguimiento y comparación de empresas |
| 6 | Experiencia móvil y rendimiento bajo carga | app mobile y performance |

Avanzamos feature por feature, y dentro de cada una construimos de la persistencia hacia
afuera: primero el modelo de datos y la API, después la interfaz web que la consume. Los
**tests unitarios y de integración fueron parte de construir cada feature**: la lógica de 
negocio se cubría con tests unitarios a medida que se escribía, y cada endpoint con tests 
de integración que validaban su contrato HTTP y su persistencia. Una story no se daba por 
terminada sin ese coverage.

Priorizamos primero las piezas de mayor riesgo (las integraciones con EDGAR y Yahoo Finance,
por ser externas e inestables), para validarlas temprano y construir el resto sobre una base
firme.

Hubo dos tipos de validación (Feature 6) que sí se incorporaron más tarde, y de forma deliberada. 
La **app mobile** se trató como una feature propia en lugar de acompañar a cada slice: preferimos 
estabilizar primero los flujos en la web (más rápida de iterar) y recién después llevarlos a mobile. 
Eso implicó el uso de Capacitor junto con testing e2e con Appium.
Dentro de esta feature también se incluyen las pruebas de **performance** con Locust, que tienen sentido 
sobre flujos ya estables y completos, no sobre funcionalidad en construcción. Es decir: el momento de cada 
tipo de test dependió de qué validaba —los unitarios y de integración acompañaron al código; los E2E y de 
carga ejercitaron el sistema ya integrado.

Los **criterios de aceptación** de cada user story cumplieron un rol operativo: definían
cuándo una historia estaba terminada. Una feature recién se daba por cerrada cuando sus 
criterios estaban cubiertos por las pruebas que correspondían a su nivel.

### Qué cubre cada capa de validación

Sobre esa base, la calidad quedó sostenida por capas complementarias, que el resto del
informe desarrolla en detalle:

- **Tests unitarios** — lógica de negocio aislada, con `Fake*` (Sección 7).
- **Tests de integración** — API completa contra PostgreSQL real vía Testcontainers, e
  integración real contra EDGAR (Secciones 3 y 7).
- **Tests end-to-end** — flujos de usuario en web (Cypress) y mobile (Appium) (Secciones 7 y 9).
- **Performance** — load y stress testing con Locust, contemplando el rate limit de EDGAR (Sección 8).
- **CI/CD** — compilación, tests y delivery vía Docker en cada cambio, con versionado SemVer (Sección 5).

---

## 2. Arquitectura general y justificación

El sistema se compone de varias piezas desplegables, cada una con una responsabilidad
acotada y un lenguaje elegido por su afinidad con esa responsabilidad:

| Componente | Tecnología | Rol |
|------------|-----------|-----|
| API backend | Kotlin 2.1.21 + Spring Boot 3.4.5 (Java 21) | núcleo de negocio, persistencia y autenticación |
| Frontend web | React 19 + Vite 7 + TypeScript + Tailwind | interfaz que consume la API |
| App mobile | Capacitor 8 + Android | misma interfaz empaquetada como app nativa |
| Batch de precios | Python 3.12 (yfinance) | proceso independiente de actualización de precios |
| Base de datos | PostgreSQL 16 | persistencia compartida |

La elección de **Kotlin + Spring Boot** para el backend responde a que es un stack
fuertemente tipado, con un ecosistema maduro para inyección de dependencias, seguridad y
acceso a datos, que favorece la separación en capas que buscábamos. El **batch de precios
se escribió en Python** por una razón concreta: la consigna exige consumir Yahoo Finance a
través de la librería `yfinance`, que es Python. En lugar de forzar esa dependencia dentro
del backend, la aislamos en un proceso aparte (ver más abajo).

### Backend: monolito modular en capas

El backend es un **monolito modular**: una sola aplicación desplegable, pero internamente
dividida en módulos independientes por feature (`auth`, `edgar`, `price`, `portfolio`,
`watchlist`, `company`, `user`). Cada módulo sigue la misma anatomía, lo que hace que el
código sea predecible y que cada capa tenga un único motivo de cambio:

```
feature/
  FeatureController.kt       ← traduce HTTP ↔ dominio, valida con @Valid
  FeatureService.kt          ← interfaz
  FeatureServiceImpl.kt      ← lógica de negocio
  FeatureRepository.kt       ← interfaz de dominio (no sabe de JPA)
  FeatureRepositoryImpl.kt   ← única clase que conoce JPA
  JpaFeatureRepository.kt    ← Spring Data JpaRepository
  Entity.kt
  dto/                       ← Request (validado) y Response (plano)
  exception/                 ← una excepción por modo de falla
```

La justificación es directa y conecta con la tesis de la Sección 1: al exponer **servicios
y repositorios detrás de interfaces**, la lógica de negocio queda desacoplada de sus
dependencias y se puede testear con dobles `Fake*` sin levantar Spring ni la base de datos.
El detalle más deliberado es que **una sola clase (`*RepositoryImpl`) conoce JPA**: el
resto del sistema habla contra una interfaz de dominio. Si mañana cambiara la tecnología de
persistencia, el impacto quedaría contenido en esa frontera.

Los controllers no contienen lógica: reciben el request, lo validan declarativamente con
`@Valid` y delegan en el service. La validación nunca vive dentro del service, y las
entidades JPA nunca se exponen hacia afuera: la frontera HTTP siempre habla en DTOs
(`Request` con anotaciones de validación, `Response` planos).

### Persistencia: migraciones versionadas y esquema como contrato

La persistencia usa **PostgreSQL con JPA/Hibernate**, pero el esquema **no lo gestiona
Hibernate**: está configurado en `ddl-auto: validate`, de modo que Hibernate sólo verifica
que el modelo coincida con la base, sin modificarla nunca. El esquema es propiedad de
**Flyway**, con una migración por cambio (`V1__create_users_table.sql`, …,
`V9__create_watchlist_items_table.sql`).

Esta decisión es de calidad, no de comodidad: el esquema queda versionado en el repositorio,
es reproducible en cualquier entorno (local, CI, producción) y las migraciones son
inmutables —ante un cambio se agrega una migración nueva, nunca se edita una existente—.
Así evitamos la principal fuente de "funciona en mi máquina": que el esquema real diverja
de lo que el código espera.

### Seguridad: JWT stateless e identidad confiable

La autenticación se resuelve con **JWT y sesiones stateless** (`SessionCreationPolicy.STATELESS`).
Un `JwtAuthFilter` valida el token en cada request antes de llegar al controller. La regla
por defecto en `SecurityConfig` es **denegar**: todo endpoint requiere autenticación
(`anyRequest().authenticated()`) salvo los explícitamente liberados —`/auth/**` (registro y
login), `/companies/**` (consulta pública de empresas), el disparo del batch
(`POST /admin/prices/refresh`) y la consulta de última actualización
(`GET /prices/last-updated`)—.

Una decisión importante de seguridad es que **la identidad del usuario nunca viene del
request**: el ID se toma del `Authentication` que inyecta Spring a partir del token, no de
un parámetro ni del body. Esto evita que un usuario pueda operar sobre el portfolio de otro
manipulando la request.

### Manejo de errores centralizado

Cada modo de falla esperado tiene su **propia excepción no chequeada** (por ejemplo
`InsufficientQuantityException`, `DuplicateEmailException`, `TickerNotFoundException`,
`EdgarApiException`). Ninguna se maneja con `try/catch` disperso: todas se registran en un
único `GlobalExceptionHandler` (`@RestControllerAdvice`) que las mapea al código HTTP
correcto (409 para email duplicado, 404 para recurso inexistente, 503 cuando EDGAR no
responde, 400 para reglas de negocio violadas) y devuelve siempre la misma forma de
respuesta: `ErrorResponse(error)` o, para validaciones, `ValidationErrorResponse(errors)`.
El beneficio es un contrato de error uniforme y predecible para web y mobile, y lógica de
negocio que puede "fallar" lanzando una excepción sin preocuparse por el formato HTTP.

### Separación API / batch: el diseño "precio almacenado"

La decisión arquitectónica más característica del sistema es cómo se incorporan los precios
de mercado. La consigna pide que la valorización del portfolio y el cálculo de P&L se hagan
**siempre contra el último precio almacenado**, sin consultar Yahoo Finance en tiempo real
durante el uso normal. Lo resolvimos separando físicamente dos responsabilidades:

- El **backend (Kotlin)** nunca llama a Yahoo Finance. Lee y escribe precios en la tabla
  `prices` y calcula todo a partir de ahí.
- El **batch (Python)** es un proceso independiente que se ejecuta una única vez por
  invocación: junta todos los tickers presentes en el sistema (`positions`,
  `watchlist_items` y `tracked_tickers`, vía `UNION`), consulta Yahoo Finance con
  `yfinance`, persiste los precios y registra en `batch_runs` el timestamp y el resultado.
  Si Yahoo no devuelve precio para un ticker, registra el error y continúa con el resto.

El backend dispara el batch a través de una interfaz (`BatchTriggerService`, implementada
por `HttpBatchTriggerService`), de la misma forma en que aísla cualquier integración
externa. Esto da dos ventajas de calidad: el uso normal de la app es **determinístico y
rápido** (no depende de la disponibilidad de Yahoo Finance), y el flujo de carga puede
probarse de forma realista, separando los endpoints que dependen de servicios externos de
los que trabajan sólo con datos locales (algo central en la estrategia de stress testing,
Sección 8). El batch puede dispararse manualmente por endpoint y desde el pipeline de CI
como paso opcional, y la app muestra al usuario la fecha y hora de la última actualización.

### Integraciones externas como interfaces fakeables

Tanto EDGAR como el batch de precios siguen el mismo patrón: se definen como una
**interfaz** con exactamente los métodos que la app necesita (`EdgarClient`,
`BatchTriggerService`), y una única implementación concreta (`EdgarApiClient`,
`HttpBatchTriggerService`) se encarga del HTTP, el rate limiting y el envoltorio de errores
en una excepción de dominio (`EdgarApiException`). Esto cumple un doble objetivo: encapsula
toda la complejidad de la integración en un solo lugar, y permite reemplazarla por un
`Fake` en los tests sin tocar la lógica que la consume. El detalle de cada integración se
desarrolla en la Sección 3.

---

## 3. Integraciones externas (SEC EDGAR y Yahoo Finance)

El sistema integra dos fuentes externas reales con características muy distintas, y cada una
se diseñó en función de sus restricciones propias. EDGAR es una API estable con rate limit
estricto que se consulta **bajo demanda**; Yahoo Finance es una fuente sin SLA que se
consume **de forma diferida** a través del batch. Ambas comparten, eso sí, el mismo patrón
arquitectónico de la Sección 2: una interfaz de dominio y una única implementación que
concentra la complejidad.

### SEC EDGAR: consulta bajo demanda con rate limiting y caché

La integración se expone tras la interfaz `EdgarClient` y se implementa en `EdgarApiClient`.
Cubre los endpoints que pide la consigna:

| Necesidad | Endpoint EDGAR |
|-----------|----------------|
| Filings y metadata de una empresa | `submissions/CIK{CIK}.json` |
| Métricas financieras (XBRL) | `api/xbrl/companyfacts/CIK{CIK}.json` |
| Un concepto financiero puntual | `api/xbrl/companyconcept/CIK{CIK}/us-gaap/{concept}.json` |
| Búsqueda de empresas por texto | `efts.sec.gov/LATEST/search-index?q=...&forms=10-K` |
| Mapa ticker → CIK | `files/company_tickers.json` |

Las decisiones de diseño relevantes:

- **Rate limiting (10 req/s).** La SEC limita a 10 requests por segundo. Lo respetamos con
  un *token bucket* (librería Bucket4j) de capacidad 10 que se rellena a 10 tokens por
  segundo; antes de cada request el cliente consume un token de forma **bloqueante**
  (`bucket.asBlocking().consume(1)`). Así el límite se garantiza en el propio cliente, sin
  depender de que cada llamador se acuerde de espaciar las requests. Esta misma cota es la
  que condiciona la estrategia de stress testing (Sección 8).
- **User-Agent obligatorio.** EDGAR exige un header `User-Agent` descriptivo con nombre de
  proyecto y mail de contacto. Se inyecta de forma centralizada mediante un interceptor del
  `RestTemplate` (`EdgarConfig`), de modo que ninguna request puede salir sin él.
- **Caché para reducir llamadas.** Sobre EDGAR se aplican dos cachés Caffeine con TTL
  acorde a cuán seguido cambia cada dato: el mapa completo de tickers
  (`company_tickers.json`, grande y casi estático) se cachea **24 horas**, y el detalle
  financiero por empresa **1 hora** (hasta 10.000 entradas). Esto reduce drásticamente las
  llamadas repetidas y aleja el riesgo de tocar el rate limit en uso normal.
- **Degradación elegante.** Cualquier error HTTP de EDGAR se envuelve en una excepción de
  dominio (`EdgarApiException`) que el `GlobalExceptionHandler` traduce a `503 Service
  Unavailable`, comunicando con claridad que el problema es de la fuente externa y no del
  sistema. Además, para el mapa de tickers existe un *fallback* opcional empaquetado en el
  classpath: si EDGAR rechaza el archivo `company_tickers.json` (403) y el fallback está
  habilitado (`EDGAR_TICKERS_FALLBACK_ENABLED`), el sistema carga un JSON local con más de 50
  empresas grandes (AAPL, MSFT, TSLA, NVDA, AMZN, …) en lugar de quedar inoperante; si está
  deshabilitado, la excepción se propaga.
- **Un trade-off explícito.** La búsqueda full-text se restringe a `forms=10-K`. Es una
  decisión consciente para un portfolio tracker: todas las grandes empresas públicas de
  EE.UU. presentan 10-K, así que el resultado es relevante; el costo es que una empresa que
  sólo tenga 10-Q u 8-K no aparecería. Lo documentamos en el propio código para que la
  limitación quede a la vista.

### Yahoo Finance: actualización diferida vía batch

A diferencia de EDGAR, Yahoo Finance **no se consulta nunca durante el uso normal**. La
fuente no garantiza disponibilidad ni SLA, por lo que hacer depender una compra o la
visualización del portfolio de una llamada en vivo a Yahoo sería frágil. El proceso batch
(`price-batch/`, Python) resuelve esto en cuatro pasos, ejecutándose **una única vez por
invocación**:

1. **Recolecta los tickers** efectivamente presentes en el sistema con un `UNION` de
   `positions`, `watchlist_items` y `tracked_tickers`. Sólo se piden precios de lo que
   alguien realmente sigue u opera.
2. **Consulta Yahoo Finance** con `yfinance` (`yf.download(period="1d")`), tomando el
   último cierre disponible de cada ticker.
3. **Persiste los precios** con un `INSERT ... ON CONFLICT (ticker) DO UPDATE`, de modo que
   por cada ticker queda siempre el último precio con su `fetched_at`.
4. **Registra la corrida** en la tabla `batch_runs` con `started_at`, `completed_at`,
   `status` (`SUCCESS`/`FAILURE`) y un `error_summary`.

El manejo de errores fue explícito, como exige la consigna: si Yahoo no devuelve precio para
algún ticker, ese ticker se reporta como advertencia y **el proceso continúa con el resto**
sin interrumpirse; los faltantes quedan resumidos en `error_summary`. Sólo una falla global
(por ejemplo, caída de la conexión a la base) marca la corrida como `FAILURE`. El proceso
termina con un *exit code* acorde, lo que permite encadenarlo en un pipeline.

Gracias a `batch_runs`, la aplicación puede mostrarle al usuario **cuándo fue la última
actualización de precios** (`GET /prices/last-updated`), dándole contexto sobre cuán
recientes son las valuaciones que está viendo. El batch puede dispararse manualmente
(`POST /admin/prices/refresh`, que el backend reenvía al proceso vía
`HttpBatchTriggerService`) o desde CI como paso opcional.

### Cómo se testean estas integraciones

La testeabilidad que justificamos en la Sección 2 se paga acá. Como ambas integraciones
están detrás de interfaces, en los tests unitarios y de integración de la lógica de negocio
se reemplazan por dobles `Fake`, evitando depender de una API lenta, caída o de respuestas
cambiantes. Pero la consigna pide además **integración real**, así que existe un conjunto
de tests que ejercita de verdad la API de EDGAR y el batch contra Yahoo, validando que el
contrato externo siga siendo el que asumimos. El detalle de esta separación se desarrolla en
la Sección 7.

---

## 4. Docker y entorno local

Todo el stack se levanta con un único `docker compose up`, según pide la consigna. El
`docker-compose.yml` orquesta cuatro servicios:

| Servicio | Imagen / build | Rol |
|----------|----------------|-----|
| `db` | `postgres:16-alpine` | base de datos |
| `backend` | build de `./backend` | API Kotlin + Spring Boot |
| `price-batch` | build de `./price-batch` | proceso de precios expuesto como servicio HTTP |
| `frontend` | build de `./frontend` | app web (Vite + React) |

### Persistencia y arranque ordenado

La base usa un **volumen persistente** (`postgres_data` montado en
`/var/lib/postgresql/data`), de modo que los datos sobreviven a reinicios y recreaciones de
los contenedores —un requisito explícito del trabajo—.

El orden de arranque no se deja librado al azar, sino que se coordina con **healthchecks**:

- `db` tiene un healthcheck con `pg_isready`; el resto de los servicios declaran
  `depends_on: condition: service_healthy`, así nadie intenta conectarse a Postgres antes de
  que esté realmente listo.
- `price-batch` expone un endpoint `/health` y tiene su propio healthcheck; el `backend`
  espera a que el batch esté sano antes de arrancar, porque lo va a invocar.

Esto evita la clase de errores intermitentes de arranque ("la base todavía no aceptaba
conexiones") que suelen aparecer cuando los contenedores se levantan en paralelo, y hace que
el entorno sea reproducible.

### Configuración por entorno

La configuración sensible y dependiente del entorno (credenciales de la base, `JWT_SECRET`,
`User-Agent` de EDGAR, orígenes CORS) se inyecta por **variables de entorno**, con un
`.env.example` versionado como plantilla. Notablemente, `SPRING_JPA_HIBERNATE_DDL_AUTO` se
fija en `validate` también en el contenedor, reforzando la decisión de la Sección 2: ni
siquiera en Docker se permite que Hibernate toque el esquema. El backend conoce al batch a
través de `BATCH_SERVICE_URL`, manteniendo el desacople entre ambos.

### Batch como servicio HTTP

Una decisión de diseño a destacar es cómo se expone el batch dentro del stack. Aunque
conceptualmente es un proceso que "corre una vez", para integrarlo con el backend lo
envolvimos en un pequeño servidor HTTP (`server.py`) con dos rutas: `/health` (para el
healthcheck de Compose) y `/trigger` (que ejecuta `run_batch()` una vez y devuelve 200/500
según el resultado). Así el backend puede disparar una actualización de precios con una
request, sin acoplarse a la mecánica interna del batch, y el proceso sigue siendo
independiente y ejecutable también por línea de comando.

### Seed de datos

Para que el entorno quede listo para usar sin pasos manuales, el backend incluye seeders de
desarrollo (`DevDataSeeder`, `TrackedTickerDevSeeder`) que cargan datos iniciales —usuarios
de prueba (cantidad configurable vía `SEED_USER_COUNT`) y un conjunto de tickers seguidos—.
Esto da un sistema inmediatamente probable apenas levanta, lo cual es especialmente útil
para los tests end-to-end y las demos.

---

## 5. CI/CD, versionado y flujo de Git

La integración continua se resuelve con **GitHub Actions**, en un workflow versionado en el
propio repositorio (`.github/workflows/ci.yml`). Se dispara en cada `push` y cada `pull
request` hacia las ramas `main` y `dev`, de modo que ningún cambio llega a las ramas
principales sin pasar por validación automática.

### Pipeline con jobs selectivos

El pipeline arranca con un job `changes` que usa *path filtering* para detectar qué parte
del repositorio cambió, y a partir de eso decide qué jobs correr. Esto evita, por ejemplo,
correr toda la suite del frontend cuando sólo se tocó el backend, acortando los tiempos de
feedback sin perder cobertura. Los jobs son:

- **`backend`** — verifica formato y estilo (`ktlintCheck`), compila (`gradle build -x
  test`) y corre la suite de tests (`gradle test`), que incluye unitarios e integración con
  Testcontainers.
- **`frontend`** — chequea formato (`prettier --check`), lintea (`eslint`), compila (`npm
  run build`) y corre los tests (`npm test`).
- **`e2e`** — levanta el stack completo con Docker Compose y corre Cypress contra él. Está
  deliberadamente acotado: sólo se ejecuta en *pull requests hacia `main`* y cuando
  cambiaron archivos relevantes. La razón es de costo/beneficio —es el job más pesado—, y se
  reserva como compuerta final antes de integrar a la rama de producción. Ante una falla,
  sube las capturas de Cypress como artefacto para poder diagnosticar.

Separar lint, build y test en pasos distintos es intencional: si algo falla, se sabe
exactamente qué (un problema de estilo no se confunde con un test roto ni con un error de
compilación).

### Imágenes Docker reproducibles

Cada componente tiene su propio **Dockerfile**, y los del backend y el frontend son
**multi-stage**: una etapa compila (por ejemplo, el backend genera el `bootJar` con Gradle
sobre una imagen JDK) y una etapa final liviana lleva sólo el artefacto ejecutable sobre una
imagen `alpine`. El resultado son imágenes reproducibles y chicas que `docker compose`
ensambla en el stack completo descripto en la Sección 4, de modo que el sistema se construye
y se levanta sin pasos manuales de instalación.

### Versionado con SemVer

El avance se versionó en GitHub siguiendo **Versionado Semántico**. Las releases se
publicaron en hitos significativos, y el esquema de numeración refleja la naturaleza de cada
cambio de forma consistente: cada **feature** nueva incrementó la versión *MINOR*, y cada
corrección incrementó la *PATCH*. El historial muestra esa disciplina de forma muy legible:

| Versión | Hito |
|---------|------|
| v1.0.0 | Feature 1 — Gestión de cuenta de usuario |
| v1.1.0 | Feature 2 — Búsqueda y consulta de empresas |
| v1.2.0 | Feature 3 — Proceso de actualización de precios |
| v1.2.1 | Fix — seed de tickers e integración de búsqueda en vivo |
| v1.3.0 | Feature 4 — Gestión de portfolio |
| v1.3.1 | Fix — acceso público a company page y price status |
| v1.4.0 | Feature 5 — Watchlist y comparación de empresas |
| v1.4.1 | Fix — estado de watchlist en página de empresa |
| v1.5.0 | Feature 6 — Experiencia móvil y rendimiento bajo carga |

Cada release de GitHub quedó asociada a su tag y a la feature correspondiente, lo que hace
que la historia del proyecto sea trazable: se puede ver qué entró en cada versión y en qué
orden se construyó el sistema.

---

## 6. Features y user stories

La especificación del sistema se organizó en tres niveles, documentados en
[`docs/user-stories.md`](./user-stories.md):

1. **Features** — las seis grandes capacidades del producto.
2. **User stories** — dentro de cada feature, las historias concretas desde la perspectiva
   del usuario (qué quiere hacer y para qué).
3. **Escenarios de aceptación** — dentro de cada user story, las condiciones puntuales que
   debían cumplirse (los criterios de aceptación).

Los escenarios fueron la unidad operativa: funcionaron como *Definition of Done* y, en buena
medida, como el guion de los tests. Por ejemplo, la user story "Vender acciones" no se
consideraba terminada por permitir vender, sino cuando se verificaban sus escenarios —entre
ellos, *"el sistema no permite vender más unidades de las disponibles"*—, y existía una
prueba que lo confirmaba. Esta sección recorre el primer y segundo nivel; el tercero vive en
`user-stories.md`, y las pruebas que lo respaldan, en las Secciones 7 a 9.

### Feature 1 — Gestión de cuenta de usuario

Cubre el ciclo de identidad del usuario. Sus user stories:

- **1.1 Registro de usuario** — crear cuenta con email y contraseña.
- **1.2 Login** — iniciar sesión y obtener una sesión autenticada.

Entre sus escenarios: se rechazan emails inválidos y contraseñas vacías, no se permite
registrar un email ya existente (409), las credenciales inválidas dan error sin **exponer
información sensible**, y ningún endpoint o pantalla protegida es accesible sin
autenticación. Es la base sobre la que se apoyan portfolio y watchlist.

### Feature 2 — Búsqueda y consulta de empresas (SEC EDGAR)

Materializa la integración con EDGAR (Sección 3). Sus user stories cubren las cuatro
consultas que pide la consigna:

- **2.1 Búsqueda de empresas** — por nombre o ticker.
- **2.2 Detalle financiero** — Revenue, Net Income, EPS, Total Assets, Total Liabilities
  (XBRL Company Facts).
- **2.3 Evolución histórica** — entre 4 y 8 quarters reportados.
- **2.4 Filings** — 10-K y 10-Q recientes con su fecha de presentación.

Cada historia contempla su escenario de error: si no hay coincidencias, si falta información
financiera o si EDGAR no responde, el sistema lo informa con claridad (un 503 cuando la
falla es de la fuente externa).

### Feature 3 — Proceso de actualización de precios (Yahoo Finance)

Corresponde al batch (Sección 3). Sus user stories separan dos roles:

- **3.1 Visibilidad de actualización de precios** — el usuario consulta cuán vigente es la
  información.
- **3.2 Ejecutar batch de precios** — el operador / pipeline de CI dispara la actualización.

Sus escenarios capturan las garantías que pide la consigna: obtener los últimos cierres,
actualizar los precios almacenados, registrar fecha y hora, informar errores, y —detalle
importante— que **una ejecución fallida no sobrescriba la última fecha exitosa registrada**.

### Feature 4 — Gestión de portfolio (compra, venta, P&L, historial)

Es el núcleo de dominio y donde viven las reglas de negocio más interesantes. Sus user
stories:

- **4.1 Comprar acciones** — registrar la compra de N unidades de un ticker.
- **4.2 Vender acciones** — liquidar total o parcialmente una posición.
- **4.3 Consultar valor del portfolio y P&L** — posiciones, P&L por posición y valor total.
- **4.4 Ver historial de operaciones** — auditar compras y ventas.

Reglas y decisiones a destacar, presentes en sus escenarios: toda valorización y P&L se
calcula **contra el último precio almacenado** (nunca Yahoo en vivo); no se permiten
cantidades ≤ 0 ni **vender más unidades de las disponibles**; cada operación queda en el
historial con ticker, tipo, cantidad, precio y fecha, en orden cronológico. El cálculo de
P&L con múltiples compras y ventas sobre una misma posición se resolvió con el método de
**costo promedio ponderado**, sobre el que se profundiza en la Sección 10.

### Feature 5 — Watchlist y comparación de empresas

Permite seguir empresas **sin tener posición abierta** y comparar sus métricas. Sus user
stories:

- **5.1 Gestionar watchlist** — agregar y quitar empresas, sin duplicados.
- **5.2 Comparar dos empresas** — enfrentar las métricas financieras clave de dos empresas.

Entre sus escenarios: la vista indica **si el usuario tiene o no posición abierta** en cada
empresa, y la comparación muestra un conjunto definido de métricas (precio actual, Market
Cap, Revenue, Net Income, EPS, Total Assets, Total Liabilities, último filing y fecha de
última actualización), informando cuando alguna no está disponible.

### Feature 6 — Experiencia móvil y rendimiento bajo carga

Agrupa los **requisitos no funcionales**, organizados en dos conjuntos de user stories:

- **Experiencia móvil (6.1–6.6)** — autenticación, búsqueda, visibilidad de precios,
  portfolio y watchlist desde el celular, más una interfaz responsive. Todas exigen, en sus
  escenarios, **el mismo comportamiento funcional que la web** y legibilidad en pantallas
  chicas. Se desarrolla en la Sección 9.
- **Rendimiento bajo carga (6.7–6.10)** — soporte de usuarios concurrentes sin errores 5xx,
  tiempos de respuesta dentro de un umbral, estabilidad bajo carga sostenida y degradación
  controlada al superar la capacidad. Se desarrolla en la Sección 8.

---

## 7. Estrategia de testing

La estrategia sigue la forma de una **pirámide de tests**: muchos tests unitarios rápidos en
la base, una capa intermedia de tests de integración (de backend y de frontend), y una
cúspide de tests end-to-end que recorren los flujos reales de usuario. Como se anticipó en la
Sección 1, esta pirámide no es un agregado: es el reflejo directo de cómo está construido el
sistema (interfaces, repositorios aislados, integraciones encapsuladas).

En total, el backend tiene del orden de **170 tests** repartidos en ~48 archivos, de los
cuales 12 son clases de integración. A esto se suman los tests del frontend, la suite de
Cypress (9 specs) y la de Appium (3 specs), y los tests del batch en Python.

### Base: tests unitarios con dobles `Fake*`

Los tests unitarios validan la **lógica de negocio de cada service de forma aislada**, sin
levantar Spring ni tocar la base de datos. La decisión distintiva, fijada como convención
del proyecto, es **no usar Mockito en este nivel**: las dependencias se reemplazan por
implementaciones falsas escritas a mano (`Fake*`) que implementan la misma interfaz de
dominio. Hay alrededor de trece de estas clases (`FakePositionRepository`,
`FakePriceService`, `FakeTickerEdgarClient`, `FakeTokenService`, …), muchas con **flags de
comportamiento** (`throwOnX = true`) y **contadores de llamadas** para poder verificar
interacciones.

La ventaja sobre el mocking tradicional es que el doble es código real, explícito y
reutilizable: se entiende qué hace sin descifrar expectativas, y permite simular escenarios
(servicio que falla, repositorio vacío, ticker inexistente) de forma directa. Estos tests
cubren casos como la normalización de tickers, el manejo de duplicados, la generación de
token, y —el más rico— el cálculo de posiciones y P&L a partir de múltiples compras y ventas.

Un caso particular es `EdgarApiClientTest`: como ahí lo que se quiere probar es el cliente
HTTP en sí (construcción de URLs, *padding* del CIK a 10 dígitos, parseo de la respuesta,
envoltorio de errores en `EdgarApiException`), se usa un `MockRestServiceServer` que
responde con cuerpos con la **forma real de las respuestas de EDGAR**, sin salir a la red.

### Capa intermedia: tests de integración (backend y frontend)

Esta capa tiene dos frentes que se complementan.

**Integración de backend (Testcontainers).** 12 clases que extienden `IntegrationTestBase`
levantan la **aplicación Spring completa** y la ejercitan por HTTP con `MockMvc`, contra una
base **PostgreSQL real provista por Testcontainers**. Así se valida el flujo entero
—controller → service → repository → base— incluyendo códigos de estado, forma del JSON,
validaciones, autenticación y persistencia. La clase base ofrece un helper
`loginAndGetToken()` que registra e inicia sesión un usuario único por test, y limpia las
cachés antes de cada test para evitar interferencias. Se prueban tanto los caminos felices
(registro, login, compra, venta, historial, cálculo de portfolio, watchlist) como los de
error (datos inválidos, falta de autenticación, recursos inexistentes, duplicados, fuente
externa caída — por ejemplo `CompanyApiDownIntegrationTest`). En este nivel, la dependencia
de EDGAR se reemplaza por un **doble controlado** inyectado en el contexto, para que el
resultado sea **determinístico** y no dependa de la disponibilidad de la API externa.

**Integración de frontend (Cypress interceptado).** Varias specs de Cypress prueban la
integración entre la interfaz y la API **interceptando las requests con `cy.intercept`**.
Esto permite controlar o verificar las respuestas del backend (estabilizar datos, forzar un
estado concreto, asegurar los códigos de estado que devuelven los endpoints) sin depender de
datos reales preexistentes. Es decir, validan que el frontend **dialoga correctamente con la
API** —qué request manda, cómo reacciona ante cada respuesta— de forma aislada y repetible.
Caen en este grupo, por ejemplo, las specs de portfolio (`portfolio-view`,
`portfolio-history`, `portfolio-trade`) y `watchlist`.

### Integración real contra servicios externos

La consigna pide además integración **real** contra las fuentes externas. Esto se cubre en
el batch de precios: `price-batch/tests/test_integration.py` corre el batch de verdad contra
**Yahoo Finance real** y una PostgreSQL real (Testcontainers), verificando que efectivamente
obtiene un precio positivo para un ticker (p. ej. AAPL o MSFT), lo persiste en `prices` y
registra la corrida como `SUCCESS` en `batch_runs`. Estos tests están marcados con
`@pytest.mark.integration` y requieren red, por lo que se ejecutan de forma **opt-in** (no
en cada corrida rápida) para no acoplar la suite a la disponibilidad de un servicio externo.

### Cúspide: tests end-to-end (Cypress real y Appium)

Los tests end-to-end validan los flujos completos **sin interceptar nada**, contra el sistema
realmente corriendo (frontend + backend + base levantados con Docker Compose):

- **Cypress real (web)** — specs que recorren el flujo de punta a punta contra el backend
  real, como `watchlist-real.cy.ts`, además de los flujos de autenticación y de búsqueda y
  detalle de empresas. Para seleccionar elementos se usan atributos `data-cy`, de modo que
  los tests no se rompen ante cambios de estilo o de texto visible.
- **Appium (mobile)** — 3 specs que automatizan la app Android sobre un emulador, recorriendo
  los flujos principales. El detalle de esta suite y de las decisiones de mobile se desarrolla
  en la Sección 9.

En conjunto, los niveles se complementan: los unitarios dan velocidad y aíslan la lógica; los
de integración validan el contrato HTTP, la persistencia y el diálogo frontend–API; los
end-to-end confirman que, integrado todo y sin dobles de por medio, el usuario puede hacer lo
que la feature prometía.

---

## 8. Performance testing con Locust (load vs. stress)

Las pruebas de performance, escritas con **Locust** (Python), buscan responder dos preguntas
distintas y por eso se separan en dos esquemas: el **load testing** verifica que el sistema
soporte una carga normal sostenida con buenos tiempos y sin errores, mientras que el **stress
testing** lo lleva muy por encima de su capacidad para encontrar el **punto de quiebre** y
verificar que degrade de forma controlada. Ambos cubren las user stories 6.7 a 6.10.

### Workflow realista del usuario virtual

Cada usuario virtual se comporta como un inversor real e independiente. En `on_start` **se
registra y loguea** con su propia cuenta (sin un pool de tokens compartido), de modo que cada
uno tiene su portfolio y no hay contención artificial de escritura. Luego ejecuta una mezcla
ponderada de operaciones:

| Workflow | Endpoint | Peso |
|----------|----------|------|
| Búsqueda por ticker | `GET /companies/search` | 5 |
| Ver portfolio con P&L | `GET /portfolio` | 3 |
| Comprar acción | `POST /portfolio/buy` | 2 |
| Vender sin poseer (→ 4xx esperado) | `POST /portfolio/sell` | 1 |

El último workflow lo exige la consigna (vender lo que no se posee): el `4xx` es el resultado
**correcto**, así que se marca como éxito esperado y **no infla la tasa de error**. Esta
distinción —contar como falla sólo lo que es una falla real del sistema— es la que hace que
el error rate signifique algo.

### Decisiones de medición y dimensionamiento

Para que las corridas sean comparables y reproducibles, se fijaron condiciones constantes:

- **Entorno acotado:** el backend se limita a **2 cores** (vía `docker-compose.stress.yml`).
  Esto da un techo de CPU reproducible e independiente de la máquina, y —clave— permite
  efectivamente provocar el quiebre; con muchos cores la app es tan liviana que no rompería.
- **Think-time 0:** sin pausas entre acciones, para máxima presión por usuario.
- **Timeout de 30 s por request:** un request colgado cuenta como **falla explícita**, no
  como latencia ilegible.
- **Métricas por percentiles (p50/p95/p99), nunca promedio:** el promedio esconde la cola;
  una brecha grande entre p50 y p99 es señal de saturación.
- **Base reseteada antes de cada corrida**, para no arrastrar estado viejo.

El **dimensionamiento se derivó empíricamente**, no se acordó de antemano: una corrida de
*capacity* con rampa escalonada encontró el *knee* (el punto donde el RPS deja de crecer y
sólo sube la latencia) en **~500 usuarios / ~1.950 rps**. A partir de ahí se definió la carga
de *load* en el **60% del knee (300 usuarios)** —zona cómoda— y un **umbral de p95 de 1.000
ms** (el p95 medido en load más un margen).

### Consideración del rate limit de EDGAR

La consigna pide contemplar el rate limit de EDGAR (10 req/s) en la estrategia de stress. La
estrategia lo respeta por diseño: el workflow de búsqueda (`GET /companies/search`) **no
genera tráfico contra EDGAR bajo carga**, porque se sirve de la caché de tickers (Sección 3),
que se precalienta con `warmup.py` antes de medir para evitar 503 por caché fría. Y el
proceso de actualización de precios contra Yahoo **no forma parte del bucle de carga**: corre
una única vez por invocación, no continuamente, por lo que no se ejercita como endpoint de
alta frecuencia. Así, llevar la API a decenas de miles de requests por segundo nunca se
traduce en violar el límite de la SEC.

### Resultados

Corridas del 18/06/2026, backend a 2 cores, auth real, think-time 0, timeout 30 s:

| Escenario | Usuarios | p50 | p95 | p99 | Throughput | Errores 5xx | Estado |
|-----------|----------|-----|-----|-----|------------|-------------|--------|
| Capacity (knee) | ~500 | 710 ms | 760 ms | — | ~1.950 rps | 0 | ✅ |
| Load (10 min) | 300 | 77 ms | 560 ms | 910 ms | ~1.836 rps | 0 | ✅ 6.7, 6.8 |
| Soak (30 min) | 300 | 73 ms | 410 ms | 760 ms | ~1.762 rps | 0 | ✅ 6.9 |
| Stress-A (shock onboarding →10.000) | rampa +1.000/escalón | — | techo 30 s | — | colapsa | 0 | ✅ 6.10 |
| Stress-B (carga gradual →10.000) | rampa +150/escalón | — | 230 ms→12 s | — | ~2.000 rps | 0 | ✅ 6.10 |

Lectura por user story:

- **6.7 — Usuarios concurrentes.** 300 usuarios durante 10 min: **0 errores 5xx** en
  ~1,1 millones de requests.
- **6.8 — Tiempos bajo carga.** p95 agregado de **560 ms**, holgadamente por debajo del
  umbral de 1.000 ms (la búsqueda ~110 ms; compra/venta/portfolio ~680 ms).
- **6.9 — Estabilidad sostenida (soak).** 30 min con p95 plano (520–580 ms, sin *creep*),
  memoria estable (~1 GiB, sin fugas) y CPU constante. El único "fallo" fue **1** `401`
  transitorio en 2,7 millones de requests —ni siquiera un 5xx—.
- **6.10 — Degradación controlada.** Verificada en dos modos de stress complementarios, ambos
  **sin un solo 5xx ni corrupción de datos**, y con recuperación a 0 errores al bajar la carga.

### El hallazgo: dos cuellos de botella distintos

Lo más interesante surgió de correr el stress de **dos maneras** y comparar:

- **Stress-A (shock de onboarding):** subiendo de a 1.000 usuarios por escalón, el sistema
  quiebra temprano, a **~1.050 usuarios**. La degradación es por descarte de conexiones y
  timeouts explícitos, sin 5xx.
- **Stress-B (carga gradual):** subiendo de a 150, el sistema aguanta **sin un solo error
  hasta ~8.400 usuarios**; recién ahí aparece el *breakpoint*, por saturación del límite de
  conexiones de Tomcat (`max-connections` ≈ 8.192, default sin tuning). La degradación es
  puro *load shedding*: el exceso se descarta al instante (p95 ~12 s, no llega al timeout),
  cero 5xx.

Como la única diferencia entre A y B es la **tasa de onboarding**, el contraste aísla el
cuello: el quiebre temprano del modo A es el **`bcrypt` del login/registro**, que es lento a
propósito y satura los 2 cores cuando se meten ~1.000 altas de golpe. Con onboarding suave,
ese cuello desaparece y el límite real pasa a ser la capacidad de conexiones del servidor.
Es un hallazgo legítimo y matizado —"el onboarding masivo satura el auth, no los flujos de
trading"— que sólo se ve gracias a separar los dos esquemas en lugar de reportar un único
número de quiebre.

---

## 9. Aplicación mobile (Capacitor)

### Capacitor vs. nativo: la decisión

La app mobile se construyó con **Capacitor** sobre el frontend web existente (Vite + React),
generando el proyecto Android nativo en `frontend/android`. La alternativa —una app
**nativa** (o un segundo framework como React Native)— se descartó deliberadamente.

El razonamiento es de costo/beneficio frente a lo que la consigna pedía. El requisito era una
app mobile *minimalista*, suficiente para probar el sistema; no una experiencia móvil con UI
nativa diferenciada. En ese marco, Capacitor encaja casi sin fricción: el frontend ya es una
app React basada en navegador, así que Capacitor **empaqueta el mismo build web dentro de una
cáscara Android** (un WebView) sin reimplementar la interfaz. La consecuencia directa es que
**product behavior, routing, servicios de API, estilos y tests viven en una única base de
código**: una corrección o una feature nueva se hace una sola vez y queda disponible en web y
mobile. Una app nativa, en cambio, habría duplicado la UI y la lógica de presentación sin
aportar valor real para el alcance pedido.

Estructuralmente, mantener `android/` dentro de `frontend/` es la disposición por defecto de
Capacitor y evita el cableado extra que tendría un paquete `mobile/` separado para consumir el
build del frontend. El flujo es: se compila la web a `frontend/dist` y Capacitor sincroniza
ese build en la cáscara Android.

### Tests E2E mobile con Appium

La app mobile se valida con una suite end-to-end de **WebdriverIO + Appium** sobre un emulador
Android, usando el driver **UiAutomator2**. Una particularidad técnica: aunque la app es un
WebView de Capacitor, su árbol de accesibilidad se expone como widgets nativos, así que los
elementos se localizan con `UiSelector` (por texto, descripción o `className`) **sin necesidad
de cambiar al contexto `WEBVIEW`**, apoyándose en *accessibility IDs* en lugar de posiciones o
textos frágiles. Las specs recorren los flujos principales —autenticación (US 6.1), visibilidad
de precios (US 6.3), compra/venta y portfolio con P&L e historial (US 6.4) y detalle financiero
de empresa (US 6.2)—, con helpers que preparan datos de prueba contra la API real antes de cada
escenario. Así se valida la integración completa app ↔ backend ↔ base, no sólo la UI.

### Limitaciones encontradas

El enfoque Capacitor trajo algunas limitaciones, que vale la pena dejar explícitas:

- **No hay barra de URL en la cáscara nativa.** En web, proteger una ruta se verifica por el
  redirect de URL; en la app, al no haber barra de direcciones, eso no aplica. La protección de
  rutas se validó entonces como *gating de navegación* (el área de portfolio no es accesible
  para un invitado), no como un cambio de URL.
- **`localhost` no apunta a la máquina de desarrollo.** Desde el emulador, el backend se accede
  vía `http://10.0.2.2:8080`, y la configuración de CORS del backend debe permitir el origen de
  Capacitor (`https://localhost`). Es un detalle de configuración que no existe en la web y que
  hubo que contemplar para que la app emulada hablara con la API.
- **Adaptación de tablas a pantallas chicas.** Vistas densas como el portfolio con P&L requieren
  scroll horizontal para mostrar todas las columnas en un celular; los tests lo contemplan
  explícitamente.
- **iOS quedó fuera de alcance.** Capacitor soporta iOS con `@capacitor/ios`, pero compilar y
  correr iOS exige macOS y Xcode, por lo que sólo se desarrolló y probó el target Android.

En conjunto, Capacitor cumplió el objetivo —una app mobile real, instalable y testeable de
punta a punta, reutilizando todo el frontend— a un costo muy bajo, que era exactamente el
balance que buscábamos para el alcance del trabajo.

---

## 10. Decisiones de diseño destacadas

Esta sección profundiza en un puñado de decisiones que condensan el espíritu del trabajo:
resolver el dominio de forma simple, correcta y testeable.

### Valorización contra el precio almacenado

Ya se introdujo en las Secciones 2 y 3, pero es la decisión transversal del sistema: **ningún
cálculo de negocio consulta Yahoo Finance en vivo**. Las compras y ventas usan el último
precio almacenado (`PriceService.getLatestPrice`), y la valorización del portfolio también.
Esto hace que la operación sea determinística (dos consultas seguidas dan el mismo resultado),
rápida (sin latencia de red en el camino crítico) y testeable (basta con sembrar un precio
para probar todo el flujo). El precio se actualiza por fuera, mediante el batch (Sección 3).

### Posiciones por costo promedio ponderado

El cálculo de posiciones y P&L fue la parte menos trivial del dominio, porque hay que combinar
múltiples compras y ventas de un mismo ticker en una sola posición coherente. La decisión fue
modelar cada posición con dos datos —**cantidad** y **precio de compra promedio
(`avgBuyPrice`)**— y mantenerla con el método de **costo promedio ponderado**:

- **Al comprar**, el nuevo promedio pondera la posición existente con la nueva compra:

  ```
  nuevoAvg = (cantExistente · avgExistente + cantComprada · precio) / (cantExistente + cantComprada)
  ```

- **Al vender**, sólo se reduce la cantidad; el precio promedio **no cambia** (vender no
  altera el costo de lo que queda). Si la cantidad llega a cero, la posición se elimina.
- El **P&L no realizado** de cada posición es entonces `(precioActual − avgBuyPrice) ·
  cantidad`, y el porcentaje, `(precioActual − avgBuyPrice) / avgBuyPrice · 100`. El valor
  total del portfolio es la suma de los valores actuales de cada posición.

Se eligió costo promedio (y no, por ejemplo, lotes FIFO) por una razón de proporcionalidad: es
el modelo más simple que responde correctamente las preguntas que el producto necesita
—¿cuánto vale mi posición y cuánto gané/perdí respecto de lo que me costó en promedio?— sin
introducir la complejidad de rastrear lotes individuales, que el alcance del TP no requería.
Cada operación, además, se persiste como una `Transaction` (BUY/SELL) independiente, de modo
que el **historial completo** queda registrado aunque la posición agregada se simplifique a
cantidad + promedio.

### Aritmética con `BigDecimal` y redondeo controlado

Por tratarse de dinero, todos los cálculos monetarios usan `BigDecimal` (nunca `Double`), con
**redondeo explícito** (`RoundingMode.HALF_UP`) y escala fija donde corresponde —por ejemplo,
el promedio de compra se redondea a 4 decimales, y el porcentaje de P&L a 2—. Es una decisión
chica pero deliberada: evita los errores de coma flotante que harían que dos caminos de cálculo
equivalentes dieran resultados distintos, algo inadmisible en valores que el usuario lee como
plata.

### Comportamiento ante datos faltantes

Un detalle de robustez: si un ticker de una posición **no tiene precio almacenado** (por
ejemplo, el batch nunca pudo traerlo), la posición no rompe el cálculo ni se omite. Se muestra
con su cantidad y precio de compra, pero con valor actual y P&L en nulo, y simplemente **no
suma al valor total**. Así el portfolio sigue siendo consultable y el usuario ve qué posición
carece de precio, en lugar de recibir un error.

---

## 11. Posibles puntos de mejora

El trabajo cumplió sus objetivos, pero el proceso dejó a la vista varios puntos donde, con más
tiempo o en una próxima iteración, habríamos hecho las cosas distinto. Vale la pena dejarlos
explícitos, porque son aprendizajes tanto sobre el producto como sobre la forma de trabajar.

### Definir el pipeline Features → User Stories → Escenarios desde el principio

La jerarquía de especificación (Sección 6) terminó siendo muy útil, pero **los escenarios de
aceptación se incorporaron en buena medida sobre la marcha**, no desde el arranque de cada
feature. Hacerlo al revés —escribir los escenarios *antes* de empezar a implementar, como
contrato previo— habría reforzado el enfoque tipo ATDD que buscábamos, haría más natural
escribir el test antes que el código, y habría evitado retoques posteriores a la
especificación. Es un cambio de orden, no de herramientas, pero con impacto en la disciplina
del flujo.

### Refinar el `CLAUDE.md` para asegurar calidad por defecto

Buena parte de las convenciones del proyecto (arquitectura en capas, `Fake*` en vez de
Mockito, DTOs separados de entidades, etc.) viven en el `CLAUDE.md`. Con más tiempo, habría
valido la pena **refinar ese documento** para que algunas de esas garantías de calidad
quedaran planteadas de forma más completa y precisa, de modo que se aplicaran por defecto sin
tener que explicitar cada detalle en el momento. No tenemos del todo claro qué faltó —parte del
aprendizaje es justamente eso—, pero la dirección es clara: cuanto mejor planteado esté el
documento de convenciones, más consistente y menos dependiente de recordatorios puntuales es el
resultado.

### Releases más granulares y lineales

El versionado siguió SemVer y mapeó cada feature a una release (Sección 5), lo cual es legible,
pero las releases fueron **gruesas** (una por feature completa). Releases **más granulares y
lineales** —por ejemplo, por user story terminada— darían una historia de versiones más fina,
facilitarían identificar exactamente en qué versión entró cada cambio y acercarían el proyecto
a un esquema de entrega continua real.

### Mejor solución para los *tracked tickers*

El sistema mantiene un conjunto de tickers "seguidos" (`tracked_tickers`) que, junto con los de
portfolios y watchlists, determinan para qué símbolos el batch trae precios. Hoy esto funciona
esencialmente como una **whitelist** sembrada, lo cual resuelve el problema técnico (acotar qué
precios actualizar) pero **limita la experiencia**: el usuario no puede operar libremente
cualquier ticker, sino los que estén dentro de ese conjunto. No es obvio que exista una
alternativa sin algún tipo de lista acotada —traer precios de todo el universo de tickers no es
realista—, pero desde el punto de vista de UX habría valido la pena explorar una mejor: por
ejemplo, **incorporar un ticker bajo demanda** la primera vez que un usuario lo busca o intenta
operarlo (agregándolo automáticamente al conjunto a actualizar), en lugar de depender de una
whitelist predefinida.

---

## 12. Conclusión

El objetivo del trabajo no era tanto construir un portfolio tracker como **usar ese producto
para aplicar aseguramiento de la calidad de software**, y ese fue el hilo que recorrió todas
las decisiones. La tesis que adoptamos desde el principio —tratar la testeabilidad como un
requisito de diseño— se materializó en una arquitectura en capas con interfaces, integraciones
externas encapsuladas y fakeables, y un esquema de persistencia versionado; y se pagó después
en una pirámide de tests que es el reflejo de esa estructura, no un agregado posterior.

Sobre esa base, cumplimos los requisitos de la consigna: las seis features con sus user stories
y escenarios de aceptación, la integración real con SEC EDGAR (con su rate limiting y caché) y
con Yahoo Finance a través de un batch independiente, el diseño "precio almacenado" que hace
determinística la valorización, los tests unitarios con `Fake*`, los de integración con
Testcontainers, los end-to-end en web (Cypress) y mobile (Appium), las pruebas de carga y
estrés con Locust diferenciando ambos esquemas, el stack completo en Docker Compose con
volúmenes persistentes, el versionado SemVer y la integración continua en GitHub Actions.

Más allá del cumplimiento, lo más valioso fueron los lugares donde la forma de trabajar dejó
aprendizajes: el orden en que conviene definir features, historias y escenarios; cómo el
contraste entre dos esquemas de stress reveló que el cuello bajo onboarding masivo era el auth
y no los flujos de negocio; y los puntos de mejora que identificamos para una próxima
iteración. El sistema quedó funcionando, probado de punta a punta y con su calidad
documentada, que era exactamente lo que el trabajo se proponía demostrar.
