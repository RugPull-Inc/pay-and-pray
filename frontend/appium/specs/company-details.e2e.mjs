function byText(text) {
  return $(`android=new UiSelector().text("${text}")`)
}

async function waitForText(text, timeout = 30000) {
  const element = await byText(text)
  await element.waitForDisplayed({ timeout })
  return element
}

async function scrollToText(text, maxScrolls = 8) {
  const { width, height } = await browser.getWindowSize()

  for (let attempt = 0; attempt <= maxScrolls; attempt += 1) {
    const element = await byText(text)
    if (await element.isDisplayed().catch(() => false)) return element

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

describe('F2 US 6.2 - company financial detail on mobile', () => {
  it('searches AAPL by ticker and shows readable metrics, history, and filings', async () => {
    await browser.setOrientation('PORTRAIT')

    const searchInput = await waitForText('Search ticker or company name...')
    await searchInput.click()
    await searchInput.setValue('AAPL')

    const aaplResult = await waitForText('AAPL')
    await aaplResult.click()

    await waitForText('AAPL')
    await waitForText('Key Financial Metrics')

    for (const metric of [
      'Revenue',
      'Net Income',
      'EPS',
      'Total Assets',
      'Total Liabilities',
    ]) {
      await scrollToText(metric)
    }

    await scrollToText('Historical Evolution')
    await scrollToText('Recent Filings')
    await scrollToText('Type')
    await scrollToText('Filed')
  })
})
