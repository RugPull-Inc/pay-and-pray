// Helpers compartidos para los specs Appium (UiAutomator2).
//
// La app Capacitor expone el árbol de accesibilidad del WebView como widgets
// nativos, así que localizamos elementos con UiSelector (text / description /
// className) sin cambiar al contexto WEBVIEW. `$`, `browser` y `expect` son
// globals que WebdriverIO inyecta en el contexto de ejecución.

// --- localizadores básicos ---------------------------------------------------

export function byStaticText(text) {
  return $(`android=new UiSelector().textContains("${text}")`)
}

export function byDescription(text) {
  return $(`android=new UiSelector().descriptionContains("${text}")`)
}

// --- helpers ----------------------------------------------------------------

export async function waitForStaticText(text, timeout = 30000) {
  const element = await byStaticText(text)
  await element.waitForDisplayed({ timeout })
  return element
}

// Hace scroll en `direction` hasta que el texto sea visible (o se agoten los
// intentos). `geometry` define la zona del gesto como fracciones de la ventana
// (top/height) y el avance por gesto (percent); los defaults sirven para scroll
// vertical de listas. Para tablas anchas (P&L) que desbordan en horizontal,
// usar direction 'right' con una franja más baja/angosta.
export async function scrollTo(
  text,
  direction = 'down',
  { top = 0.2, height = 0.65, percent = 0.75 } = {},
  maxScrolls = 8
) {
  const { width, height: windowHeight } = await browser.getWindowSize()

  const checkVisible = async () => {
    const element = await byStaticText(text)
    return (await element.isDisplayed().catch(() => false)) ? element : null
  }

  let found = await checkVisible()
  if (found) return found

  for (let i = 0; i < maxScrolls; i += 1) {
    await browser.execute('mobile: scrollGesture', {
      left: Math.round(width * 0.1),
      top: Math.round(windowHeight * top),
      width: Math.round(width * 0.8),
      height: Math.round(windowHeight * height),
      direction,
      percent,
    })
    found = await checkVisible()
    if (found) return found
  }

  throw new Error(
    `No se encontró el texto tras hacer scroll (${direction}): ${text}`
  )
}
