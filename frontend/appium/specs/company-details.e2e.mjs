function byDescription(text) {
  return $(`android=new UiSelector().descriptionContains("${text}")`)
}

function byStaticText(text) {
  return $(`android=new UiSelector().textContains("${text}")`)
}

async function waitForStaticText(text, timeout = 30000) {
  const element = await byStaticText(text)
  await element.waitForDisplayed({ timeout })
  return element
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

  throw new Error(`Could not find visible text after scrolling: ${text}`)
}

describe('Company financial detail on mobile', () => {
  it('searches AAPL by ticker and shows readable metrics, history, and filings', async () => {
    await browser.setOrientation('PORTRAIT')

    const searchInput = await byDescription('Search ticker')
    await searchInput.waitForDisplayed({ timeout: 30000 })
    await searchInput.click()
    await searchInput.setValue('AAPL')

    const aaplResult = await byDescription('Open AAPL company details')
    await aaplResult.waitForDisplayed({ timeout: 30000 })
    await aaplResult.click()

    await waitForStaticText('Key Financial Metrics')

    for (const metric of [
      'Revenue',
      'Net Income',
      'EPS',
      'Total Assets',
      'Total Liabilities',
    ]) {
      await scrollTo(metric)
    }

    await scrollTo('Historical Evolution')
    await scrollTo('Recent Filings')
    await scrollTo('Type')
    await scrollTo('Filed')
  })
})
