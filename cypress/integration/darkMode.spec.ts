context('Application with DarkMode feature', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('NEXT_PUBLIC_APP_URL'));
  });

  it('uses by default the bright mode', () => {
    cy.get('body')
      .should('have.css', 'background-color', 'rgb(242, 242, 242)');
  });

  it('can toggle the darkMode', () => {
    // consequentially enable and disable the dark mode
    for (let i = 0; i < 2; i++) {
      cy.get('button[type="button"]')
        .first()
        .click();

      cy.log(`Darkmode should be ${i === 0 ? 'disabled' : 'enabled'}`);

      cy.get('body')
        .should('have.css', 'background-color', i === 0 ? 'rgb(11, 10, 19)' : 'rgb(242, 242, 242)');
    }
  });
});
