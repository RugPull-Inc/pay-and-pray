# language: es
@portfolio
Característica: Gestión de portfolio
  Como usuario autenticado
  Quiero gestionar mi portfolio comprando y vendiendo acciones y siguiendo su valorización
  Para hacer seguimiento de mis inversiones

  # ---------------------------------------------------------------------------
  # User Story 4.1 - Comprar acciones
  # ---------------------------------------------------------------------------

  @auth
  Escenario: Comprar acciones de un ticker existente
    Dado que el usuario está autenticado
    Y existe el ticker "AAPL" con un precio actualizado disponible
    Cuando registro la compra de 10 unidades de "AAPL"
    Entonces la operación de compra queda registrada en el portfolio
    Y la posición de "AAPL" aparece reflejada en mi portfolio
    Y la compra se realiza al último precio actualizado disponible

  @auth
  Escenario: No se permite comprar una cantidad menor o igual a cero
    Dado que el usuario está autenticado
    Cuando intento registrar la compra de 0 unidades de "AAPL"
    Entonces el sistema rechaza la operación

  @auth
  Escenario: Comprar un ticker inexistente
    Dado que el usuario está autenticado
    Y el ticker "NOPE" no existe
    Cuando intento registrar la compra de 5 unidades de "NOPE"
    Entonces el sistema informa el error claramente

  # ---------------------------------------------------------------------------
  # User Story 4.2 - Vender acciones
  # ---------------------------------------------------------------------------

  @auth
  Escenario: Vender parte de una posición existente
    Dado que el usuario está autenticado
    Y tengo 10 unidades de "AAPL" en mi portfolio
    Cuando vendo 4 unidades de "AAPL"
    Entonces mi posición de "AAPL" pasa a 6 unidades
    Y la venta queda registrada en el historial
    Y la venta se realiza al último precio actualizado disponible

  @auth
  Escenario: No se permite vender más unidades de las disponibles
    Dado que el usuario está autenticado
    Y tengo 3 unidades de "AAPL" en mi portfolio
    Cuando intento vender 5 unidades de "AAPL"
    Entonces el sistema rechaza la operación

  # ---------------------------------------------------------------------------
  # User Story 4.3 - Consultar valor del portfolio y P&L
  # ---------------------------------------------------------------------------

  @auth
  Escenario: Ver valor del portfolio y P&L por posición
    Dado que el usuario está autenticado
    Y tengo posiciones abiertas en mi portfolio
    Cuando consulto mi portfolio
    Entonces el sistema muestra cada posición con su valor actual
    Y muestra el P&L de cada posición
    Y muestra el valor total del portfolio
    Y los cálculos usan los últimos precios actualizados disponibles

  @auth
  Escenario: Portfolio vacío
    Dado que el usuario está autenticado
    Y no tengo posiciones en mi portfolio
    Cuando consulto mi portfolio
    Entonces el sistema informa que el portfolio está vacío

  # ---------------------------------------------------------------------------
  # User Story 4.4 - Ver historial de operaciones
  # ---------------------------------------------------------------------------

  @auth
  Escenario: Ver historial de operaciones
    Dado que el usuario está autenticado
    Y tengo compras y ventas registradas
    Cuando consulto mi historial de operaciones
    Entonces el sistema muestra las compras y ventas registradas
    Y cada operación muestra ticker, tipo de operación, cantidad, precio y fecha
    Y las operaciones se muestran ordenadas cronológicamente

  @auth
  Escenario: Historial sin operaciones
    Dado que el usuario está autenticado
    Y no tengo operaciones registradas
    Cuando consulto mi historial de operaciones
    Entonces el sistema informa que no hay historial disponible

  # ---------------------------------------------------------------------------
  # Acceso protegido (transversal a la feature)
  # ---------------------------------------------------------------------------

  Escenario: Usuario no autenticado no puede acceder al portfolio
    Dado que el usuario no está autenticado
    Cuando intento acceder al portfolio
    Entonces el sistema deniega el acceso
