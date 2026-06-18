const SELECTORS = {
  enterComparisonModeText: 'Comparar empresas',
  confirmComparisonText: 'Comparar',
  metricLabelText: 'Precio actual',
}

function byInput(placeholderText) {
  return $(
    `android=new UiSelector().className("android.widget.EditText").textContains("${placeholderText}")`
  )
}

function byStaticText(text) {
  return $(`android=new UiSelector().textContains("${text}")`)
}

async function waitForStaticText(text, timeout = 30000) {
  const el = await byStaticText(text)
  await el.waitForDisplayed({ timeout })
  return el
}

async function scrollToText(text, maxScrolls = 12) {
  const { width, height } = await browser.getWindowSize()

  for (let i = 0; i <= maxScrolls; i += 1) {
    const el = await byStaticText(text)
    try {
      if (await el.isDisplayed()) return el
    } catch (err) {
      if (!err.message.includes('no such element')) throw err
    }

    if (i === maxScrolls) break

    await browser.execute('mobile: scrollGesture', {
      left: Math.round(width * 0.1),
      top: Math.round(height * 0.2),
      width: Math.round(width * 0.8),
      height: Math.round(height * 0.65),
      direction: 'down',
      percent: 0.75,
    })
  }

  throw new Error(`Could not find visible text after scrolling: ${text}`)
}

async function setOrientationPortrait() {
  await browser.setOrientation('PORTRAIT')
}

async function isAlreadyLoggedIn(timeout = 3000) {
  try {
    const navbar = await byStaticText('Watchlist')
    await navbar.waitForDisplayed({ timeout })
    return true
  } catch (err) {
    if (
      !err.message.includes('no such element') &&
      !err.message.includes('timeout')
    )
      throw err
    return false
  }
}

async function login({ email, password }) {
  if (await isAlreadyLoggedIn()) return

  const emailInput = await byInput('example@email.com')
  await emailInput.waitForDisplayed({ timeout: 30000 })
  await emailInput.click()
  await emailInput.setValue(email)

  const passwordInput = await byInput('password...')
  await passwordInput.waitForDisplayed({ timeout: 30000 })
  await passwordInput.click()
  await passwordInput.setValue(password)

  const signInButton = await waitForStaticText('Sign in', 30000)
  await signInButton.click()

  await waitForStaticText('Watchlist', 30000)
}

async function openWatchlistFromNavbar() {
  const watchlistLink = await waitForStaticText('Watchlist', 30000)
  await watchlistLink.click()
  await waitForStaticText('Mi Watchlist', 30000)
}

function tickerInput() {
  return $('~Ticker')
}

async function addTickerToWatchlist(ticker) {
  const input = await tickerInput()
  await input.waitForDisplayed({ timeout: 30000 })
  await input.click()
  await input.setValue(ticker)

  const addButton = await waitForStaticText('Agregar', 30000)
  await addButton.click()
}

async function expectTickerVisible(ticker) {
  await scrollToText(ticker, 12)
}

async function tickerIsVisibleAnywhere(ticker, maxScrolls = 8) {
  const { width, height } = await browser.getWindowSize()

  for (let i = 0; i < maxScrolls; i += 1) {
    const el = await byStaticText(ticker)
    try {
      if (await el.isDisplayed()) return true
    } catch (err) {
      if (!err.message.includes('no such element')) throw err
    }

    await browser.execute('mobile: scrollGesture', {
      left: Math.round(width * 0.1),
      top: Math.round(height * 0.2),
      width: Math.round(width * 0.8),
      height: Math.round(height * 0.65),
      direction: 'down',
      percent: 0.75,
    })
  }

  return false
}

async function expectAtLeastOnePositionBadgeVisible() {
  try {
    await scrollToText('Tengo posición', 12)
    return
  } catch (err) {
    if (!err.message.includes('Could not find visible text after scrolling'))
      throw err
  }

  await scrollToText('Sin posición', 12)
}

function removeButtonFor(ticker) {
  return $(`~Remove ${ticker} from watchlist`)
}

async function removeTicker(ticker) {
  await scrollToText(ticker, 12)
  const removeButton = removeButtonFor(ticker)
  await removeButton.waitForDisplayed({ timeout: 30000 })
  await removeButton.click()
}

async function removeTickerIfPresent(ticker) {
  const isPresent = await tickerIsVisibleAnywhere(ticker, 12)
  if (!isPresent) return

  await removeTicker(ticker)

  const stillVisible = await tickerIsVisibleAnywhere(ticker, 6)
  if (stillVisible) {
    throw new Error(
      `No se pudo limpiar "${ticker}" del watchlist antes de correr el test (riesgo de estado sucio entre tests).`
    )
  }
}

async function clearWatchlist(tickers) {
  for (const ticker of tickers) {
    await removeTickerIfPresent(ticker)
  }
}

async function enterComparisonSelectionMode() {
  const enterButton = await waitForStaticText(
    SELECTORS.enterComparisonModeText,
    30000
  )
  await enterButton.click()
}

async function selectTickerForComparison(ticker) {
  await scrollToText(ticker, 12)
  const checkbox = $(`~Select ${ticker} for comparison`)
  await checkbox.waitForDisplayed({ timeout: 30000 })
  await checkbox.click()
}

async function confirmComparison() {
  const compareButton = await waitForStaticText(
    SELECTORS.confirmComparisonText,
    30000
  )
  await compareButton.click()
}

describe('Watchlist on mobile', () => {
  const email = process.env.E2E_EMAIL ?? 'user1@rugpull.com'
  const password = process.env.E2E_PASSWORD ?? 'password123'

  beforeEach(async () => {
    await setOrientationPortrait()
    await login({ email, password })
    await openWatchlistFromNavbar()
    await clearWatchlist(['AAPL', 'MSFT'])
  })

  it('Adds AAPL to watchlist and verifies it appears', async () => {
    await addTickerToWatchlist('AAPL')
    await expectTickerVisible('AAPL')
  })

  it('Adds AAPL again and verifies duplicate message is shown', async () => {
    await addTickerToWatchlist('AAPL')
    await expectTickerVisible('AAPL')

    await addTickerToWatchlist('AAPL')
    await waitForStaticText('El ticker ya está en tu watchlist.', 30000)

    await expectTickerVisible('AAPL')
  })

  it('Adds MSFT, compares with AAPL and verifies comparison metrics are visible', async () => {
    await addTickerToWatchlist('AAPL')
    await expectTickerVisible('AAPL')

    await addTickerToWatchlist('MSFT')
    await expectTickerVisible('MSFT')

    await expectAtLeastOnePositionBadgeVisible()

    await enterComparisonSelectionMode()
    await selectTickerForComparison('AAPL')
    await selectTickerForComparison('MSFT')
    await confirmComparison()

    await waitForStaticText(SELECTORS.metricLabelText, 30000)
  })

  it('Removes AAPL from watchlist and verifies it disappears', async () => {
    await addTickerToWatchlist('AAPL')
    await expectTickerVisible('AAPL')

    await removeTicker('AAPL')

    const stillVisible = await tickerIsVisibleAnywhere('AAPL', 10)
    if (stillVisible) {
      throw new Error(
        'Expected "AAPL" to disappear from watchlist after removing it.'
      )
    }
  })
})
