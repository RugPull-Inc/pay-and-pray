# Tests E2E móviles (Appium)

Suite WebdriverIO + Appium sobre la app Capacitor (Android). Usa el driver
**UiAutomator2** en modo nativo: la app es un WebView de Capacitor que expone su
árbol de accesibilidad como widgets nativos, por lo que los elementos se localizan
con `UiSelector` (texto / descripción / `className`) sin cambiar al contexto
`WEBVIEW`.

## Specs

| Spec                            | Cobertura                                           |
| ------------------------------- | --------------------------------------------------- |
| `specs/company-details.e2e.mjs` | US 6.2 — detalle financiero de empresa              |
| `specs/06_mobile.e2e.mjs`       | US 6.1 (auth), US 6.3 (precios), US 6.4 (portfolio) |

Los escenarios siguen `docs/features/06_mobile.feature`.

### `06_mobile.e2e.mjs`

- **US 6.1 — Autenticación**
  - Registro con email/contraseña válidos → cuenta creada.
  - Login con credenciales válidas → acceso.
  - Credenciales inválidas → error legible en pantalla.
  - Ruta protegida sin autenticación → el área de portfolio no es accesible para
    un invitado (en la cáscara nativa no hay barra de URL; se verifica el gating de
    navegación en lugar de un redirect de URL).
- **US 6.3 — Precios**
  - Tras login, el detalle de empresa muestra la fecha/hora de la última
    actualización de precios con formato legible `DD/MM/AAAA HH:MM`.
- **US 6.4 — Portfolio**
  - Comprar y vender un ticker → operación procesada (mensaje de confirmación).
  - Ver portfolio con P&L → encabezados y posición legibles (con scroll horizontal
    para las columnas de P&L).
  - Ver historial de operaciones (BUY/SELL).

## Requisitos

- Emulador o dispositivo Android conectado (`adb devices`).
- Appium 3 con el driver UiAutomator2 instalado:
  ```bash
  npm run appium:driver:install
  ```
- Backend levantado y accesible desde el dispositivo. En emulador, el host es
  `10.0.2.2`; build de la app con `VITE_API_URL=http://10.0.2.2:8080` (ver
  `docs/mobile-spike.md`).
- Las pruebas de US 6.3 y US 6.4 asumen que el backend tiene un **precio disponible
  para AAPL** (ejecución exitosa del batch de precios).

## Correr

```bash
# Construye la web, sincroniza Capacitor, arma el APK debug y corre la suite
npm run appium:test:android
```

Variables opcionales (con defaults en `wdio.android.conf.mjs`):

| Variable                          | Default                                             |
| --------------------------------- | --------------------------------------------------- |
| `APPIUM_HOST`                     | `127.0.0.1`                                         |
| `APPIUM_PORT`                     | `4723`                                              |
| `APPIUM_ANDROID_APP`              | `android/app/build/outputs/apk/debug/app-debug.apk` |
| `APPIUM_ANDROID_DEVICE_NAME`      | `Android Emulator`                                  |
| `APPIUM_ANDROID_PLATFORM_VERSION` | (autodetect)                                        |
| `WDIO_LOG_LEVEL`                  | `warn`                                              |

## Dispositivo físico por USB (Windows)

En un celular real no sirve `10.0.2.2` (es solo para el emulador) y el HTTP por
WiFi suele estar bloqueado por el firewall. La forma más robusta es tunelizar el
backend por el cable USB con `adb reverse`, así la app usa `http://localhost:8080`
sin depender de la red ni abrir puertos.

### Preparación (una vez por máquina)

- **Android SDK** con `adb` + `build-tools;36` + `platforms;android-36`, y
  `ANDROID_HOME` exportado.
- **JDK 21** para compilar el APK (`compileSdk 36` lo exige; con JDK 17 el build
  falla con `invalid source release: 21`). Exportar `JAVA_HOME` al 21.
- Driver UiAutomator2: `npm run appium:driver:install`.
- En el celular: **Opciones de desarrollador → Depuración USB** activada, y aceptar
  el popup de autorización al conectar (`adb devices` lo debe mostrar como `device`,
  no `unauthorized`).

### Correr en el dispositivo

```bash
export ANDROID_HOME=/c/Users/<user>/Android/Sdk     # tu ruta del SDK
export JAVA_HOME="/c/Program Files/Java/jdk-21"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

# 1) Backend arriba (desde la raíz del repo)
docker compose up -d db price-batch backend
# si /prices/last-updated devuelve null: curl -X POST http://localhost:8080/admin/prices/refresh

# 2) Tunelizar el backend por USB (clave; se borra al desconectar el cable)
adb reverse tcp:8080 tcp:8080

# 3) Build + suite (el build por defecto apunta a http://localhost:8080)
npm run appium:test:android
```

Notas:

- **CORS**: la app Capacitor corre con origen `http://localhost` (ver
  `capacitor.config.ts`, `androidScheme: 'http'`). El backend debe permitir ese
  origen — está en el default de `CORS_ALLOWED_ORIGINS` en `docker-compose.yml`.
- **Cleartext**: `android/app/src/main/res/xml/network_security_config.xml` permite
  HTTP a `10.0.2.2`, `localhost` y `127.0.0.1`.
- **EDGAR**: el archivo `company_tickers.json` de SEC suele devolver 403 a clientes
  automatizados. Para que la búsqueda de empresas funcione offline se puede activar
  un fallback bundleado con `EDGAR_TICKERS_FALLBACK_ENABLED=true` (ver backend
  `dev/company-tickers-fallback.json`).
