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
