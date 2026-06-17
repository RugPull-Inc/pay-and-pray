/// <reference types="cypress" />

describe('Watchlist page', () => {
  beforeEach(() => {
    cy.clearAuth()
    cy.setCookie('pay_and_pray_token', 'fake-token')

    cy.intercept('GET', `${Cypress.env('apiUrl')}/companies/search*`, {
      statusCode: 200,
      body: { results: [] },
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
      body: {
        results: [{ name: 'Apple Inc.', ticker: 'AAPL', cik: '320193' }],
      },
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
      body: { results: [] },
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

  it('compara las métricas de dos empresas de la watchlist', () => {
    cy.intercept('GET', `${Cypress.env('apiUrl')}/watchlist`, {
      statusCode: 200,
      body: {
        items: [
          { ticker: 'AAPL', hasOpenPosition: false },
          { ticker: 'MSFT', hasOpenPosition: false },
        ],
      },
    }).as('getWatchlist')

    cy.intercept('GET', `${Cypress.env('apiUrl')}/watchlist/compare*`, {
      statusCode: 200,
      body: {
        company1: {
          ticker: 'AAPL',
          currentPrice: 62.87,
          marketCap: 2925763070000,
          revenueQuarterly: 3193000000,
          netIncomeQuarterly: 425000000,
          epsQuarterly: 1.61,
          totalAssets: 16640000000,
          totalLiabilities: 9749000000,
          lastFiling: {
            filingDate: '2026-04-30',
            form: '10-Q',
            accessionNumber: '0000320193-26-000001',
            reportDate: null,
            primaryDocument: null,
            url: null,
          },
          priceLastUpdatedAt: '2026-06-17T06:44:16.147054Z',
        },
        company2: {
          ticker: 'MSFT',
          currentPrice: 393.83,
          marketCap: 2925763070000,
          revenueQuarterly: 241832000000,
          netIncomeQuarterly: 97983000000,
          epsQuarterly: 13.19,
          totalAssets: 694228000000,
          totalLiabilities: 279861000000,
          lastFiling: {
            filingDate: '2026-04-29',
            form: '10-Q',
            accessionNumber: '0000789019-26-000001',
            reportDate: null,
            primaryDocument: null,
            url: null,
          },
          priceLastUpdatedAt: '2026-06-17T06:44:16.147048Z',
        },
      },
    }).as('getCompare')

    cy.visit('/watchlist')
    cy.wait('@getWatchlist')

    cy.contains('button', 'Comparar empresas').click()
    cy.contains('tr', 'AAPL').find('input[type="checkbox"]').click()
    cy.contains('tr', 'MSFT').find('input[type="checkbox"]').click()
    cy.contains('button', 'Comparar').click()

    cy.wait('@getCompare')

    cy.url().should('include', '/watchlist/compare')
    cy.contains('AAPL').should('be.visible')
    cy.contains('MSFT').should('be.visible')

    cy.contains('tr', 'Precio actual').within(() => {
      cy.contains('62.87').should('be.visible')
      cy.contains('393.83').should('be.visible')
    })
    cy.contains('tr', 'EPS (Q)').within(() => {
      cy.contains('1.61').should('be.visible')
      cy.contains('13.19').should('be.visible')
    })
    cy.contains('tr', 'Último filing').within(() => {
      cy.contains('2026-04-30').should('be.visible')
      cy.contains('2026-04-29').should('be.visible')
    })
  })

  it('muestra N/A cuando alguna métrica no está disponible al comparar', () => {
    cy.intercept('GET', `${Cypress.env('apiUrl')}/watchlist`, {
      statusCode: 200,
      body: {
        items: [
          { ticker: 'AAPL', hasOpenPosition: false },
          { ticker: 'MSFT', hasOpenPosition: false },
        ],
      },
    }).as('getWatchlist')

    cy.intercept('GET', `${Cypress.env('apiUrl')}/watchlist/compare*`, {
      statusCode: 200,
      body: {
        company1: {
          ticker: 'AAPL',
          currentPrice: null,
          marketCap: null,
          revenueQuarterly: 3193000000,
          netIncomeQuarterly: null,
          epsQuarterly: 1.61,
          totalAssets: 16640000000,
          totalLiabilities: 9749000000,
          lastFiling: null,
          priceLastUpdatedAt: null,
        },
        company2: {
          ticker: 'MSFT',
          currentPrice: 393.83,
          marketCap: 2925763070000,
          revenueQuarterly: 241832000000,
          netIncomeQuarterly: 97983000000,
          epsQuarterly: 13.19,
          totalAssets: 694228000000,
          totalLiabilities: 279861000000,
          lastFiling: {
            filingDate: '2026-04-29',
            form: '10-Q',
            accessionNumber: '0000789019-26-000001',
            reportDate: null,
            primaryDocument: null,
            url: null,
          },
          priceLastUpdatedAt: '2026-06-17T06:44:16.147048Z',
        },
      },
    }).as('getCompare')

    cy.visit('/watchlist')
    cy.wait('@getWatchlist')

    cy.contains('button', 'Comparar empresas').click()
    cy.contains('tr', 'AAPL').find('input[type="checkbox"]').click()
    cy.contains('tr', 'MSFT').find('input[type="checkbox"]').click()
    cy.contains('button', 'Comparar').click()

    cy.wait('@getCompare')

    cy.contains('tr', 'Precio actual').within(() => {
      cy.contains('N/A').should('be.visible')
      cy.contains('393.83').should('be.visible')
    })
    cy.contains('tr', 'Net Income (Q)').within(() => {
      cy.contains('N/A').should('be.visible')
    })
    cy.contains('tr', 'Último filing').within(() => {
      cy.contains('N/A').should('be.visible')
      cy.contains('2026-04-29').should('be.visible')
    })
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
