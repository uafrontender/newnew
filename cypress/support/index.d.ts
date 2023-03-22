/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to select DOM element by data-cy attribute.
     * @example cy.dataCy('greeting')
     */
    getIframeElementOf(container: string, element: string): Chainable<Element>;
    dGet(
      elementSelector: string,
      options?: Partial<Loggable & Timeoutable & Withinable & Shadow>
    ): Chainable<Element>;
  }
}
