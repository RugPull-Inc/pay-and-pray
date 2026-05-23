/// <reference types="cypress" />

describe('Auth', () => {
  const password = 'password123'
  let email: string

  beforeEach(() => {
    email = `cypress-${crypto.randomUUID()}@example.com`
    cy.clearAuth()
  })

  it('registers and auto-logs in', () => {
    cy.registerThroughUI(email, password)

    cy.url({ timeout: 10000 }).should('match', /\/$/)
    cy.window().its('localStorage.token').should('be.a', 'string')
  })

  it('logs in with existing credentials', () => {
    cy.registerThroughUI(email, password)
    cy.clearAuth()
    cy.loginThroughUI(email, password)

    cy.url({ timeout: 10000 }).should('match', /\/$/)
    cy.window().its('localStorage.token').should('be.a', 'string')
  })
})
