/// <reference types="cypress" />

describe('Portfolio view', () => {
  beforeEach(() => {
    cy.clearAuth()
  })

  it('permite comprar AAPL y ver la posición en Mi Portfolio', () => {
    cy.intercept('POST', `${Cypress.env('apiUrl')}/auth/login`, {
      statusCode: 200,
      body: { token: 'fake-token' },
    }).as('login')
    cy.intercept('POST', `${Cypress.env('apiUrl')}/portfolio/buy`, {
      statusCode: 201,
      body: {
        ticker: 'AAPL',
        quantity: 10,
        priceAtOperation: 100,
        newQuantity: 10,
        newAvgBuyPrice: 100,
      },
    }).as('buy')
    cy.intercept('GET', `${Cypress.env('apiUrl')}/portfolio`, {
      statusCode: 200,
      body: {
        positions: [
          {
            ticker: 'AAPL',
            quantity: 10,
            avgBuyPrice: 100,
            currentPrice: 110,
            currentValue: 1100,
            pnl: 100,
            pnlPercentage: 10,
          },
        ],
        totalValue: 1100,
      },
    }).as('portfolio')

    cy.visit('/login')
    cy.get('#email').type('portfolio@example.com')
    cy.get('#password').type('password')
    cy.contains('button', 'Sign in').click()
    cy.wait('@login')

    cy.visit('/portfolio/buy?ticker=AAPL')
    cy.get('#ticker').should('have.value', 'AAPL')
    cy.get('#quantity').type('10')
    cy.contains('button', 'Buy').click()
    cy.wait('@buy').its('request.body').should('deep.equal', {
      ticker: 'AAPL',
      quantity: 10,
    })

    cy.contains('a', 'Mi Portfolio').click()
    cy.wait('@portfolio')

    cy.get('tbody tr')
      .should('have.length', 1)
      .first()
      .within(() => {
        cy.contains('AAPL').should('be.visible')
        cy.contains('10').should('be.visible')
        cy.contains('+$100.00').should('be.visible')
        cy.contains('+10.00%').should('be.visible')
      })
    cy.contains('tfoot', '$1,100.00').should('be.visible')
    cy.contains('tfoot', '$0.00').should('not.exist')
  })
})
