# language: es
@busqueda
Característica: Búsqueda y consulta de empresas
  Como usuario
  Quiero buscar empresas y consultar su información financiera e histórica
  Para analizar su desempeño y tomar decisiones de seguimiento o inversión

  # ---------------------------------------------------------------------------
  # User Story 2.1 - Búsqueda de empresas
  # ---------------------------------------------------------------------------

  Esquema del escenario: Búsqueda de empresas por <criterio>
    Dado que existe la empresa "Apple Inc." con ticker "AAPL"
    Cuando busco empresas por <criterio> con el valor "<valor>"
    Entonces el sistema muestra resultados coincidentes
    Y cada resultado muestra al menos el ticker y el nombre de la empresa

    Ejemplos:
      | criterio | valor |
      | ticker   | AAPL  |
      | nombre   | Apple |

  Escenario: Búsqueda sin coincidencias
    Cuando busco empresas con el valor "ZZZZNoExiste"
    Entonces el sistema informa que no se encontraron resultados

  # ---------------------------------------------------------------------------
  # User Story 2.2 - Detalle financiero de una empresa
  # ---------------------------------------------------------------------------

  Escenario: Ver métricas financieras clave de una empresa
    Dado que la empresa "AAPL" tiene información financiera disponible
    Cuando consulto el detalle financiero de "AAPL"
    Entonces el sistema muestra Revenue, Net Income, EPS, Total Assets y Total Liabilities
    Y las métricas corresponden a la empresa "AAPL"
    Y el sistema muestra la información financiera más reciente disponible

  Escenario: Detalle financiero sin información disponible
    Dado que la empresa "XYZ" no tiene información financiera disponible
    Cuando consulto el detalle financiero de "XYZ"
    Entonces el sistema informa el error claramente

  Escenario: La API externa no responde
    Dado que la API externa de datos financieros no está disponible
    Cuando consulto el detalle financiero de "AAPL"
    Entonces el sistema informa el error de forma clara

  # ---------------------------------------------------------------------------
  # User Story 2.3 - Evolución histórica de métricas
  # ---------------------------------------------------------------------------

  Escenario: Ver evolución histórica de métricas
    Dado que la empresa "AAPL" tiene al menos 4 quarters reportados
    Cuando consulto la evolución histórica de "AAPL"
    Entonces el sistema muestra entre 4 y 8 quarters reportados
    Y los muestra en orden cronológico
    Y cada valor indica el período correspondiente

  Escenario: Evolución histórica con información insuficiente
    Dado que la empresa "NUEVA" tiene menos de 4 quarters reportados
    Cuando consulto la evolución histórica de "NUEVA"
    Entonces el sistema informa que no hay información histórica suficiente

  # ---------------------------------------------------------------------------
  # User Story 2.4 - Filings de una empresa
  # ---------------------------------------------------------------------------

  Escenario: Ver filings recientes de una empresa
    Dado que la empresa "AAPL" tiene filings disponibles
    Cuando consulto los filings de "AAPL"
    Entonces el sistema muestra filings de tipo 10-K y 10-Q
    Y cada filing muestra su período y su fecha de presentación
    Y puedo acceder al filing oficial correspondiente

  Escenario: Empresa sin filings disponibles
    Dado que la empresa "XYZ" no tiene filings disponibles
    Cuando consulto los filings de "XYZ"
    Entonces el sistema informa que no hay filings disponibles
