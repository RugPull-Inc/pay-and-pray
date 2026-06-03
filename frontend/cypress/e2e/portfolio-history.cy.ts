/// <reference types="cypress" />

const OPERATIONS = [
  {
    id: '2',
    ticker: 'AAPL',
    type: 'SELL',
    quantity: 4,
    priceAtOperation: 105.0,
    createdAt: '2026-06-02T11:00:00Z',
  },
  {
    id: '1',
    ticker: 'AAPL',
    type: 'BUY',
    quantity: 10,
    priceAtOperation: 100.0,
    createdAt: '2026-06-02T10:00:00Z',
  },
]

describe('Portfolio history', () => {
  beforeEach(() => {
    cy.clearAuth()
    cy.setCookie('pay_and_pray_token', 'fake-token')
  })

  it('muestra compras y ventas con sus datos en orden cronológico inverso', () => {
    cy.intercept('GET', `${Cypress.env('apiUrl')}/portfolio/history`, {
      statusCode: 200,
      body: OPERATIONS,
    }).as('history')

    cy.visit('/portfolio/history')
    cy.wait('@history')

    cy.get('tbody tr').should('have.length', 2)

    cy.get('tbody tr')
      .eq(0)
      .within(() => {
        cy.get('.sell-badge').should('contain.text', 'SELL')
        cy.contains('AAPL').should('exist')
        cy.contains('4').should('exist')
        cy.contains('$105.00').should('exist')
        cy.contains('02/06/2026 11:00').should('exist')
      })

    cy.get('tbody tr')
      .eq(1)
      .within(() => {
        cy.get('.buy-badge').should('contain.text', 'BUY')
        cy.contains('AAPL').should('exist')
        cy.contains('10').should('exist')
        cy.contains('$100.00').should('exist')
        cy.contains('02/06/2026 10:00').should('exist')
      })

    cy.get('.sell-badge').should('have.class', 'text-red-400')
    cy.get('.buy-badge').should('have.class', 'text-emerald-400')
  })

  it('informa que no hay operaciones cuando el historial está vacío', () => {
    cy.intercept('GET', `${Cypress.env('apiUrl')}/portfolio/history`, {
      statusCode: 200,
      body: [],
    }).as('history')

    cy.visit('/portfolio/history')
    cy.wait('@history')

    cy.contains('No tenés operaciones registradas.').should('be.visible')
    cy.get('table').should('not.exist')
  })

  it('redirige a /login si el usuario no está autenticado', () => {
    cy.clearAuth()
    cy.visit('/portfolio/history')
    cy.url().should('include', '/login')
  })
})
