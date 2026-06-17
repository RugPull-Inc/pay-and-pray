// E2E móvil (Appium + UiAutomator2) — Feature 06_mobile
//
// Cubre los escenarios del ticket sobre el .feature docs/features/06_mobile.feature:
//   - US 6.1  Autenticación desde dispositivo móvil (registro, login, credenciales inválidas, ruta protegida)
//   - US 6.3  Visibilidad de la última actualización de precios desde móvil
//   - US 6.4  Gestión de portfolio desde móvil (comprar, vender, ver P&L, ver historial)
//
// Sigue el mismo enfoque nativo que appium/specs/company-details.e2e.mjs: la app
// Capacitor expone el árbol de accesibilidad del WebView como widgets nativos, por lo
// que localizamos elementos con UiSelector (text / description / className) sin cambiar
// al contexto WEBVIEW.
//
// Requisitos: emulador/dispositivo Android + APK debug + backend levantado
// (ver npm run appium:test:android y appium/README.md). Las pruebas que operan el
// portfolio asumen que el backend tiene un precio disponible para AAPL.

// --- localizadores básicos ---------------------------------------------------

function byStaticText(text) {
  return $(`android=new UiSelector().textContains("${text}")`)
}

function byDescription(text) {
  return $(`android=new UiSelector().descriptionContains("${text}")`)
}

// Botón de formulario: un <button> del WebView se mapea a android.widget.Button,
// mientras que los links de navegación/tabs (<a>) se mapean a android.view.View.
// Esto desambigua, p.ej., el botón "Buy" (submit) del tab "Buy".
function formButton(text) {
  return $(
    `android=new UiSelector().className("android.widget.Button").textContains("${text}")`
  )
}

// Campos de texto por posición de aparición (EditText n-ésimo del formulario).
function editTextAt(index) {
  return $(
    `android=new UiSelector().className("android.widget.EditText").instance(${index})`
  )
}

// --- helpers ----------------------------------------------------------------

async function waitForStaticText(text, timeout = 30000) {
  const element = await byStaticText(text)
  await element.waitForDisplayed({ timeout })
  return element
}

async function tapStaticText(text, timeout = 30000) {
  const element = await waitForStaticText(text, timeout)
  await element.click()
  return element
}

async function tapFormButton(text, timeout = 30000) {
  const button = await formButton(text)
  await button.waitForDisplayed({ timeout })
  await button.click()
  return button
}

async function typeInto(index, value, timeout = 30000) {
  const field = await editTextAt(index)
  await field.waitForDisplayed({ timeout })
  await field.click()
  await field.setValue(value)
  return field
}

async function scrollToText(text, maxScrolls = 8) {
  const { width, height } = await browser.getWindowSize()

  const checkVisible = async () => {
    const element = await byStaticText(text)
    return (await element.isDisplayed().catch(() => false)) ? element : null
  }

  let found = await checkVisible()
  if (found) return found

  for (let i = 0; i < maxScrolls; i += 1) {
    await browser.execute('mobile: scrollGesture', {
      left: Math.round(width * 0.1),
      top: Math.round(height * 0.2),
      width: Math.round(width * 0.8),
      height: Math.round(height * 0.65),
      direction: 'down',
      percent: 0.75,
    })
    found = await checkVisible()
    if (found) return found
  }

  throw new Error(`No se encontró el texto tras hacer scroll: ${text}`)
}

// Tablas anchas (P&L) desbordan horizontalmente: scroll lateral para alcanzar columnas.
async function scrollRightToText(text, maxScrolls = 6) {
  const { width, height } = await browser.getWindowSize()

  const checkVisible = async () => {
    const element = await byStaticText(text)
    return (await element.isDisplayed().catch(() => false)) ? element : null
  }

  let found = await checkVisible()
  if (found) return found

  for (let i = 0; i < maxScrolls; i += 1) {
    await browser.execute('mobile: scrollGesture', {
      left: Math.round(width * 0.1),
      top: Math.round(height * 0.35),
      width: Math.round(width * 0.8),
      height: Math.round(height * 0.3),
      direction: 'right',
      percent: 0.85,
    })
    found = await checkVisible()
    if (found) return found
  }

  throw new Error(`No se encontró el texto tras scroll horizontal: ${text}`)
}

function uniqueEmail() {
  return `mobile-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`
}

const PASSWORD = 'password123'

// Registra una cuenta nueva desde la pantalla de registro y queda autenticado.
// Asume que se parte de un estado de invitado en Home.
async function registerNewAccount(email) {
  await tapStaticText('Register') // link de navbar -> /register
  await waitForStaticText('Create your account to get started')
  await typeInto(0, email) // Email
  await typeInto(1, PASSWORD) // Password
  await typeInto(2, PASSWORD) // Confirm password
  await tapFormButton('Register')
  // Al registrarse, auto-login y redirección a Home: la navbar pasa a autenticada.
  await waitForStaticText('Sign out')
}

async function signOut() {
  await tapStaticText('Sign out')
  await waitForStaticText('Register')
}

async function loginWith(email, password) {
  await tapStaticText('Sign in') // link de navbar -> /login
  await waitForStaticText('Sign in to continue')
  await typeInto(0, email) // Email
  await typeInto(1, password) // Password
  await tapFormButton('Sign in')
}

// ============================================================================
// US 6.1 — Autenticación desde dispositivo móvil
// ============================================================================

describe('US 6.1 - Autenticación desde el celular', () => {
  beforeEach(async () => {
    await browser.setOrientation('PORTRAIT')
  })

  it('registra una cuenta con email y contraseña válidos y crea la cuenta', async () => {
    await registerNewAccount(uniqueEmail())

    // Autenticado: la navbar muestra accesos protegidos.
    await waitForStaticText('Sign out')
    await waitForStaticText('Mi Portfolio')
  })

  it('inicia sesión con credenciales válidas y accede a la cuenta', async () => {
    const email = uniqueEmail()
    await registerNewAccount(email)
    await signOut()

    await loginWith(email, PASSWORD)

    await waitForStaticText('Sign out')
    await waitForStaticText('Mi Portfolio')
  })

  it('muestra un error legible en pantalla cuando las credenciales son inválidas', async () => {
    await loginWith(uniqueEmail(), 'wrong-password')

    // El mensaje de error del backend (401) debe verse en la pantalla chica.
    const error = await waitForStaticText('Invalid email or password.')
    expect(await error.isDisplayed()).toBe(true)
  })

  it('mantiene las rutas protegidas fuera del alcance de un usuario sin autenticar', async () => {
    // En la cáscara nativa un invitado no tiene navegación al portfolio: la app
    // solo ofrece autenticación. Esto verifica que el área protegida está cerrada.
    await waitForStaticText('Sign in')
    await waitForStaticText('Register')

    const portfolioLink = await byStaticText('Mi Portfolio')
    expect(await portfolioLink.isExisting()).toBe(false)
  })
})

// ============================================================================
// US 6.3 — Visibilidad de la última actualización de precios desde móvil
// ============================================================================

describe('US 6.3 - Última actualización de precios desde el celular', () => {
  beforeEach(async () => {
    await browser.setOrientation('PORTRAIT')
  })

  it('muestra la fecha y hora de la última actualización de precios de forma legible', async () => {
    await registerNewAccount(uniqueEmail())

    // El indicador de precios (PriceStatusBar) se renderiza en el detalle de empresa.
    const searchInput = await editTextAt(0)
    await searchInput.waitForDisplayed({ timeout: 30000 })
    await searchInput.click()
    await searchInput.setValue('AAPL')

    const aaplResult = await byDescription('Open AAPL company details')
    await aaplResult.waitForDisplayed({ timeout: 30000 })
    await aaplResult.click()

    await waitForStaticText('Key Financial Metrics')

    // Requiere una ejecución exitosa del batch de precios en el backend.
    const status = await scrollToText('Precios actualizados al')
    const text = await status.getText()
    // La fecha/hora debe ser legible: formato DD/MM/AAAA HH:MM.
    expect(text).toMatch(/\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}/)
  })
})

// ============================================================================
// US 6.4 — Gestión de portfolio desde móvil
// ============================================================================

describe('US 6.4 - Gestión de portfolio desde el celular', () => {
  const TICKER = 'AAPL'

  // Una sola sesión autenticada para toda la secuencia comprar -> vender -> ver.
  before(async () => {
    await browser.setOrientation('PORTRAIT')
    await registerNewAccount(uniqueEmail())
  })

  it('compra una acción desde el celular y procesa la operación', async () => {
    await tapStaticText('Trade tickers')
    await tapStaticText('Buy') // link del menú -> /portfolio/buy
    await waitForStaticText('Buy shares')

    await typeInto(0, TICKER) // Ticker
    await typeInto(1, '2') // Quantity
    await tapFormButton('Buy')

    const success = await waitForStaticText('Compra registrada')
    expect(await success.getText()).toContain(TICKER)
  })

  it('vende una acción desde el celular y procesa la operación', async () => {
    await tapStaticText('Sell') // tab -> /portfolio/sell
    await waitForStaticText('Sell shares')

    await typeInto(0, TICKER) // Ticker
    await typeInto(1, '1') // Quantity
    await tapFormButton('Sell')

    const success = await waitForStaticText('Venta registrada')
    expect(await success.getText()).toContain(TICKER)
  })

  it('muestra el portfolio con P&L de forma legible en pantalla chica', async () => {
    await tapStaticText('Mi Portfolio')
    await waitForStaticText('Mi Portfolio')

    // La posición resultante y las columnas de P&L deben ser legibles.
    await scrollToText(TICKER)
    await scrollToText('Cantidad')
    await scrollRightToText('P&L ($)')
    await scrollRightToText('P&L (%)')
    await scrollToText('Valor total del portfolio')
  })

  it('muestra el historial de operaciones desde el celular', async () => {
    await tapStaticText('Historial')

    // Encabezados del historial.
    await scrollToText('Fecha')
    await scrollToText('Tipo')
    await scrollToText('Precio')

    // Operaciones realizadas en esta sesión: una compra (BUY) y una venta (SELL).
    await scrollToText(TICKER)
    await scrollToText('BUY')
    await scrollToText('SELL')
  })
})
