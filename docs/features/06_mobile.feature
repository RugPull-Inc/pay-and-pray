# language: es
@mobile
Característica: Experiencia móvil
  Como usuario
  Quiero usar el sistema desde mi celular
  Para operar mi cuenta, mi portfolio y mis watchlists en cualquier lugar

  Antecedentes:
    Dado que accedo a la aplicación desde un dispositivo móvil

  # ---------------------------------------------------------------------------
  # User Story 6.1 - Autenticación desde dispositivo móvil
  # ---------------------------------------------------------------------------

  Escenario: Registro desde el celular
    Cuando me registro con email y contraseña válidos
    Entonces el sistema crea mi cuenta
    Y los errores de validación se visualizan correctamente en la pantalla del celular

  Escenario: Login desde el celular
    Dado que tengo una cuenta registrada
    Cuando inicio sesión con credenciales válidas
    Entonces accedo a mi cuenta
    Y el formulario mantiene el mismo comportamiento funcional que en la versión web

  # ---------------------------------------------------------------------------
  # User Story 6.2 - Búsqueda y consulta de empresas desde móvil
  # ---------------------------------------------------------------------------

  Escenario: Buscar y consultar una empresa desde el celular
    Dado que estoy autenticado
    Cuando busco la empresa "AAPL" por ticker
    Y abro su detalle financiero
    Entonces el sistema muestra sus métricas, evolución histórica y filings
    Y la información se presenta de forma legible en la pantalla del celular

  # ---------------------------------------------------------------------------
  # User Story 6.3 - Visibilidad de actualización de precios desde móvil
  # ---------------------------------------------------------------------------

  Escenario: Ver fecha de última actualización de precios desde el celular
    Dado que estoy autenticado
    Y existe una ejecución exitosa registrada
    Cuando consulto la información de actualización de precios
    Entonces el sistema muestra la fecha y hora de la última actualización exitosa
    Y el dato se presenta de forma legible en la pantalla del celular

  # ---------------------------------------------------------------------------
  # User Story 6.4 - Gestión de portfolio desde móvil
  # ---------------------------------------------------------------------------

  Escenario: Operar el portfolio desde el celular
    Dado que estoy autenticado
    Cuando registro una compra o una venta de un ticker
    Entonces la operación se procesa igual que en la versión web
    Y veo mi portfolio y mi P&L actualizados de forma legible en el celular

  # ---------------------------------------------------------------------------
  # User Story 6.5 - Gestión de watchlist desde móvil
  # ---------------------------------------------------------------------------

  Escenario: Gestionar y comparar la watchlist desde el celular
    Dado que estoy autenticado
    Cuando agrego o quito una empresa de mi watchlist
    Y comparo dos empresas de mi watchlist
    Entonces las acciones se procesan igual que en la versión web
    Y la vista comparativa se presenta de forma legible en la pantalla del celular

  # ---------------------------------------------------------------------------
  # User Story 6.6 - Interfaz adaptable (responsive)
  # ---------------------------------------------------------------------------

  Esquema del escenario: La interfaz se adapta a distintos tamaños de pantalla
    Cuando abro la aplicación en una pantalla de "<ancho>" px de ancho
    Entonces los elementos no se desbordan ni quedan ocultos
    Y la navegación es usable sin zoom ni desplazamiento horizontal

    Ejemplos:
      | ancho |
      | 360   |
      | 414   |
      | 768   |
