# T11 — SEC EDGAR API Client

## Descripción

Implementación del cliente HTTP para la API pública de EDGAR (SEC). Actúa como adapter de infraestructura dentro de la arquitectura hexagonal del proyecto, exponiendo un port (`EdgarClient`) del que dependen T12 (company search) y T13 (financial details).

---

## Archivos

```
backend/src/main/kotlin/.../
├── edgar/
│   ├── EdgarClient.kt              port (interface)
│   ├── EdgarApiClient.kt           adapter HTTP (@Component)
│   ├── EdgarModels.kt              DTOs de respuesta
│   └── EdgarApiException.kt        excepción de dominio
└── config/
    └── EdgarConfig.kt              bean RestTemplate con interceptor User-Agent

backend/src/test/kotlin/.../
└── edgar/
    └── EdgarApiClientTest.kt       8 tests (MockRestServiceServer)
```

**Archivos modificados:**
- `build.gradle` — dependencia `com.bucket4j:bucket4j-core:8.10.1`
- `src/main/resources/application.yml` — sección `edgar.user-agent`

**Variable de entorno requerida:**
```
EDGAR_USER_AGENT=PayAndPray/1.0 <email-contacto>
```
EDGAR requiere un User-Agent descriptivo con nombre de proyecto y email. Requests sin este header pueden ser bloqueados.

---

## API cubierta

| Método | Endpoint EDGAR |
|--------|---------------|
| `getCompanySubmissions(cik)` | `https://data.sec.gov/submissions/CIK{CIK}.json` |
| `getCompanyFacts(cik)` | `https://data.sec.gov/api/xbrl/companyfacts/CIK{CIK}.json` |
| `getCompanyConcept(cik, concept)` | `https://data.sec.gov/api/xbrl/companyconcept/CIK{CIK}/us-gaap/{concept}.json` |
| `searchFullText(query)` | `https://efts.sec.gov/LATEST/search-index?q={query}&forms=10-K` — solo empresas con 10-K anual (ver decisiones) |
| `getCompanyTickers()` | `https://www.sec.gov/files/company_tickers.json` |

---

## Modelos (`EdgarModels.kt`)

Cada modelo mapea la respuesta JSON de un endpoint de EDGAR.

### `CompanySubmissions` — metadata de una empresa
```kotlin
data class CompanySubmissions(
    val cik: String,             // ID único en la SEC (ej: "0000320193")
    val name: String,            // nombre legal (ej: "Apple Inc.")
    val tickers: List<String>,   // tickers en bolsa (ej: ["AAPL"])
    val exchanges: List<String>  // mercados donde cotiza (ej: ["Nasdaq"])
)
```
Usado por `getCompanySubmissions(cik)`. El JSON real tiene muchos más campos (filings, SIC codes, direcciones) — `@JsonIgnoreProperties(ignoreUnknown = true)` los descarta silenciosamente.

### `CompanyFacts` — todos los datos financieros XBRL
```kotlin
data class CompanyFacts(
    val cik: String,
    val entityName: String,
    val facts: Map<String, Any>  // estructura anidada compleja
)
```
`facts` es intencionalmente `Map<String, Any>` porque la estructura real es muy profunda y variable. T13 va a tipar lo que necesita cuando trabaje el detalle financiero.

### `CompanyConcept` — una métrica financiera específica
```kotlin
data class CompanyConcept(
    val cik: String,
    val entityName: String,
    val tag: String,             // nombre del concepto (ej: "Revenues", "EarningsPerShareBasic")
    val units: Map<String, Any>  // valores históricos por unidad (USD, shares, etc.)
)
```
Más granular que `CompanyFacts` — se pide una sola métrica en lugar de todas. Usado por `getCompanyConcept(cik, concept)`.

### `FullTextSearchResult` / `FullTextHits` / `FullTextTotal` / `FullTextHit` — resultado de búsqueda
```kotlin
data class FullTextSearchResult(val hits: FullTextHits)
data class FullTextHits(
    val total: FullTextTotal,      // cuántos resultados hay en total
    val hits: List<FullTextHit>    // página de resultados
)
data class FullTextTotal(val value: Int, val relation: String)
data class FullTextHit(
    @JsonProperty("_id") val id: String,
    @JsonProperty("_source") val source: Map<String, Any>
)
```
Son 4 clases porque el JSON de EDGAR tiene esa estructura anidada. Los `@JsonProperty` existen porque el JSON usa nombres con guión bajo (`_id`, `_source`) que son inválidos como identificadores Kotlin.

### `CompanyTicker` — entrada del mapa global de tickers
```kotlin
data class CompanyTicker(
    @JsonProperty("cik_str") val cikStr: Int,
    val name: String,
    val ticker: String,   // ej: "AAPL"
    val exchange: String  // ej: "Nasdaq"
)
```
El endpoint `/company_tickers.json` devuelve un objeto indexado por número ordinal:
```json
{ "0": {"cik_str": 320193, "name": "Apple Inc.", "ticker": "AAPL", ...}, "1": {...} }
```
Por eso `getCompanyTickers()` devuelve `Map<String, CompanyTicker>` — las claves son `"0"`, `"1"`, etc. El `@JsonProperty("cik_str")` convierte el snake_case del JSON a camelCase en Kotlin.

---

## Decisiones de diseño

### CIK zero-padding

EDGAR requiere que el CIK tenga exactamente 10 dígitos en la URL (ej: `320193` → `0000320193`). Esto se centraliza como extension function privada en `EdgarApiClient`:

```kotlin
private fun String.padCik() = padStart(10, '0')
```

Si el caller ya pasa el CIK con ceros (`"0000320193"`), `padStart` no agrega más — no hay doble padding.

### Rate limiting

EDGAR tiene un límite de 10 requests/segundo. Se usa Bucket4j con un token bucket greedy:

```kotlin
Bandwidth.builder().capacity(10).refillGreedy(10, Duration.ofSeconds(1)).build()
```

`bucket.asBlocking().consume(1)` bloquea el thread hasta que haya un token disponible. Esto hace que el cliente sea naturalmente respetuoso del rate limit sin necesidad de manejo externo. Thread-safe por diseño de Bucket4j.

Se eligió Bucket4j (100 KB) sobre Guava RateLimiter porque Guava no es transitivo en Spring Boot 4 (800 KB solo para un RateLimiter).

### User-Agent header

Configurado como `ClientHttpRequestInterceptor` en el bean `edgarRestTemplate` (en `EdgarConfig`). Se aplica automáticamente a todos los requests sin repetición en cada método. El bean está nombrado explícitamente con `@Qualifier("edgarRestTemplate")` para no interferir con otros beans `RestTemplate` que puedan agregarse en el futuro.

### Error handling

Todo error HTTP se envuelve en `EdgarApiException` (RuntimeException). El caller (T11/T13) decide cómo manejarlo — por ejemplo, devolviendo un 503 al usuario si EDGAR no responde.

### Filtro `forms=10-K` en búsqueda

`searchFullText` filtra resultados a filings de tipo 10-K (reporte anual). Esto es intencional: para un portfolio tracker, el universo relevante son las empresas que cotizan en bolsas mayores de EE.UU., todas las cuales deben presentar 10-K. Empresas con solo 10-Q u 8-K (ej. extranjeras con Form 20-F) no van a aparecer en los resultados de búsqueda.

### DTOs

Los campos con nombres que no son idiomatic Kotlin (como `_id`, `_source`, `cik_str`) usan `@JsonProperty`. Los campos desconocidos del JSON de EDGAR se descartan silenciosamente mediante configuración global de Jackson (`spring.jackson.deserialization.fail-on-unknown-properties=false` en `application.yml`).

---

## Tests

**Archivo:** `EdgarApiClientTest.kt`  
**Framework:** JUnit 5 + `MockRestServiceServer` (sin red, sin Spring context)

| Test | Qué verifica |
|------|-------------|
| `getCompanySubmissions pads cik to 10 digits` | URL construida con CIK zero-padded |
| `getCompanyFacts returns parsed response` | Deserialización de Company Facts |
| `getCompanyConcept includes concept in url` | URL incluye el concept name |
| `searchFullText encodes query and returns hits` | Query URL-encoded, parsing de hits |
| `getCompanyTickers parses ordinal-keyed map` | Mapa con claves ordinales (`"0"`, `"1"`) |
| `http error wraps in EdgarApiException` | 4xx/5xx → EdgarApiException |
| `cik with leading zeros is not double-padded` | CIK ya de 10 dígitos no se modifica |
| `user-agent header is present in every request` | Header User-Agent presente en cada call |

```bash
./gradlew test --tests "*.edgar.EdgarApiClientTest"
```

