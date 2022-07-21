import createStorage from './utils/createStorage';
import enterVerificationCode from './utils/enterVerificationCode';

context('Creator', () => {
  const CREATOR_EMAIL = 'test-creator@newnew.co';

  const storage = createStorage();

  Cypress.on('uncaught:exception', (err, runnable) => {
    // Do nothing
    return false;
  });

  beforeEach(() => {
    storage.restore();
    Cypress.Cookies.preserveOnce('accessToken');
    Cypress.Cookies.preserveOnce('refreshToken');
    cy.visit(Cypress.env('NEXT_PUBLIC_APP_URL'));
  });

  afterEach(() => {
    storage.save();
  });

  it('can enter application', () => {
    cy.get('#log-in').click();
    cy.url().should('include', '/sign-up');

    cy.get('#authenticate-input').type(CREATOR_EMAIL);
    cy.get('#authenticate-form').submit();
    cy.url().should('include', 'verify-email');
    cy.contains(CREATOR_EMAIL);

    enterVerificationCode();
    // Waiting for code to be verified
    cy.wait(4000);
    cy.url().should('include', '/creator/dashboard');
  });

  it('can navigate to creation panel', () => {
    cy.get('#create').click();
    cy.url().should('include', '/creation');
  });

  it('can create an event', () => {
    cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/creation`);

    // Waiting for an element to be attached to the DOM
    cy.wait(2000);
    cy.get('#auction').click();
    cy.url().should('include', '/creation/auction');

    cy.get('#title').type(`CI post ${Date.now()}`);
    cy.get('#minimalBid').clear().type('10');

    // IDEA: change duration
    // IDEA: change to scheduled
    // IDEA: change scheduled at time
    // IDEA: toggle comments

    // Needed to apply a value, make review button available
    cy.focused().blur();

    cy.fixture('test.mp4', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((fileContent) => {
        cy.get('#file').attachFile({
          fileContent,
          fileName: 'test.mp4',
          mimeType: 'video/mp4',
          encoding: 'utf8',
        });
      });

    cy.get('#bitmovinplayer-video-floating-preview', { timeout: 20000 }).should(
      'be.visible'
    );

    cy.get('#review').should('be.enabled').click();
    cy.url().should('include', '/creation/auction/preview');

    cy.get('#publish').click();

    cy.get('#see-post').click();
    cy.url().should('include', '/post');

    cy.wait(4000);
  });

  it('can create a superpoll', () => {
    cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/creation`);

    // Waiting for an element to be attached to the DOM
    cy.wait(2000);
    cy.get('#multiple-choice').click();
    cy.url().should('include', '/creation/multiple-choice');

    cy.get('#title').type(`CI post ${Date.now()}`);

    cy.get('#option-0').type(`first option`);
    cy.get('#option-1').type(`second option`);

    cy.get('#add-option').click();
    cy.get('#option-2').type(`third option`);

    // IDEA: move option around?

    cy.fixture('test.mp4', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((fileContent) => {
        cy.get('#file').attachFile({
          fileContent,
          fileName: 'test.mp4',
          mimeType: 'video/mp4',
          encoding: 'utf8',
        });
      });

    cy.get('#bitmovinplayer-video-floating-preview', { timeout: 20000 }).should(
      'be.visible'
    );

    cy.get('#review').should('be.enabled').click();
    cy.url().should('include', '/creation/multiple-choice/preview');

    cy.get('#publish').click();

    cy.get('#see-post').click();
    cy.url().should('include', '/post');

    cy.wait(4000);
  });

  it('can create a superpoll', () => {
    cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/creation`);

    // Waiting for an element to be attached to the DOM
    cy.wait(2000);
    cy.get('#crowdfunding').click();
    cy.url().should('include', '/creation/crowdfunding');

    cy.get('#title').type(`CI post ${Date.now()}`);
    cy.get('#targetBackerCount').clear().type('1');

    // Needed to apply a value, make review button available
    cy.focused().blur();

    cy.fixture('test.mp4', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((fileContent) => {
        cy.get('#file').attachFile({
          fileContent,
          fileName: 'test.mp4',
          mimeType: 'video/mp4',
          encoding: 'utf8',
        });
      });

    cy.get('#bitmovinplayer-video-floating-preview', { timeout: 20000 }).should(
      'be.visible'
    );

    cy.get('#review').should('be.enabled').click();
    cy.url().should('include', '/creation/crowdfunding/preview');

    cy.get('#publish').click();

    cy.get('#see-post').click();
    cy.url().should('include', '/post');

    cy.wait(4000);
  });
});
