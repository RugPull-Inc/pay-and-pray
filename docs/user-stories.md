# User Stories por Feature

## Feature 1 - Gestión de cuenta de usuario

Como usuario de la aplicación quiero poder administrar una cuenta para tener una identidad y espacio propio dentro del sistema, tal que pueda gestionar mi portfolio y watchlists.

Es la puerta de entrada al sistema, y cubre el ciclo de vida básico de identidad del usuario.

**Criterios de aceptación:**

- Un usuario anónimo puede registrarse con email y contraseña válidos; el sistema lo persiste y le permite operar sobre su portfolio personal.
- Un usuario registrado puede iniciar sesión con sus credenciales y recibir una sesión.
- Credenciales incorrectas o datos inválidos devuelven error claro sin exponer información sensible.
- Un usuario no autenticado no puede acceder a ningún endpoint / pantalla protegida.

### User Story 1.1 - Registro de Usuario

Como usuario anónimo de la aplicación, quiero crear una cuenta con mail y contraseña para poder gestionar mi portfolio personal de acciones.

**AC:**

- Un usuario anónimo puede registrarse indicando email y contraseña válidos.
- El sistema persiste la nueva cuenta de usuario.
- El sistema rechaza emails inválidos.
- El sistema rechaza contraseñas vacías.
- El sistema no permite registrar un email ya existente.

### User Story 1.2 - Login

Como usuario registrado, quiero iniciar sesión con mi mail y password para acceder a mi portfolio y mis watchlists.

**AC:**

- Un usuario registrado puede iniciar sesión con email y contraseña válidos.
- El sistema genera una sesión autenticada luego del login exitoso.
- Las credenciales inválidas devuelven un error de autenticación.
- El sistema no expone información sensible en los errores de login.
- Un usuario no autenticado no puede acceder a endpoints o pantallas protegidas.

> **Nota:** la antigua *User Story 1.3 - Mobile* se trasladó a la **Feature 6 - Experiencia móvil y rendimiento bajo carga**.

---

## Feature 2 - Búsqueda y consulta de empresas

Como usuario de la aplicación, quiero buscar empresas y consultar su información financiera e histórica para analizar su desempeño y tomar decisiones de seguimiento o inversión.

El sistema debe permitir buscar empresas por nombre o ticker y visualizar información financiera relevante, incluyendo métricas clave, evolución histórica y filings oficiales presentados ante la SEC. La funcionalidad debe facilitar el análisis financiero y el acceso centralizado a información pública de las empresas.

**Criterios de aceptación:**

- El sistema debe permitir buscar empresas por nombre o ticker.
- El sistema debe mostrar resultados coincidentes con la búsqueda realizada.
- El sistema debe permitir visualizar métricas financieras clave de una empresa.
- El sistema debe mostrar la evolución histórica de métricas financieras de los últimos 4 a 8 quarters reportados.
- El sistema debe permitir visualizar los filings más recientes de la empresa (10-K, 10-Q).
- Si la empresa no existe o la API externa no responde, el sistema informa el error de forma clara.

### User Story 2.1 - Búsqueda de empresas

Como usuario, quiero buscar empresas por nombre o ticker para encontrar acciones que quiero analizar, comprar o seguir.

**AC:**

- El usuario puede buscar empresas por ticker.
- El usuario puede buscar empresas por nombre.
- El sistema muestra resultados coincidentes con la búsqueda realizada.
- Cada resultado muestra al menos ticker y nombre de empresa.
- Si no existen coincidencias, el sistema informa que no se encontraron resultados.

### User Story 2.2 - Detalle financiero de una empresa

Como usuario, quiero ver las métricas financieras clave de una empresa (Revenue, Net Income, EPS, Total Assets, Total Liabilities) para evaluar su salud antes de comprar o seguirla.

**AC:**

- El usuario puede visualizar métricas financieras clave de una empresa.
- El sistema muestra Revenue, Net Income, EPS, Total Assets y Total Liabilities.
- Las métricas corresponden a la empresa seleccionada.
- El sistema muestra la información financiera más reciente disponible.
- Si no existe información financiera disponible, el sistema informa el error claramente.

### User Story 2.3 - Evolución histórica de métricas

Como usuario, quiero ver la evolución de las métricas financieras de los últimos 4 a 8 quarters reportados para entender la tendencia de la empresa.

**AC:**

- El usuario puede visualizar la evolución histórica de métricas financieras.
- El sistema muestra entre 4 y 8 quarters reportados.
- El sistema muestra la evolución cronológica de las métricas.
- El usuario puede identificar el período correspondiente a cada valor mostrado.
- Si no existe información histórica suficiente, el sistema lo informa claramente.

### User Story 2.4 - Filings de una empresa

Como usuario, quiero ver los filings más recientes de una empresa (10-K, 10-Q) para acceder a sus reportes oficiales ante la SEC.

**AC:**

- El usuario puede visualizar los filings recientes de una empresa.
- El sistema muestra filings 10-K y 10-Q.
- Cada filing muestra su período y fecha de presentación.
- El usuario puede acceder al filing oficial correspondiente.
- Si no existen filings disponibles, el sistema informa la situación claramente.

---

## Feature 3 - Proceso de actualización de precios

Como usuario autenticado quiero tener precios actualizados y poder consultar la fecha de actualización de precios para asegurar que la información financiera del sistema sea relevante.

El sistema debe permitir ejecutar un proceso que obtenga los últimos cierres de precios desde Yahoo Finance y actualice los datos. Además, debe registrar y exponer la fecha y hora de la última ejecución exitosa para que los usuarios puedan conocer la vigencia de la información visualizada.

**Criterios de aceptación:**

- El sistema debe permitir ejecutar manualmente el proceso de actualización de precios.
- El proceso debe obtener los últimos cierres desde Yahoo Finance.
- El sistema debe actualizar los precios en la base de datos con la información obtenida.
- El sistema debe registrar la fecha y hora de la última actualización exitosa.
- Los usuarios autenticados deben poder visualizar la fecha y hora de la última actualización.
- El sistema debe informar errores en caso de fallas durante la ejecución del batch.

### User Story 3.1 - Visibilidad de actualización de precios

Como usuario autenticado, quiero ver la fecha y hora de la última actualización de precios para saber qué tan actualizada está la información que estoy viendo.

**AC:**

- El usuario puede visualizar la fecha de la última actualización exitosa de precios.
- El usuario puede visualizar la hora de la última actualización exitosa.
- La información mostrada corresponde a la última ejecución registrada en el sistema.
- Si nunca se ejecutó el proceso de actualización, el sistema lo informa claramente.
- El acceso requiere autenticación.

### User Story 3.2 - Ejecutar batch de precios

Como operador del sistema (o pipeline de CI), quiero disparar manualmente la actualización de precios para dejar la base con los últimos cierres de Yahoo Finance.

**AC:**

- El operador puede ejecutar manualmente el proceso de actualización de precios.
- El sistema obtiene los últimos cierres desde Yahoo Finance.
- El sistema actualiza los precios almacenados.
- El sistema registra fecha y hora de ejecución exitosa.
- Si ocurre un error durante la actualización, el sistema informa la falla claramente.
- Una ejecución fallida no debe sobrescribir la última fecha exitosa registrada.

---

## Feature 4 - Gestión de portfolio

Como usuario autenticado, quiero gestionar mi portfolio de acciones cotizadas en el mercado, comprando y vendiendo acciones, y seguir su valorización para hacer seguimiento de mis inversiones.

El sistema debe permitir gestionar un portfolio de acciones mediante el registro de operaciones de compra y venta. Además, debe calcular y mostrar el valor actualizado del portfolio, el P&L de las posiciones y el historial de operaciones (compras y ventas) realizadas por el usuario.

**Criterios de aceptación:**

- El sistema debe permitir comprar acciones (indicando ticker y cantidad).
- El sistema debe permitir vender acciones existentes en el portfolio.
- El sistema debe permitir consultar el valor de posiciones actuales.
- El sistema debe permitir calcular Profit & Loss por cada precio de cada acción adquirida.
- El sistema debe calcular y mostrar el valor actual del portfolio utilizando los precios vigentes.
- El sistema debe permitir ver el historial de operaciones pasadas del usuario.
- El acceso a la gestión y visualización del portfolio debe requerir autenticación.

### User Story 4.1 - Comprar acciones

Como usuario autenticado, quiero registrar la compra de N unidades de un ticker para que queden reflejadas en mi portfolio al precio vigente.

**AC:**

- El usuario puede registrar la compra de un ticker indicando cantidad.
- El sistema registra la operación de compra en el portfolio.
- La posición comprada aparece reflejada en el portfolio del usuario.
- El sistema utiliza el último precio actualizado disponible.
- No se permiten cantidades menores o iguales a cero.
- Si el ticker no existe, el sistema informa el error claramente.
- El acceso requiere autenticación.

### User Story 4.2 - Vender acciones

Como usuario autenticado, quiero vender N unidades de un ticker que tengo en mi portfolio para liquidar (total o parcialmente) mi posición al precio vigente.

**AC:**

- El usuario puede vender acciones existentes de su portfolio.
- El usuario puede indicar ticker y cantidad a vender.
- El sistema actualiza la posición luego de la venta.
- El sistema no permite vender más unidades de las disponibles.
- Las operaciones de venta quedan registradas en el historial.
- El sistema utiliza el último precio actualizado disponible.
- El acceso requiere autenticación.

### User Story 4.3 - Consultar valor del portfolio y P&L

Como usuario autenticado, quiero ver el valor actual de mi portfolio y el P&L por unidad de acción para entender cómo está performando mi inversión.

**AC:**

- El usuario puede visualizar sus posiciones actuales.
- El sistema muestra el valor actual de cada posición.
- El sistema calcula y muestra el P&L por posición.
- El sistema calcula el valor total del portfolio.
- Los cálculos utilizan los últimos precios actualizados disponibles.
- Si el usuario no posee posiciones, el sistema informa que el portfolio está vacío.
- El acceso requiere autenticación.

### User Story 4.4 - Ver historial de operaciones

Como usuario autenticado, quiero ver el historial de mis compras y ventas para auditar mi actividad.

**AC:**

- El usuario puede visualizar el historial de operaciones realizadas.
- El sistema muestra compras y ventas registradas.
- Cada operación muestra ticker, tipo de operación, cantidad, precio y fecha.
- Las operaciones se muestran ordenadas cronológicamente.
- Si no existen operaciones registradas, el sistema informa que no hay historial disponible.
- El acceso requiere autenticación.

---

## Feature 5 - Watchlist

Como usuario autenticado quiero administrar una lista de seguimiento de empresas de mi interés, y comparar sus métricas financieras para monitorear su evolución, sin necesidad de tener posiciones abiertas en ellas.

El sistema debe permitir crear y administrar una watchlist personal de empresas. Además, debe permitir comparar métricas financieras clave entre empresas, incluidas en la watchlist, para facilitar el análisis fundamental y la toma de decisiones de inversión.

**Criterios de aceptación:**

- El acceso a la watchlist debe requerir autenticación.
- El sistema debe permitir agregar empresas a la watchlist del usuario.
- El sistema debe permitir quitar empresas de la watchlist.
- El sistema debe permitir visualizar empresas en la watchlist independientemente de si el usuario posee posiciones abiertas en ellas.
- El sistema debe permitir comparar métricas financieras clave entre dos empresas de la watchlist.
- El sistema debe mostrar la información comparativa de forma clara y consistente.
- El sistema debe indicar si el usuario posee posiciones abiertas en las empresas incluidas en la watchlist.

**Métricas clave:**

- Precio actual
- Market Cap
- Revenue (Q)
- Net Income (Q)
- EPS (Q)
- Total Assets
- Total Liabilities
- Último filing
- Fecha y hora de última actualización

### User Story 5.1 - Gestionar watchlist

Como usuario autenticado, quiero agregar o quitar empresas de una lista de seguimiento para monitorearlas sin tener posición.

**AC:**

- El usuario puede agregar empresas a su watchlist.
- El usuario puede quitar empresas de su watchlist.
- El sistema no duplica empresas ya existentes en la watchlist.
- El usuario puede visualizar todas las empresas agregadas.
- El sistema indica si el usuario posee posiciones abiertas en cada empresa de la watchlist.
- Las empresas pueden visualizarse aunque el usuario no tenga posiciones abiertas.
- El acceso requiere autenticación.

### User Story 5.2 - Comparar dos empresas

Como usuario autenticado, quiero comparar las métricas financieras clave entre 2 empresas de mi watchlist para decidir cuál tiene mejores datos fundamentales (números reales de negocio).

**AC:**

- El usuario puede seleccionar dos empresas de su watchlist para comparar.
- El sistema muestra las métricas financieras de ambas empresas en una misma vista.
- El sistema muestra: Precio actual, Market Cap, Revenue (Q), Net Income (Q), EPS (Q), Total Assets, Total Liabilities, Último filing, Fecha y hora de última actualización.
- La información corresponde a los últimos datos disponibles en el sistema.
- Si alguna métrica no está disponible, el sistema lo informa claramente.
- El acceso requiere autenticación.

---

## Feature 6 - Experiencia móvil y rendimiento bajo carga

Como usuario y como operador del sistema, quiero que la aplicación sea usable desde dispositivos móviles y que se mantenga estable y con buenos tiempos de respuesta bajo carga, para garantizar una buena experiencia y la disponibilidad del servicio.

Esta feature agrupa los requisitos no funcionales de la aplicación, una vez que las funcionalidades de front web y back ya están implementadas: la experiencia móvil (acceso y operación desde el celular) y el rendimiento bajo carga (comportamiento del sistema cuando muchos usuarios lo usan al mismo tiempo). Incorpora el acceso móvil que originalmente figuraba como User Story 1.3 dentro de la Feature 1.

**Criterios de aceptación:**

- El sistema debe ser usable desde dispositivos móviles en todas sus pantallas principales (registro, login, búsqueda, portfolio y watchlist).
- Los formularios deben mantener el mismo comportamiento funcional que en la versión web.
- Los errores de validación deben visualizarse correctamente en dispositivos móviles.
- El sistema debe soportar una cantidad objetivo de usuarios concurrentes (a definir) sin degradar la funcionalidad.
- El sistema debe mantener los tiempos de respuesta dentro de un umbral acordado (a definir) bajo carga.
- El sistema no debe devolver errores de servidor (5xx) por efecto de la carga esperada.
- El sistema debe degradar de forma controlada (mensajes claros, sin caídas totales) si se supera la carga soportada.

### User Story 6.1 - Autenticación desde dispositivo móvil

Como usuario, quiero registrarme e iniciar sesión desde mi celular para crear y acceder a mi cuenta en cualquier lugar.

**AC:**

- El usuario puede registrarse con email y contraseña desde un dispositivo móvil.
- El usuario puede iniciar sesión con sus credenciales desde un dispositivo móvil.
- Los formularios de registro y login mantienen el mismo comportamiento funcional que en la versión web.
- Los errores de validación y de autenticación se visualizan correctamente en pantallas chicas.

### User Story 6.2 - Búsqueda y consulta de empresas desde móvil

Como usuario, quiero buscar empresas y ver su información financiera desde mi celular para analizarlas en cualquier momento.

**AC:**

- El usuario puede buscar empresas por nombre o ticker desde un dispositivo móvil.
- El usuario puede visualizar las métricas financieras, la evolución histórica y los filings desde un dispositivo móvil.
- La información se presenta de forma legible y navegable en pantallas chicas.

### User Story 6.3 - Visibilidad de actualización de precios desde móvil

Como usuario, quiero ver la fecha y hora de la última actualización de precios desde mi celular para saber qué tan vigente es la información que estoy viendo.

**AC:**

- El usuario puede visualizar la fecha y hora de la última actualización exitosa de precios desde un dispositivo móvil.
- La información mostrada corresponde a la última ejecución registrada en el sistema.
- El dato se presenta de forma legible en pantallas chicas.

### User Story 6.4 - Gestión de portfolio desde móvil

Como usuario, quiero operar mi portfolio desde mi celular para comprar, vender y consultar mis posiciones en cualquier lugar.

**AC:**

- El usuario puede registrar compras y ventas desde un dispositivo móvil.
- El usuario puede consultar el valor de su portfolio y su P&L desde un dispositivo móvil.
- Las operaciones mantienen el mismo comportamiento funcional que en la versión web.

### User Story 6.5 - Gestión de watchlist desde móvil

Como usuario, quiero administrar mi watchlist desde mi celular para seguir y comparar empresas en cualquier momento.

**AC:**

- El usuario puede agregar y quitar empresas de su watchlist desde un dispositivo móvil.
- El usuario puede comparar empresas de su watchlist desde un dispositivo móvil.
- La vista comparativa se presenta de forma legible en pantallas chicas.

### User Story 6.6 - Interfaz adaptable (responsive)

Como usuario, quiero que la interfaz se adapte al tamaño de mi pantalla para poder usar la aplicación cómodamente desde cualquier dispositivo.

**AC:**

- La interfaz se adapta correctamente a distintos tamaños de pantalla.
- Los elementos no se desbordan ni quedan ocultos en dispositivos móviles.
- La navegación es usable sin necesidad de zoom ni desplazamiento horizontal.

### User Story 6.7 - Soporte de usuarios concurrentes

Como operador del sistema, quiero que la aplicación soporte múltiples usuarios concurrentes para garantizar disponibilidad bajo carga.

**AC:**

- El sistema soporta una cantidad objetivo de usuarios concurrentes (a definir).
- El sistema no devuelve errores de servidor (5xx) por efecto de la carga esperada.
- Todas las operaciones principales siguen funcionando bajo la carga esperada.

### User Story 6.8 - Tiempos de respuesta bajo carga

Como operador del sistema, quiero que los tiempos de respuesta se mantengan dentro de un umbral acordado bajo carga para asegurar una buena experiencia.

**AC:**

- El sistema mantiene los tiempos de respuesta dentro de un umbral acordado (a definir) bajo la carga esperada.
- La métrica de tiempo de respuesta a evaluar queda definida (a definir, p. ej. promedio o percentil).
- Los resultados de las pruebas de carga quedan registrados para su análisis.

### User Story 6.9 - Estabilidad bajo carga sostenida

Como operador del sistema, quiero que el sistema se mantenga estable durante una carga sostenida para detectar degradaciones o fugas de recursos.

**AC:**

- El sistema se mantiene estable durante una carga sostenida en el tiempo (duración a definir).
- No se observa degradación progresiva de los tiempos de respuesta durante la prueba.
- El uso de recursos (memoria, conexiones) se mantiene estable, sin fugas evidentes.

### User Story 6.10 - Degradación controlada al superar la capacidad

Como operador del sistema, quiero que el sistema degrade de forma controlada al superar su capacidad para evitar caídas totales y pérdida de datos.

**AC:**

- Si se supera la carga soportada, el sistema informa el error de forma clara.
- El sistema no se cae por completo ante una carga superior a la soportada.
- No se corrompen ni se pierden datos como consecuencia del exceso de carga.
