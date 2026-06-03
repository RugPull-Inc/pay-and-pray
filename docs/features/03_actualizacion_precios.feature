# language: es
@precios
Característica: Proceso de actualización de precios
  Como usuario autenticado y como operador del sistema
  Quiero precios actualizados y poder consultar la fecha de actualización
  Para asegurar que la información financiera del sistema sea relevante

  # ---------------------------------------------------------------------------
  # User Story 3.1 - Visibilidad de actualización de precios
  # ---------------------------------------------------------------------------

  @auth
  Escenario: Ver fecha y hora de la última actualización exitosa
    Dado que el usuario está autenticado
    Y existe una ejecución exitosa registrada el "2026-05-27 18:00"
    Cuando consulto la información de actualización de precios
    Entonces el sistema muestra la fecha y hora de la última actualización exitosa
    Y corresponde a la última ejecución registrada en el sistema

  @auth
  Escenario: El proceso de actualización nunca se ejecutó
    Dado que el usuario está autenticado
    Y no existe ninguna ejecución de actualización registrada
    Cuando consulto la información de actualización de precios
    Entonces el sistema informa que el proceso nunca se ejecutó

  Escenario: Usuario no autenticado intenta ver la actualización
    Dado que el usuario no está autenticado
    Cuando intento consultar la información de actualización de precios
    Entonces el sistema deniega el acceso

  # ---------------------------------------------------------------------------
  # User Story 3.2 - Ejecutar batch de precios (operador / pipeline de CI)
  # ---------------------------------------------------------------------------

  @batch
  Escenario: Ejecución exitosa del batch de precios
    Dado que el operador dispara manualmente el proceso de actualización de precios
    Cuando el sistema obtiene los últimos cierres desde Yahoo Finance
    Entonces el sistema actualiza los precios almacenados
    Y registra la fecha y hora de la ejecución exitosa

  @batch
  Escenario: Falla durante la ejecución del batch
    Dado que existe una ejecución exitosa previa registrada el "2026-05-26 18:00"
    Cuando el proceso de actualización falla durante su ejecución
    Entonces el sistema informa la falla claramente
    Y la última fecha exitosa registrada sigue siendo "2026-05-26 18:00"
