# Pay and Pray — Development Guidelines

## Backend (Kotlin + Spring Boot)

### Package structure
Each feature gets its own package under `edu.faculty.aseca.pay_and_pray_api/`:
```
feature/
  FeatureController.kt
  FeatureService.kt          ← interface
  FeatureServiceImpl.kt
  FeatureRepository.kt       ← interface
  FeatureRepositoryImpl.kt   ← wraps JpaFeatureRepository
  JpaFeatureRepository.kt    ← extends JpaRepository<Entity, UUID>
  Entity.kt
  dto/
    FeatureRequest.kt
    FeatureResponse.kt
```

### Controllers
- `@RestController` + `@RequestMapping("/feature")`
- Constructor injection only (no `@Autowired` on fields)
- Validate request bodies with `@Valid`; never validate inside the service
- Return `ResponseEntity<T>` only when HTTP status varies; otherwise return the DTO directly

### Services
- Always define an interface + implementation (`FeatureService` / `FeatureServiceImpl`)
- Business logic lives here, not in controllers
- Throw custom unchecked exceptions for expected failures (see Errors section)

### Repositories
- Always define a domain interface (`FeatureRepository`) that hides JPA
- `FeatureRepositoryImpl` wraps `JpaFeatureRepository` and is the only class that knows about JPA
- Use Spring Data method-name queries in `JpaFeatureRepository`; avoid raw JPQL unless needed

### Entities & DTOs
- JPA entities: `@Entity`, `@Table`, `@Id @GeneratedValue(strategy = GenerationType.UUID)`, `data class`
- Request DTOs: validation annotations on fields (`@field:NotBlank`, `@field:Email`, `@field:Size`)
- Response DTOs: plain `data class`, no annotations
- Keep entities and DTOs separate — never expose an entity directly from a controller

### Errors
- One custom exception class per failure mode (e.g. `NotFoundException`, `InsufficientFundsException`)
- All extend `RuntimeException`; no checked exceptions
- Register each one in `GlobalExceptionHandler` (`@RestControllerAdvice`) with the correct HTTP status
- Response body is always `ErrorResponse(val error: String)` or `ValidationErrorResponse(val errors: Map<String, String>)`

### External API integrations
- Define an interface (e.g. `EdgarClient`) with the exact methods the app needs
- One `@Component` implementation that handles HTTP, rate limiting, error wrapping
- Wrap HTTP exceptions in a domain-specific exception (e.g. `EdgarApiException`)
- This makes the integration fakeable in tests without mocks

### Database migrations
- One Flyway file per migration: `V{n}__{snake_case_description}.sql` in `src/main/resources/db/migration`
- Hibernate is set to `ddl-auto: validate` — never let it modify the schema
- Always add a new migration file; never edit an existing one

### Security
- All routes require JWT unless explicitly permitted in `SecurityConfig`
- Add new public routes to the `permitAll()` block in `SecurityConfig`
- User ID comes from `Authentication` injected by Spring, not from request body/params

### Testing
**Unit tests** (no Spring context):
- Use manual `Fake*` classes that implement service/repository interfaces — no Mockito
- `Fake*` classes live in the test source set alongside the tests they support
- Add behavior flags (`throwOnX: Boolean = false`) and call counters when testing interactions

**Integration tests**:
- Extend `IntegrationTestBase` — gives `MockMvc` + Testcontainers PostgreSQL
- Test the full HTTP request/response including status codes and JSON shape
- Use `loginAndGetToken()` from the base class to get a valid JWT for protected endpoints

**Naming**:
- Backtick test names: `` `does X when Y` ``
- Group by scenario, not by method name

### Kotlin style
- Prefer `data class` for all DTOs and value objects
- Use `by lazy` for expensive initialization
- Prefer scope functions (`also`, `let`) over temp variables when intent is clear
- Nullability: use `?.`, `?:`, and `firstOrNull()` — never `!!` unless the null case is truly impossible

---

## Frontend (React / Capacitor)

See `frontend/CLAUDE.md` for frontend-specific rules.
