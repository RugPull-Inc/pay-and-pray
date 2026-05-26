/// <reference types="cypress" />

describe('Auth + company browse — minimum E2E', () => {
  const password = 'password123'
  let email: string

  beforeEach(() => {
    email = `cypress-${crypto.randomUUID()}@example.com`
    cy.clearAuth()
  })

  it('registers, logs in, searches for AAPL and opens its detail page', () => {
    // 1. Register through the UI
    cy.registerThroughUI(email, password)

    // Register auto-logs the user in (token stored, redirect to /)
    cy.url({ timeout: 10000 }).should('match', /\/$/)
    cy.window().its('localStorage.token').should('be.a', 'string')

    // 2. Sign out so we can exercise the login flow on its own
    cy.clearAuth()
    cy.loginThroughUI(email, password)
    cy.url({ timeout: 10000 }).should('match', /\/$/)
    cy.window().its('localStorage.token').should('be.a', 'string')

    // 3. Search for a company from the home page
    cy.get('input[placeholder*="Search ticker"]').type('AAPL')
    cy.contains('button', 'AAPL').should('be.visible').click()

    // 4. Land on the detail page and see the right company
    cy.url().should('include', '/companies/AAPL')
    cy.contains('h1', 'Apple Inc.').should('be.visible')
    cy.contains('AAPL').should('be.visible')
    cy.contains('Key Financial Metrics').should('be.visible')
  })
})
