context('Application with DarkMode feature', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('NEXT_PUBLIC_APP_URL'));
  });

  // Deleted default test, because now we have default auto mode

  it('can toggle the darkMode', () => {
    // consequentially enable and disable the dark mode
    for (let i = 0; i < 2; i++) {
      cy.get('button[id="dark-mode-button"]')
        .first()
        .click();

      cy.log(`Darkmode should be ${i === 0 ? 'disabled' : 'enabled'}`);

      cy.get('body')
        .should('have.css', 'background-color', i === 0 ? 'rgb(11, 10, 19)' : 'rgb(255, 255, 255)');
    }
  });
});
