import { byDescription, waitForStaticText, scrollTo } from '../helpers.mjs'

function byInput(placeholderText) {
  return $(
    `android=new UiSelector().className("android.widget.EditText").textContains("${placeholderText}")`
  )
}

describe('Company financial detail on mobile', () => {
  it('searches AAPL by ticker and shows readable metrics, history, and filings', async () => {
    await browser.setOrientation('PORTRAIT')

    const searchInput = await byInput('Search ticker')
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
