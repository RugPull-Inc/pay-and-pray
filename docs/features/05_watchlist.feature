# language: es
@watchlist
Característica: Watchlist
  Como usuario autenticado
  Quiero administrar una lista de seguimiento de empresas y comparar sus métricas
  Para monitorear su evolución sin necesidad de tener posiciones abiertas

  # ---------------------------------------------------------------------------
  # User Story 5.1 - Gestionar watchlist
  # ---------------------------------------------------------------------------

  @auth
  Escenario: Agregar una empresa a la watchlist
    Dado que el usuario está autenticado
    Y mi watchlist no contiene a "AAPL"
    Cuando agrego "AAPL" a mi watchlist
    Entonces "AAPL" aparece en mi watchlist

  @auth
  Escenario: No se duplican empresas ya existentes en la watchlist
    Dado que el usuario está autenticado
    Y mi watchlist ya contiene a "AAPL"
    Cuando agrego "AAPL" a mi watchlist
    Entonces "AAPL" aparece una sola vez en mi watchlist

  @auth
  Escenario: Quitar una empresa de la watchlist
    Dado que el usuario está autenticado
    Y mi watchlist contiene a "AAPL"
    Cuando quito "AAPL" de mi watchlist
    Entonces "AAPL" ya no aparece en mi watchlist

  @auth
  Escenario: Indicar si el usuario posee posiciones abiertas en cada empresa
    Dado que el usuario está autenticado
    Y mi watchlist contiene a "AAPL" y a "MSFT"
    Y tengo una posición abierta en "AAPL"
    Y no tengo posiciones en "MSFT"
    Cuando visualizo mi watchlist
    Entonces el sistema indica que tengo posiciones abiertas en "AAPL"
    Y el sistema indica que no tengo posiciones abiertas en "MSFT"
    Y ambas empresas se visualizan aunque no tenga posiciones en todas

  # ---------------------------------------------------------------------------
  # User Story 5.2 - Comparar dos empresas
  # ---------------------------------------------------------------------------

  @auth
  Escenario: Comparar las métricas de dos empresas de la watchlist
    Dado que el usuario está autenticado
    Y mi watchlist contiene a "AAPL" y a "MSFT"
    Cuando comparo "AAPL" con "MSFT"
    Entonces el sistema muestra las métricas de ambas empresas en una misma vista
    Y muestra Precio actual, Market Cap, Revenue (Q), Net Income (Q) y EPS (Q)
    Y muestra Total Assets, Total Liabilities, Último filing y Fecha y hora de última actualización
    Y la información corresponde a los últimos datos disponibles en el sistema

  @auth
  Escenario: Alguna métrica no está disponible al comparar
    Dado que el usuario está autenticado
    Y mi watchlist contiene a "AAPL" y a "XYZ"
    Y la empresa "XYZ" no tiene disponible la métrica "EPS (Q)"
    Cuando comparo "AAPL" con "XYZ"
    Entonces el sistema informa claramente que esa métrica no está disponible

  # ---------------------------------------------------------------------------
  # Acceso protegido (transversal a la feature)
  # ---------------------------------------------------------------------------

  Escenario: Usuario no autenticado no puede acceder a la watchlist
    Dado que el usuario no está autenticado
    Cuando intento acceder a la watchlist
    Entonces el sistema deniega el acceso
