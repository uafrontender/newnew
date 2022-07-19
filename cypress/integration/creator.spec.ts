context('Creator', () => {
  const CREATOR_EMAIL = 'biba@newnew.co';

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
    // Enter code (how to get it?)
    // Verify that creator is on the dashboard
  });

  // Creator creates an event

  // Creator creates a superpoll

  // Creator creates a goal
});
