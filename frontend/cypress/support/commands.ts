/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      registerThroughUI(email: string, password: string): Chainable<void>
      loginThroughUI(email: string, password: string): Chainable<void>
      clearAuth(): Chainable<void>
    }
  }
}

Cypress.Commands.add('registerThroughUI', (email: string, password: string) => {
  cy.intercept('POST', '**/auth/register').as('register')
  cy.visit('/register')
  cy.get('#email').should('be.enabled').type(email)
  cy.get('#password').should('be.enabled').type(password)
  cy.get('#confirm').should('be.enabled').type(password)
  cy.contains('button', 'Register').should('be.enabled').click()
  cy.wait('@register').its('response.statusCode').should('eq', 201)
})

Cypress.Commands.add('loginThroughUI', (email: string, password: string) => {
  cy.intercept('POST', '**/auth/login').as('login')
  cy.visit('/login')
  cy.get('#email').should('be.enabled').type(email)
  cy.get('#password').should('be.enabled').type(password)
  cy.contains('button', 'Sign in').should('be.enabled').click()
  cy.wait('@login').its('response.statusCode').should('eq', 200)
})

Cypress.Commands.add('clearAuth', () => {
  cy.clearLocalStorage()
  cy.clearCookies()
})

export {}
