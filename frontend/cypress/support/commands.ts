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
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.get('#confirm').type(password)
  cy.contains('button', 'Register').click()
  cy.wait('@register').its('response.statusCode').should('eq', 201)
})

Cypress.Commands.add('loginThroughUI', (email: string, password: string) => {
  cy.intercept('POST', '**/auth/login').as('login')
  cy.visit('/login')
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.contains('button', 'Sign in').click()
  cy.wait('@login').its('response.statusCode').should('eq', 200)
})

Cypress.Commands.add('clearAuth', () => {
  cy.clearLocalStorage()
  cy.clearCookies()
})

export {}
