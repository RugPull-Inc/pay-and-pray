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
