/// <reference types="cypress" />

describe('Company detail page', () => {
  const password = 'password123'
  const email = `cypress-detail-${crypto.randomUUID()}@example.com`

  before(() => {
    cy.clearAuth()
    cy.registerThroughUI(email, password)
    cy.clearAuth()
  })

  beforeEach(() => {
    cy.clearAuth()
    cy.loginThroughUI(email, password)
    // Navigate to Apple via the popular shortcut — avoids a live EDGAR search
    cy.visit('/companies/AAPL')
  })

  it('shows company name and ticker in the header', () => {
    cy.contains('h1', 'Apple Inc.', { timeout: 15000 }).should('be.visible')
    cy.contains('AAPL').should('be.visible')
  })

  it('renders the Key Financial Metrics section with all five cards', () => {
    cy.contains('Key Financial Metrics', { timeout: 15000 }).should(
      'be.visible'
    )
    cy.contains('Revenue').should('be.visible')
    cy.contains('Net Income').should('be.visible')
    cy.contains('EPS').should('be.visible')
    cy.contains('Total Assets').should('be.visible')
    cy.contains('Total Liabilities').should('be.visible')
  })

  it('renders the Historical Evolution chart section', () => {
    cy.contains('Historical Evolution', { timeout: 15000 }).should('be.visible')
  })

  it('shows the Recent Filings section with 10-K or 10-Q entries', () => {
    cy.contains('Recent Filings', { timeout: 15000 }).should('be.visible')
    cy.contains(/10-K|10-Q/).should('be.visible')
  })

  it('each filing row shows a filed date and period', () => {
    cy.contains('Recent Filings', { timeout: 15000 })
    // Period column header
    cy.contains('th', 'Period').should('be.visible')
    // Filed column header
    cy.contains('th', 'Filed').should('be.visible')
    // At least one row has a date-like value
    cy.get('table tbody tr')
      .first()
      .within(() => {
        cy.get('td')
          .eq(1)
          .invoke('text')
          .should('match', /\d{4}-\d{2}-\d{2}/)
      })
  })

  it('each filing has a View link that points to sec.gov', () => {
    cy.contains('Recent Filings', { timeout: 15000 })
    cy.get('table tbody tr')
      .first()
      .within(() => {
        cy.contains('a', 'View →')
          .should('have.attr', 'href')
          .and('include', 'sec.gov')
      })
  })

  it('unauthenticated user is redirected to login', () => {
    cy.clearAuth()
    cy.visit('/companies/AAPL')
    cy.url({ timeout: 5000 }).should('include', '/login')
  })
})
