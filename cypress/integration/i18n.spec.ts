context('Application with i18n enabled', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('NEXT_PUBLIC_APP_URL'));
  });

  it('has correct default locale', () => {
    const {
      defaultLocale,
      locales,
    } = Cypress.env('i18n');

    let welcomeTextDefaultLocale = '';

    const anyNonDefaultLocale: string = locales.filter((n: string) => n !== defaultLocale)[0];

    // find the welcoming text using the default locale
    cy.get('h1')
      .invoke('text')
      .then((welcomeText) => {
        welcomeTextDefaultLocale = welcomeText;
      });

    // switch the locale to any other one
    cy.log(`Trying to get the main page using the following locale: ${anyNonDefaultLocale}`);
    cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/${anyNonDefaultLocale}`);

    // check the the welcoming text has changed
    cy.get('h1')
      .invoke('text')
      .then((welcomeText) => {
        expect(welcomeText)
          .to
          .not
          .equal(welcomeTextDefaultLocale);
      });
  });
});
