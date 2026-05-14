# T11 — Company Search Backend

## Descripción

Endpoint de búsqueda de empresas por nombre o ticker. Consume el `EdgarClient` (T6) a través de su port, mapea los resultados a una respuesta propia de la API, y maneja errores si EDGAR no está disponible.

---

## Archivos

```
backend/src/main/kotlin/.../
└── company/
    ├── CompanySearchResult.kt      DTO de cada resultado
    ├── CompanySearchResponse.kt    wrapper de la respuesta { results, total }
    ├── CompanySearchService.kt     @Service — lógica de mapeo y deduplicación
    └── CompanySearchController.kt  @RestController GET /companies/search

backend/src/test/kotlin/.../
└── company/
    └── CompanySearchServiceTest.kt 4 tests con FakeEdgarClient
```

**Archivo modificado:** `config/GlobalExceptionHandler.kt` — se agregó el handler de `EdgarApiException`.

---

## Endpoint

```
GET /companies/search?q={query}
```

| Caso | Status | Body |
|------|--------|------|
| Resultados encontrados | 200 | `{ "results": [...], "total": N }` |
| Sin coincidencias | 200 | `{ "results": [], "total": 0 }` |
| EDGAR no disponible | 503 | `{ "error": "EDGAR service unavailable..." }` |
| Parámetro `q` ausente | 400 | error estándar de Spring |

**Ejemplo de respuesta 200:**
```json
{
  "results": [
    { "name": "Apple Inc.", "ticker": "AAPL", "cik": "320193" },
    { "name": "Apple Hospitality REIT Inc.", "ticker": null, "cik": "1418121" }
  ],
  "total": 2
}
```

---

## Modelos

### `CompanySearchResult`
```kotlin
data class CompanySearchResult(
    val name: String,
    val ticker: String?,  // puede no estar disponible en todos los resultados de EDGAR
    val cik: String?      // ID de la empresa en la SEC (sin zero-padding)
)
```

### `CompanySearchResponse`
```kotlin
data class CompanySearchResponse(
    val results: List<CompanySearchResult>,
    val total: Int
)
```

---

## Lógica del servicio (`CompanySearchService`)

1. Llama a `edgarClient.searchFullText(query)` — delega en el port de T6
2. Mapea cada `FullTextHit` a `CompanySearchResult`:
   - `name` ← `hit.source["entity_name"]` (campo estándar de EDGAR)
   - `ticker` ← `hit.source["ticker_symbol"]` (nullable — no siempre presente)
   - `cik` ← primeros dígitos del `hit.id` antes del primer guión, sin ceros a la izquierda
3. Deduplica por nombre con `distinctBy { it.name }` — una empresa puede aparecer en múltiples filings 10-K
4. `EdgarApiException` **no** se captura en el servicio — sube al `GlobalExceptionHandler`

**Extracción del CIK desde el ID del hit:**  
El `_id` de EDGAR es el número de accesión (ej: `0000320193-24-000006`). Los dígitos antes del primer `-` son el CIK zero-padded. Se hace `substringBefore('-').trimStart('0')` para obtener el CIK limpio.

---

## Controller (`CompanySearchController`)

```kotlin
@RestController
@RequestMapping("/companies")
class CompanySearchController(private val service: CompanySearchService) {

    @GetMapping("/search")
    fun search(@RequestParam q: String): CompanySearchResponse = service.search(q)
}
```

El controller es solo routing — sin manejo de errores propio.

## Manejo de errores (`GlobalExceptionHandler`)

`EdgarApiException` se maneja en el `@RestControllerAdvice` global (`config/GlobalExceptionHandler.kt`), junto con las excepciones de auth. Devuelve 503 usando el mismo `ErrorResponse` que el resto del sistema:

```kotlin
@ExceptionHandler(EdgarApiException::class)
fun handleEdgarUnavailable(ex: EdgarApiException): ResponseEntity<ErrorResponse> =
    ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
        .body(ErrorResponse(error = ex.message ?: "EDGAR service unavailable. Please try again later."))
```

El handler se centralizó aquí (en lugar de en el controller) para mantener consistencia con el patrón del proyecto.

---

## Tests (`CompanySearchServiceTest`)

**Framework:** JUnit 5 + `FakeEdgarClient` (implementación manual de `EdgarClient`, sin Spring context, sin red)

| Test | Qué verifica |
|------|-------------|
| `search returns mapped results` | `entity_name` → `name`, `ticker_symbol` → `ticker`, CIK extraído del ID |
| `search deduplicates companies with multiple filings` | Dos hits de la misma empresa → un solo resultado |
| `search returns empty response when no hits` | `total: 0`, lista vacía |
| `search propagates EdgarApiException when EDGAR is down` | La excepción sube sin ser swallowed |

```bash
./gradlew test --tests "*.company.CompanySearchServiceTest"
```

**Sobre `FakeEdgarClient`:** implementa `EdgarClient` solo para `searchFullText`. Los demás métodos lanzan `UnsupportedOperationException`. Usa un `companion object` con `nextResult` para configurar el comportamiento por test.

---

## Mapeo al patrón hexagonal

T11 no agrega nuevos ports ni adapters — solo la capa de aplicación (service + controller) sobre el port existente de T6.

| Capa | Archivo |
|------|---------|
| Port (reutilizado) | `edgar/EdgarClient.kt` |
| Adapter (reutilizado) | `edgar/EdgarApiClient.kt` |
| Service | `company/CompanySearchService.kt` |
| Controller | `company/CompanySearchController.kt` |
| DTOs de API | `CompanySearchResult.kt`, `CompanySearchResponse.kt` |
| Excepción (reutilizada) | `edgar/EdgarApiException.kt` |
