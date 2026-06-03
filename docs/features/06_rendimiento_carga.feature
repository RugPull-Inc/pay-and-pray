# language: es
@stress @rendimiento
Característica: Rendimiento bajo carga
  Como operador del sistema
  Quiero que la aplicación se mantenga estable y con buenos tiempos de respuesta bajo carga
  Para garantizar disponibilidad y una buena experiencia

  # NOTA DE IMPLEMENTACIÓN:
  # Estos escenarios documentan los criterios de aceptación de rendimiento, pero
  # NO se automatizan con Cucumber/behave. Su ejecución se realiza con herramientas
  # de pruebas de carga (k6, JMeter, Locust). Los valores entre < > quedan por
  # definir con el equipo y se completan en las tablas de Ejemplos.

  # ---------------------------------------------------------------------------
  # User Story 6.7 - Soporte de usuarios concurrentes
  # ---------------------------------------------------------------------------

  Esquema del escenario: Soporte de usuarios concurrentes
    Dado que hay <usuarios> usuarios autenticados de forma concurrente
    Cuando todos ejecutan las operaciones principales del sistema
    Entonces todas las operaciones siguen funcionando
    Y el sistema no devuelve errores de servidor (5xx)

    Ejemplos:
      | usuarios   |
      | a definir  |

  # ---------------------------------------------------------------------------
  # User Story 6.8 - Tiempos de respuesta bajo carga
  # ---------------------------------------------------------------------------

  Esquema del escenario: Tiempos de respuesta dentro del umbral acordado
    Dado que hay <usuarios> usuarios concurrentes
    Cuando consultan las operaciones principales del sistema
    Entonces la métrica "<metrica>" de tiempo de respuesta se mantiene por debajo de "<umbral>"

    Ejemplos:
      | usuarios  | metrica   | umbral    |
      | a definir | a definir | a definir |

  # ---------------------------------------------------------------------------
  # User Story 6.9 - Estabilidad bajo carga sostenida
  # ---------------------------------------------------------------------------

  Esquema del escenario: Estabilidad durante carga sostenida
    Dado un nivel de carga constante durante "<duracion>"
    Cuando se mantiene esa carga de forma continua
    Entonces no se observa degradación progresiva de los tiempos de respuesta
    Y el uso de recursos (memoria, conexiones) se mantiene estable, sin fugas evidentes

    Ejemplos:
      | duracion  |
      | a definir |

  # ---------------------------------------------------------------------------
  # User Story 6.10 - Degradación controlada al superar la capacidad
  # ---------------------------------------------------------------------------

  Escenario: Degradación controlada al superar la capacidad soportada
    Dado que la carga supera la capacidad objetivo del sistema
    Cuando se siguen recibiendo solicitudes
    Entonces el sistema informa el error de forma clara
    Y no se cae por completo
    Y no se corrompen ni se pierden datos
