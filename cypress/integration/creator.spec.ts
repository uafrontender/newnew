import enterVerificationCode from './utils/enterVerificationCode';

context('Creator', () => {
  const CREATOR_EMAIL = 'test-creator@newnew.co';

  Cypress.on('uncaught:exception', (err, runnable) => {
    // Do nothing
    return false;
  });

  beforeEach(() => {
    cy.visit(Cypress.env('NEXT_PUBLIC_APP_URL'));
  });

  it('can enter application', () => {
    cy.get('#log-in-button').trigger('click');
    cy.url().should('include', '/sign-up');

    cy.get('#authenticate-input').type(CREATOR_EMAIL);
    cy.get('#authenticate-form').submit();
    cy.url().should('include', 'verify-email');
    cy.contains(CREATOR_EMAIL);

    enterVerificationCode();

    cy.url().should('include', '/creator/dashboard');
  });

  // Creator creates an event

  // Creator creates a superpoll

  // Creator creates a goal
});
