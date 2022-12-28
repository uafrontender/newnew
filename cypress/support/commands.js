// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import 'cypress-file-upload';

Cypress.Commands.add('getIframeElementOf', (container, element) => {
  // Delay emulates a user searching for an element
  // Could prevent Detached some minor detached from DOM issue
  cy.wait(300);
  return cy
    .get(container)
    .find('iframe')
    .its('0.contentDocument.body')
    .find(element)
    .then(cy.wrap);
});

Cypress.Commands.add('dGet', (elementSelector, options) => {
  // Delay emulates a user searching for an element
  // Could prevent Detached some minor detached from DOM issue
  cy.wait(300);
  const extendedOption = { ...options, scrollBehavior: false };
  return cy.get(elementSelector, extendedOption);
});
