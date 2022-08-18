import createStorage from './utils/createStorage';
import enterVerificationCode from './utils/enterVerificationCode';

context('Main flow', () => {
  let eventId = '';
  let superpollId = '';
  let crowdfundingId = '';

  Cypress.on('uncaught:exception', (err, runnable) => {
    // Do nothing
    return false;
  });

  describe('Creator', () => {
    const CREATOR_EMAIL = 'test-creator@newnew.co';

    const defaultStorage = {
      userTutorialsProgress:
        '{"remainingAcSteps":[],"remainingMcSteps":[],"remainingCfSteps":[],"remainingAcCrCurrentStep":[],"remainingCfCrCurrentStep":[],"remainingMcCrCurrentStep":[]}',
    };
    const storage = createStorage(defaultStorage);

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
      cy.wait(10000);
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

      cy.get('#review', {
        timeout: 20000,
      })
        .should('be.enabled')
        .click();
      cy.url().should('include', '/creation/auction/preview');

      cy.get('#publish').click();

      cy.get('#see-post').click();
      cy.url()
        .should('include', '/post')
        .then((urlstring) => {
          const chunks = urlstring.split('/');
          eventId = chunks[chunks.length - 1];
        });
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

      cy.get('#review', {
        timeout: 20000,
      })
        .should('be.enabled')
        .click();
      cy.url().should('include', '/creation/multiple-choice/preview');

      cy.get('#publish').click();

      cy.get('#see-post').click();
      cy.url()
        .should('include', '/post')
        .then((urlstring) => {
          const chunks = urlstring.split('/');
          superpollId = chunks[chunks.length - 1];
        });
    });

    it('can create a crowdfunding', () => {
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

      cy.get('#review', {
        timeout: 20000,
      })
        .should('be.enabled')
        .click();
      cy.url().should('include', '/creation/crowdfunding/preview');

      cy.get('#publish').click();

      cy.get('#see-post').click();
      cy.url()
        .should('include', '/post')
        .then((urlstring) => {
          const chunks = urlstring.split('/');
          crowdfundingId = chunks[chunks.length - 1];
        });
    });
  });

  describe('User', () => {
    const USER_EMAIL = 'test-user@newnew.co';

    // Ignore tutorials
    const defaultStorage = {
      userTutorialsProgress:
        '{"remainingAcSteps":[],"remainingMcSteps":[],"remainingCfSteps":[],"remainingAcCrCurrentStep":[],"remainingCfCrCurrentStep":[],"remainingMcCrCurrentStep":[]}',
    };
    const storage = createStorage(defaultStorage);

    // TODO: remove
    before(() => {
      // Let all posts finish processing
      cy.wait(30000);
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

    it('can enter the post page and contribute to an event without prior authentication', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/post/${eventId}`);
      cy.url().should('include', '/post');

      cy.get('#text-input').type('something');
      cy.get('#bid-input').type('10');
      cy.get('#submit')
        .should('be.enabled')
        .should('not.have.css', 'cursor', 'wait')
        .click();

      // TODO: test pay flow
      // cy.get('#pay', {
      //   timeout: 30000,
      // }).click();

      // TODO: enable Stripe testing (or test card adding flow)
      // cy.url().should('include', 'checkout.stripe.com/pay');
      // cy.get('#email', { timeout: 10000 }).type(USER_EMAIL);
      // cy.get('#cardNumber').type('4242424242424242');
      // cy.get('#cardExpiry').type('1230');
      // cy.get('#cardCvc').type('123');
      // cy.get('#billingName').type('user');
      // cy.get('form').submit();

      // TODO: test authentication after payment

      // TODO: test that contribution is visible on the post page
    });

    // TODO: can contribute to superpoll

    // TODO: can contribute to goal
  });

  // TODO: cover creator and successful post case
});
