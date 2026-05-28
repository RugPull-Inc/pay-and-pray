/// <reference types="cypress" />

describe('Portfolio trade forms', () => {
  beforeEach(() => {
    cy.clearAuth()
    cy.setCookie('pay_and_pray_token', 'fake-token')
  })

  it('submits a buy form against the backend contract', () => {
    cy.intercept('POST', '**/portfolio/buy', {
      statusCode: 201,
      body: {
        ticker: 'AAPL',
        quantity: 3,
        priceAtOperation: 100,
        newQuantity: 8,
        newAvgBuyPrice: 95,
      },
    }).as('buy')

    cy.visit('/portfolio/buy?ticker=AAPL')
    cy.get('#ticker').should('have.value', 'AAPL')
    cy.get('#quantity').type('3')
    cy.contains('button', 'Buy').click()

    cy.wait('@buy').its('request.body').should('deep.equal', {
      ticker: 'AAPL',
      quantity: 3,
    })
    cy.contains('Compra registrada: 3 unidades de AAPL').should('be.visible')
  })

  it('renders backend sell errors in the form', () => {
    cy.intercept('POST', '**/portfolio/sell', {
      statusCode: 400,
      body: {
        error: 'No podés vender más unidades de las que tenés',
      },
    }).as('sell')

    cy.visit('/portfolio/sell?ticker=AAPL')
    cy.get('#quantity').type('10')
    cy.contains('button', 'Sell').click()

    cy.wait('@sell').its('request.body').should('deep.equal', {
      ticker: 'AAPL',
      quantity: 10,
    })
    cy.contains('No podés vender más unidades de las que tenés').should(
      'be.visible'
    )
  })
})
