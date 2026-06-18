# language: es
@stress @rendimiento
Característica: Rendimiento bajo carga
  Como operador del sistema
  Quiero que la aplicación se mantenga estable y con buenos tiempos de respuesta bajo carga
  Para garantizar disponibilidad y una buena experiencia

  # NOTA DE IMPLEMENTACIÓN:
  # Estos escenarios documentan los criterios de aceptación de rendimiento, pero
  # NO se automatizan con Cucumber/behave. Su ejecución se realiza con Locust.
  # Los valores de las tablas de Ejemplos se DERIVAN midiendo (no se acuerdan a
  # priori): un capacity test halla el knee y de ahí se dimensionan load/soak/stress.
  # Entorno fijo: backend a 2 cores, auth real (register+login), think-time 0.
  # Metodología, comandos y resultados completos: load-tests/README.md.
  #
  # Los valores de abajo se confirmaron midiendo (capacity → load → soak → stress).
  # Resultados detallados por escenario en load-tests/README.md (§Resultados).

  # ---------------------------------------------------------------------------
  # User Story 6.7 - Soporte de usuarios concurrentes
  # ---------------------------------------------------------------------------

  Esquema del escenario: Soporte de usuarios concurrentes
    Dado que hay <usuarios> usuarios autenticados de forma concurrente
    Cuando todos ejecutan las operaciones principales del sistema
    Entonces todas las operaciones siguen funcionando
    Y el sistema no devuelve errores de servidor (5xx)

    # Medido (18/06/2026): load a 300 usuarios (≈60% del knee=500), 10 min →
    # 0 errores 5xx en 1.101.723 requests. ✅
    Ejemplos:
      | usuarios |
      | 300      |

  # ---------------------------------------------------------------------------
  # User Story 6.8 - Tiempos de respuesta bajo carga
  # ---------------------------------------------------------------------------

  Esquema del escenario: Tiempos de respuesta dentro del umbral acordado
    Dado que hay <usuarios> usuarios concurrentes
    Cuando consultan las operaciones principales del sistema
    Entonces la métrica "<metrica>" de tiempo de respuesta se mantiene por debajo de "<umbral>"

    # Umbral derivado del p95 medido en load (~560ms) + margen. Medido p95 = 560ms < 1000ms. ✅
    Ejemplos:
      | usuarios | metrica | umbral  |
      | 300      | p95     | 1000 ms |

  # ---------------------------------------------------------------------------
  # User Story 6.9 - Estabilidad bajo carga sostenida
  # ---------------------------------------------------------------------------

  Esquema del escenario: Estabilidad durante carga sostenida
    Dado un nivel de carga constante durante "<duracion>"
    Cuando se mantiene esa carga de forma continua
    Entonces no se observa degradación progresiva de los tiempos de respuesta
    Y el uso de recursos (memoria, conexiones) se mantiene estable, sin fugas evidentes

    # Medido (18/06/2026): soak 30 min a 300 usuarios → p95 plano 520-580ms (sin creep),
    # memoria estable 1.01-1.05 GiB (sin fugas). ✅
    Ejemplos:
      | duracion |
      | 30 min   |

  # ---------------------------------------------------------------------------
  # User Story 6.10 - Degradación controlada al superar la capacidad
  # ---------------------------------------------------------------------------

  # Se valida con el stress (rampa progresiva muy por encima del knee): al superar la
  # capacidad, el sistema debe degradar de forma controlada — errores claros / descarte
  # de conexiones, sin 5xx ni pérdida de datos, y recuperarse al bajar la carga. El
  # intento de vender acciones nunca compradas devuelve 4xx claro.
  # Medido (18/06/2026), dos modos de stress:
  #  - Shock de onboarding (+1000/escalón → 10.000): quiebre ~1.050 usuarios; degrada por
  #    descarte de conexiones + timeouts (cero 5xx), no crashea (mem ~1.13 GiB) y se recupera
  #    al bajar la carga (a 150 usuarios: 0 errores, p95 230ms).
  #  - Carga gradual (+150/escalón → 10.000): 0 errores hasta 8.400 usuarios, degradación
  #    100% por latencia (p95 lineal 230ms→12s, throughput plano ~2000 rps). Breakpoint a
  #    8.450 usuarios por descarte de conexiones (satura max-connections=8192 de Tomcat);
  #    load shedding controlado (p95 se queda en ~12s, no llega a 30s), cero 5xx.
  # Conclusión: el cuello con onboarding masivo es el bcrypt del auth (~1.050); con onboarding
  # suave no hay quiebre de workflows hasta el techo de conexiones de Tomcat (~8.192). ✅
  Escenario: Degradación controlada al superar la capacidad soportada
    Dado que la carga supera la capacidad objetivo del sistema
    Cuando se siguen recibiendo solicitudes
    Entonces el sistema informa el error de forma clara
    Y no se cae por completo
    Y no se corrompen ni se pierden datos
