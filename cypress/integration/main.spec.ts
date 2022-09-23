import createStorage from './utils/createStorage';
import enterVerificationCode from './utils/enterVerificationCode';

const VERIFICATION_CODE = '111111';

context('Main flow', () => {
  const testSeed = Date.now();

  let eventId = '';
  let superpollId = '';
  let crowdfundingId = '';

  Cypress.on('uncaught:exception', (err, runnable) => {
    // Do nothing
    return false;
  });

  describe('Creator', () => {
    const CREATOR_EMAIL = `test-creator-${testSeed}@newnew.co`;

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

    it('can register as a creator', () => {
      cy.get('#log-in-to-create').click();
      cy.url().should('include', '/sign-up?to=create');

      cy.get('#authenticate-input').type(CREATOR_EMAIL);
      cy.get('#authenticate-form').submit();
      cy.url().should('include', 'verify-email');
      cy.contains(CREATOR_EMAIL);

      enterVerificationCode(VERIFICATION_CODE);
      cy.url().should('include', '/creator-onboarding', {
        timeout: 15000,
      });
    });

    it('can onboard', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/creator-onboarding`);

      cy.fixture('avatar.png', 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then((fileContent) => {
          cy.get('#avatar-input').attachFile({
            fileContent,
            fileName: 'avatar.png',
            mimeType: 'image/png',
            encoding: 'utf8',
          });
        })
        .then(() => {
          cy.get('#save-image').click();
        });

      cy.get('#settings_first_name_input').type('testCreator');
      cy.get('#settings_last_name_input').type('testCreator');
      cy.get('#nickname_input').type('testCreator');

      cy.get('#select-day').click();
      cy.get('#select-day-options')
        .children()
        .first()
        .children()
        .last()
        .click();

      cy.get('#select-month').click();
      cy.get('#select-month-options')
        .children()
        .first()
        .children()
        .last()
        .click();

      cy.get('#select-year').click();
      cy.get('#select-year-options')
        .children()
        .first()
        .children()
        .last()
        .click();

      cy.get('#tos-checkbox').click();
      cy.get('#submit-button').click();

      cy.url().should('include', '/creator/dashboard');
    });

    it('can navigate to creation panel', () => {
      cy.get('#create').should('be.enabled').click();
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
    const USER_EMAIL = `test-user-${testSeed}@newnew.co`;

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
