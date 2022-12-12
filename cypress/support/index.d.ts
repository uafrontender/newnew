/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
     */
    getIframeElementOf(container: string, element: string): Chainable<Element>;
    safeGet(elementSelector: string, options?: any): Chainable<Element>;
  }
}
