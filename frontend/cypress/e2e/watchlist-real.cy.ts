/// <reference types="cypress" />

const PASSWORD = 'password123'
const FIRST_TICKER = 'AAPL'
const SECOND_TICKER = 'MSFT'
const PARTIAL_DATA_TICKER = 'ANET'

function uniqueEmail() {
  return `cypress-watchlist-${Date.now()}-${Cypress._.random(1000, 9999)}@example.com`
}

function registerThroughUi(email: string, password: string) {
  cy.visit('/register')
  cy.get('#email').should('be.enabled').type(email)
  cy.get('#password').should('be.enabled').type(password)
  cy.get('#confirm').should('be.enabled').type(password)
  cy.contains('button', 'Register').should('be.enabled').click()
  cy.contains('Account created! Redirecting...', { timeout: 15000 }).should(
    'be.visible'
  )
  cy.location('pathname', { timeout: 10000 }).should('eq', '/')
  cy.getCookie('pay_and_pray_token', { timeout: 15000 }).should('not.be.null')
}

function loginThroughUi(email: string, password: string) {
  cy.visit('/login')
  cy.get('#email').should('be.enabled').type(email)
  cy.get('#password').should('be.enabled').type(password)
  cy.contains('button', 'Sign in').should('be.enabled').click()
  cy.contains('Welcome! Redirecting...', { timeout: 15000 }).should(
    'be.visible'
  )
  cy.location('pathname', { timeout: 10000 }).should('eq', '/')
  cy.getCookie('pay_and_pray_token', { timeout: 15000 }).should('not.be.null')
}

function warmPrices() {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/admin/prices/refresh`,
    timeout: 60000,
  })
    .its('status')
    .should('eq', 202)

  waitForLatestPrices()
}

function waitForLatestPrices(attempt = 0): Cypress.Chainable<void> {
  return cy
    .request<{ lastUpdated?: string; message?: string }>({
      url: `${Cypress.env('apiUrl')}/prices/last-updated`,
      timeout: 15000,
    })
    .then((response) => {
      if (response.body.lastUpdated) return
      if (attempt >= 12) {
        throw new Error(
          `Price refresh did not finish before the test started: ${response.body.message ?? 'no status message'}`
        )
      }

      cy.wait(5000)
      return waitForLatestPrices(attempt + 1)
    })
}

function visitWatchlist() {
  cy.visit('/watchlist')
  cy.contains('h1', 'Mi Watchlist', { timeout: 15000 }).should('be.visible')
}

function rowForTicker(ticker: string) {
  return cy.contains('tbody tr', ticker, { timeout: 15000 })
}

function addTickerFromWatchlist(ticker: string) {
  cy.get('#ticker').should('be.enabled').clear().type(ticker)
  cy.contains('button', ticker, { timeout: 20000 }).click()
  cy.get('#ticker').should('have.value', ticker)
  cy.contains('button', 'Agregar').should('be.enabled').click()
  rowForTicker(ticker).should('be.visible')
}

function expectTickerCount(ticker: string, count: number) {
  cy.get('tbody tr')
    .filter(`:contains("${ticker}")`)
    .should('have.length', count)
}

function buyShares(ticker: string, quantity: number) {
  cy.visit(`/portfolio/buy?ticker=${ticker}`)
  cy.get('#ticker').should('have.value', ticker)
  cy.get('#quantity').should('be.enabled').clear().type(String(quantity))
  cy.contains('button', 'Buy').should('be.enabled').click()
  cy.contains(`Compra registrada: ${quantity} unidades de ${ticker}`, {
    timeout: 30000,
  }).should('be.visible')
}

function compareTickers(ticker1: string, ticker2: string) {
  visitWatchlist()
  cy.contains('button', 'Comparar empresas').should('be.enabled').click()
  rowForTicker(ticker1).find('input[type="checkbox"]').check({ force: true })
  rowForTicker(ticker2).find('input[type="checkbox"]').check({ force: true })
  cy.contains('button', 'Comparar').should('be.enabled').click()
  cy.url({ timeout: 15000 }).should('include', '/watchlist/compare')
  cy.contains('h1', ticker1, { timeout: 30000 }).should('be.visible')
  cy.contains('h1', ticker2).should('be.visible')
}

function metricRow(label: string) {
  return cy.contains('tbody tr', label, { timeout: 30000 })
}

describe('Watchlist real backend flow', () => {
  let email: string

  beforeEach(() => {
    email = uniqueEmail()
    cy.clearAuth()
  })

  it('covers watchlist management and comparison against the real backend', () => {
    warmPrices()
    registerThroughUi(email, PASSWORD)
    cy.clearAuth()
    loginThroughUi(email, PASSWORD)

    visitWatchlist()
    cy.contains(
      'Tu watchlist está vacía. Agregá empresas para seguirlas.'
    ).should('be.visible')

    addTickerFromWatchlist(FIRST_TICKER)

    cy.get('#ticker').clear().type(FIRST_TICKER)
    cy.contains('button', 'Agregar').should('be.enabled').click()
    cy.contains('El ticker ya está en tu watchlist.').should('be.visible')
    expectTickerCount(FIRST_TICKER, 1)

    buyShares(FIRST_TICKER, 1)
    visitWatchlist()
    rowForTicker(FIRST_TICKER).within(() => {
      cy.contains('Tengo posición').should('be.visible')
    })

    addTickerFromWatchlist(SECOND_TICKER)
    compareTickers(FIRST_TICKER, SECOND_TICKER)
    metricRow('Precio actual').within(() => {
      cy.contains(/\$\d/).should('be.visible')
    })
    metricRow('EPS (Q)').within(() => {
      cy.contains(/\d/).should('be.visible')
    })
    metricRow('Último filing').within(() => {
      cy.contains(/\d{4}-\d{2}-\d{2}/).should('be.visible')
    })

    visitWatchlist()
    addTickerFromWatchlist(PARTIAL_DATA_TICKER)
    compareTickers(FIRST_TICKER, PARTIAL_DATA_TICKER)
    metricRow('Precio actual').within(() => {
      cy.contains('N/A').should('be.visible')
    })

    visitWatchlist()
    rowForTicker(FIRST_TICKER).contains('button', 'Quitar').click()
    cy.contains('tbody tr', FIRST_TICKER).should('not.exist')
  })

  it('redirects unauthenticated users to login', () => {
    cy.visit('/watchlist')
    cy.url().should('include', '/login')
  })
})
