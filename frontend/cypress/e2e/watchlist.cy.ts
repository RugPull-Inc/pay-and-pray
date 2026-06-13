/// <reference types="cypress" />

describe('Watchlist page', () => {
  beforeEach(() => {
    cy.clearAuth()
    cy.setCookie('pay_and_pray_token', 'fake-token')

    cy.intercept('GET', `${Cypress.env('apiUrl')}/companies/search*`, {
      statusCode: 200,
      body: [],
    }).as('search')
  })

  it('carga la watchlist y muestra el badge de posición abierta', () => {
    cy.intercept('GET', `${Cypress.env('apiUrl')}/watchlist`, {
      statusCode: 200,
      body: {
        items: [
          { ticker: 'AAPL', hasOpenPosition: true },
          { ticker: 'MSFT', hasOpenPosition: false },
        ],
      },
    }).as('getWatchlist')

    cy.visit('/watchlist')
    cy.wait('@getWatchlist')

    cy.get('tbody tr').should('have.length', 2)
    cy.contains('tr', 'AAPL').contains('Tengo posición').should('be.visible')
    cy.contains('tr', 'MSFT').contains('Sin posición').should('be.visible')
  })

  it('agrega una empresa existente seleccionándola del autocomplete', () => {
    cy.intercept('GET', `${Cypress.env('apiUrl')}/watchlist`, {
      statusCode: 200,
      body: { items: [] },
    }).as('getWatchlist')
    cy.intercept('GET', `${Cypress.env('apiUrl')}/companies/search*`, {
      statusCode: 200,
      body: [{ name: 'Apple Inc.', ticker: 'AAPL', cik: '320193' }],
    }).as('search')
    cy.intercept('POST', `${Cypress.env('apiUrl')}/watchlist`, {
      statusCode: 201,
      body: { ticker: 'AAPL' },
    }).as('postWatchlist')

    cy.visit('/watchlist')
    cy.wait('@getWatchlist')

    cy.get('#ticker').type('AAPL')
    cy.wait('@search')
    cy.contains('button', 'AAPL').click()

    cy.intercept('GET', `${Cypress.env('apiUrl')}/watchlist`, {
      statusCode: 200,
      body: { items: [{ ticker: 'AAPL', hasOpenPosition: false }] },
    }).as('getWatchlistAfter')

    cy.contains('button', 'Agregar').click()
    cy.wait('@postWatchlist')
      .its('request.body')
      .should('deep.equal', { ticker: 'AAPL' })
    cy.wait('@getWatchlistAfter')

    cy.get('#ticker').should('have.value', '')
    cy.contains('tbody tr', 'AAPL').should('be.visible')
  })

  it('muestra un error si la empresa ya está en la watchlist', () => {
    cy.intercept('GET', `${Cypress.env('apiUrl')}/watchlist`, {
      statusCode: 200,
      body: { items: [{ ticker: 'AAPL', hasOpenPosition: false }] },
    }).as('getWatchlist')

    cy.visit('/watchlist')
    cy.wait('@getWatchlist')

    cy.get('#ticker').type('AAPL')
    cy.contains('button', 'Agregar').click()

    cy.contains('El ticker ya está en tu watchlist.').should('be.visible')
    cy.get('tbody tr').should('have.length', 1)
  })

  it('muestra un error si la empresa no existe', () => {
    cy.intercept('GET', `${Cypress.env('apiUrl')}/watchlist`, {
      statusCode: 200,
      body: { items: [] },
    }).as('getWatchlist')
    cy.intercept('GET', `${Cypress.env('apiUrl')}/companies/search*`, {
      statusCode: 200,
      body: [],
    }).as('search')

    cy.visit('/watchlist')
    cy.wait('@getWatchlist')

    cy.get('#ticker').type('ZZZZ')
    cy.wait('@search')
    cy.contains('button', 'Agregar').click()

    cy.contains('No existe una empresa con ese ticker.').should('be.visible')
    cy.get('table').should('not.exist')
  })

  it('quita una empresa de la watchlist', () => {
    cy.intercept('GET', `${Cypress.env('apiUrl')}/watchlist`, {
      statusCode: 200,
      body: { items: [{ ticker: 'AAPL', hasOpenPosition: false }] },
    }).as('getWatchlist')
    cy.intercept('DELETE', `${Cypress.env('apiUrl')}/watchlist/AAPL`, {
      statusCode: 200,
      body: { ticker: 'AAPL' },
    }).as('delete')

    cy.visit('/watchlist')
    cy.wait('@getWatchlist')

    cy.intercept('GET', `${Cypress.env('apiUrl')}/watchlist`, {
      statusCode: 200,
      body: { items: [] },
    }).as('getWatchlistAfter')

    cy.contains('tr', 'AAPL').contains('button', 'Quitar').click()
    cy.wait('@delete')
    cy.wait('@getWatchlistAfter')

    cy.contains('Tu watchlist está vacía.').should('be.visible')
  })

  it('el link "Visitar empresa" navega a la página de la empresa', () => {
    cy.intercept('GET', `${Cypress.env('apiUrl')}/watchlist`, {
      statusCode: 200,
      body: { items: [{ ticker: 'AAPL', hasOpenPosition: false }] },
    }).as('getWatchlist')

    cy.visit('/watchlist')
    cy.wait('@getWatchlist')

    cy.contains('tr', 'AAPL').contains('a', 'Visitar empresa').click()
    cy.url().should('include', '/companies/AAPL')
  })
})
