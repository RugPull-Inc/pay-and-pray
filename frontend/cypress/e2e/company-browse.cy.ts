/// <reference types="cypress" />

describe('Company browse', () => {
  const password = 'password123'
  const email = `cypress-${crypto.randomUUID()}@example.com`

  before(() => {
    cy.clearAuth()
    cy.registerThroughUI(email, password)
    cy.clearAuth()
  })

  beforeEach(() => {
    cy.clearAuth()
    cy.loginThroughUI(email, password)
  })

  it('searches for a company and opens its detail page', () => {
    cy.get('input[placeholder*="Search ticker"]').type('AAPL')
    cy.contains('button', 'AAPL').should('be.visible').click()

    cy.url().should('include', '/companies/AAPL')
    cy.contains('h1', 'Apple Inc.').should('be.visible')
    cy.contains('AAPL').should('be.visible')
    cy.contains('Key Financial Metrics').should('be.visible')
  })
})
