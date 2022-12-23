import createStorage from './utils/createStorage';
import enterCardInfo from './utils/enterCardInfo';
import enterVerificationCode from './utils/enterVerificationCode';

const VERIFICATION_CODE = '111111';
const postShortIdRegex = /p\/(.{6})/;

context('Main flow', () => {
  const testSeed = Date.now();

  let eventShortId = '';
  let superpollShortId = '';
  // let crowdfundingId = '';

  Cypress.on('uncaught:exception', (err, runnable) => {
    // Do nothing
    return false;
  });

  before(() => {
    cy.task('log', `test seed is ${testSeed}`);
  });

  describe('Creator', () => {
    const CREATOR_EMAIL = `test_creator_${testSeed}@newnew.co`;

    const defaultStorage = {
      userTutorialsProgress:
        '{"remainingAcSteps":[],"remainingMcSteps":[],"remainingCfSteps":[],"remainingAcCrCurrentStep":[],"remainingCfCrCurrentStep":[],"remainingMcCrCurrentStep":[]}',
    };
    const storage = createStorage(defaultStorage);

    before(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
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

    it('can register as a creator', () => {
      cy.dGet('#log-in-to-create').click();
      cy.url().should('include', '/sign-up?to=create');

      cy.dGet('#authenticate-input').type(CREATOR_EMAIL);
      cy.dGet('#authenticate-form').submit();
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
          cy.dGet('#avatar-input').attachFile({
            fileContent,
            fileName: 'avatar.png',
            mimeType: 'image/png',
            encoding: 'utf8',
          });
        })
        .then(() => {
          cy.dGet('#save-image').click();
        });

      cy.dGet('#settings_first_name_input').type('testCreator');
      cy.dGet('#settings_last_name_input').type('testCreator');
      cy.dGet('#nickname_input').type('testCreator');

      cy.dGet('#select-day').click();
      cy.dGet('#select-day-options').contains('1').click();

      cy.dGet('#select-month').click();
      cy.dGet('#select-month-options').contains('December').click();

      cy.dGet('#select-year').click();
      cy.dGet('#select-year-options').contains('1990').click();

      cy.dGet('#tos-checkbox').click();
      cy.dGet('#submit-button').click();

      cy.url().should('include', '/creator/dashboard');
    });

    it('can navigate to creation panel', () => {
      cy.dGet('#create').should('be.enabled').click();
      cy.url().should('include', '/creation');
    });

    it('can create an event', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/creation`);

      // Waiting for an element to be attached to the DOM
      cy.wait(2000);
      cy.dGet('#auction').click();
      cy.url().should('include', '/creation/auction');

      cy.dGet('#title').type(`CI post ${Date.now()}`);
      cy.dGet('#minimalBid').clear().type('10');

      // IDEA: change duration
      // IDEA: change to scheduled
      // IDEA: change scheduled at time
      // IDEA: toggle comments

      // Needed to apply a value, make review button available
      cy.focused().blur();

      cy.fixture('test.mp4', 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then((fileContent) => {
          cy.dGet('#file').attachFile({
            fileContent,
            fileName: 'test.mp4',
            mimeType: 'video/mp4',
            encoding: 'utf8',
          });
        });

      cy.dGet('#review', {
        timeout: 20000,
      })
        .should('be.enabled')
        .click();
      cy.url().should('include', '/creation/auction/preview');

      cy.dGet('#publish').click();

      cy.dGet('#see-post').click();

      cy.url()
        .should('include', '/p/')
        .then((urlstring) => {
          eventShortId = urlstring.match(postShortIdRegex)[1];
        });
    });

    it('can create a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/creation`);

      // Waiting for an element to be attached to the DOM
      cy.wait(2000);
      cy.dGet('#multiple-choice').click();
      cy.url().should('include', '/creation/multiple-choice');

      cy.dGet('#title').type(`CI post ${Date.now()}`);

      cy.dGet('#option-0').type(`first option`);
      cy.dGet('#option-1').type(`second option`);

      cy.dGet('#add-option').click();
      cy.dGet('#option-2').type(`third option`);

      // IDEA: move option around?

      cy.fixture('test.mp4', 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then((fileContent) => {
          cy.dGet('#file').attachFile({
            fileContent,
            fileName: 'test.mp4',
            mimeType: 'video/mp4',
            encoding: 'utf8',
          });
        });

      cy.dGet('#review', {
        timeout: 20000,
      })
        .should('be.enabled')
        .click();
      cy.url().should('include', '/creation/multiple-choice/preview');

      cy.dGet('#publish').click();

      cy.dGet('#see-post').click();
      cy.url()
        .should('include', '/p/')
        .then((urlstring) => {
          superpollShortId = urlstring.match(postShortIdRegex)[1];
        });
    });

    /* it('can create a crowdfunding', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/creation`);

      // Waiting for an element to be attached to the DOM
      cy.wait(2000);
      cy.dGet('#crowdfunding').click();
      cy.url().should('include', '/creation/crowdfunding');

      cy.dGet('#title').type(`CI post ${Date.now()}`);
      cy.dGet('#targetBackerCount').clear().type('1');

      // Needed to apply a value, make review button available
      cy.focused().blur();

      cy.fixture('test.mp4', 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then((fileContent) => {
          cy.dGet('#file').attachFile({
            fileContent,
            fileName: 'test.mp4',
            mimeType: 'video/mp4',
            encoding: 'utf8',
          });
        });

      cy.dGet('#review', {
        timeout: 20000,
      })
        .should('be.enabled')
        .click();
      cy.url().should('include', '/creation/crowdfunding/preview');

      cy.dGet('#publish').click();

      cy.dGet('#see-post').click();
      cy.url()
        .should('include', '/p/')
        .then((urlstring) => {
          const chunks = urlstring.split('/');
          crowdfundingId = chunks[chunks.length - 1];
        });
    }); */

    it('can enable bundles', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/creator/dashboard`);
      // Waiting for an element to be attached to the DOM
      cy.wait(2000);
      cy.dGet('#bundles-navigation').click();
      cy.url().should('include', '/creator/bundles');

      cy.dGet('#turn-on-bundles-button').click();
      cy.dGet('#turn-on-bundles-modal-button').click();
      cy.dGet('#success-bundle-modal').should('be.visible');
    });
  });

  describe('Guest willing to contribute', () => {
    let USER_EMAIL;
    const USER_CARD_NUMBER = '5200828282828210';
    const USER_CARD_EXPIRY = '1226';
    const USER_CARD_CVC = '123';
    const USER_CARD_POSTAL_CODE = '90210';

    // Ignore tutorials
    const defaultStorage = {
      userTutorialsProgress:
        '{"remainingAcSteps":[],"remainingMcSteps":[],"remainingCfSteps":[],"remainingAcCrCurrentStep":[],"remainingCfCrCurrentStep":[],"remainingMcCrCurrentStep":[]}',
    };
    const storage = createStorage(defaultStorage);

    before(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
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
      // Clear auth, use new email
      cy.setCookie('accessToken', '');
      cy.setCookie('refreshToken', '');
      storage.restart();
      cy.log(localStorage.getItem('remainingAcSteps'));
      cy.reload();
      cy.wait(2000);

      const attemptSeed = Math.floor(Math.random() * 100);
      USER_EMAIL = `test_user_${testSeed}${attemptSeed}0@newnew.co`;
      const BID_OPTION_TEXT = 'something';
      const BID_OPTION_AMOUNT = '10';

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${eventShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#text-input').type(BID_OPTION_TEXT);
      cy.dGet('#bid-input').type(BID_OPTION_AMOUNT);
      cy.dGet('#submit')
        .should('be.enabled')
        .should('not.have.css', 'cursor', 'wait')
        .click();

      cy.dGet('#email-input').type(USER_EMAIL);
      enterCardInfo(
        USER_CARD_NUMBER,
        USER_CARD_EXPIRY,
        USER_CARD_CVC,
        USER_CARD_POSTAL_CODE
      );

      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.url().should('include', 'verify-email');
      cy.contains(USER_EMAIL);
      enterVerificationCode(VERIFICATION_CODE);

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.contains(BID_OPTION_TEXT);
      cy.contains(`${BID_OPTION_AMOUNT}`);
    });

    it('can enter another post page and contribute to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#support-button-0').click();
      cy.dGet('#vote-option-0').click();
      cy.dGet('#confirm-vote').click();

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-supported').click();
    });
  });

  describe('Guest willing to buy a bundle', () => {
    let USER_EMAIL;
    const USER_CARD_NUMBER = '5200828282828210';
    const USER_CARD_EXPIRY = '1226';
    const USER_CARD_CVC = '123';
    const USER_CARD_POSTAL_CODE = '90210';

    // Ignore tutorials
    const defaultStorage = {
      userTutorialsProgress:
        '{"remainingAcSteps":[],"remainingMcSteps":[],"remainingCfSteps":[],"remainingAcCrCurrentStep":[],"remainingCfCrCurrentStep":[],"remainingMcCrCurrentStep":[]}',
    };
    const storage = createStorage(defaultStorage);

    before(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
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

    it('can enter the post page, buy a bundle without prior authentication and contribute to a superpoll', () => {
      // Clear auth, use new email
      cy.setCookie('accessToken', '');
      cy.setCookie('refreshToken', '');
      storage.restart();
      cy.log(localStorage.getItem('remainingAcSteps'));
      cy.reload();
      cy.wait(2000);

      const attemptSeed = Math.floor(Math.random() * 100);
      USER_EMAIL = `test_user_${testSeed}${attemptSeed}0@newnew.co`;

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#buy-bundle-button').click();
      cy.dGet('#buy-bundle-1-button').click();

      cy.dGet('#email-input').type(USER_EMAIL);
      enterCardInfo(
        USER_CARD_NUMBER,
        USER_CARD_EXPIRY,
        USER_CARD_CVC,
        USER_CARD_POSTAL_CODE
      );

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.url().should('include', 'verify-email');
      cy.contains(USER_EMAIL);
      enterVerificationCode(VERIFICATION_CODE);

      cy.url().should('include', '/bundles');

      // Wait not to miss bundles from both API and WS
      cy.wait(2000);

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#support-button-0').click();
      cy.dGet('#vote-option-bundle').click();
      cy.dGet('#bundle-votes-number').clear().type('10');
      cy.dGet('#use-bundle-votes').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-supported').click();
    });

    it('can add a custom option to the same superpoll', () => {
      const CUSTOM_OPTION = `new option ${testSeed}0`;
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#bundles');
      cy.dGet('#add-option-button').click();
      cy.dGet('#add-option-input').type(CUSTOM_OPTION);
      cy.dGet('#add-option-submit').click();
      cy.dGet('#add-option-confirm').click();
      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-suggested').click();
    });

    it('can contribute to the same superpoll with the card payment', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#support-button-supported').click();
      cy.dGet('#vote-option-0').click();
      cy.dGet('#confirm-vote').click();

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();
    });
  });

  describe('User willing to contribute', () => {
    const USER_EMAIL = `test_user_${testSeed}2@newnew.co`;
    const USER_CARD_NUMBER = '5200828282828210';
    const USER_CARD_EXPIRY = '1226';
    const USER_CARD_CVC = '123';
    const USER_CARD_POSTAL_CODE = '90210';

    // Ignore tutorials
    const defaultStorage = {
      userTutorialsProgress:
        '{"remainingAcSteps":[],"remainingMcSteps":[],"remainingCfSteps":[],"remainingAcCrCurrentStep":[],"remainingCfCrCurrentStep":[],"remainingMcCrCurrentStep":[]}',
    };
    const storage = createStorage(defaultStorage);

    before(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
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

    it('can sign in', () => {
      cy.dGet('#log-in').click();
      cy.url().should('include', '/sign-up');

      cy.dGet('#authenticate-input').type(USER_EMAIL);
      cy.dGet('#authenticate-form').submit();
      cy.url().should('include', 'verify-email');
      cy.contains(USER_EMAIL);

      enterVerificationCode(VERIFICATION_CODE);
      cy.url().should('eq', `${Cypress.env('NEXT_PUBLIC_APP_URL')}/`, {
        timeout: 15000,
      });
    });

    it('can enter the post page and contribute to an event', () => {
      const BID_OPTION_TEXT = 'something else';
      const BID_OPTION_AMOUNT = '15';

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${eventShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#text-input').type(BID_OPTION_TEXT);
      cy.dGet('#bid-input').type(BID_OPTION_AMOUNT);
      cy.dGet('#submit')
        .should('be.enabled')
        .should('not.have.css', 'cursor', 'wait')
        .click();

      // Wait for stripe elements to load
      cy.wait(2000);
      enterCardInfo(
        USER_CARD_NUMBER,
        USER_CARD_EXPIRY,
        USER_CARD_CVC,
        USER_CARD_POSTAL_CODE
      );

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.contains(BID_OPTION_TEXT);
      cy.contains(`${BID_OPTION_AMOUNT}`);
    });

    it('can enter another post page and contribute to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#support-button-1').click();
      cy.dGet('#vote-option-1').click();
      cy.dGet('#confirm-vote').click();

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-supported').click();
    });
  });

  describe('User willing to buy a bundle', () => {
    const USER_EMAIL = `test_user_${testSeed}3@newnew.co`;
    const USER_CARD_NUMBER = '5200828282828210';
    const USER_CARD_EXPIRY = '1226';
    const USER_CARD_CVC = '123';
    const USER_CARD_POSTAL_CODE = '90210';

    const defaultStorage = {
      userTutorialsProgress:
        '{"remainingAcSteps":[],"remainingMcSteps":[],"remainingCfSteps":[],"remainingAcCrCurrentStep":[],"remainingCfCrCurrentStep":[],"remainingMcCrCurrentStep":[]}',
    };
    const storage = createStorage(defaultStorage);

    before(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
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

    it('can sign in', () => {
      cy.dGet('#log-in').click();
      cy.url().should('include', '/sign-up');

      cy.dGet('#authenticate-input').type(USER_EMAIL);
      cy.dGet('#authenticate-form').submit();
      cy.url().should('include', 'verify-email');
      cy.contains(USER_EMAIL);

      enterVerificationCode(VERIFICATION_CODE);
      cy.url().should('eq', `${Cypress.env('NEXT_PUBLIC_APP_URL')}/`, {
        timeout: 15000,
      });
    });

    it('can enter the post page, buy a bundle and contribute to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#buy-bundle-button').click();
      cy.dGet('#buy-bundle-1-button').click();

      // Wait for stripe elements to load
      cy.wait(2000);
      enterCardInfo(
        USER_CARD_NUMBER,
        USER_CARD_EXPIRY,
        USER_CARD_CVC,
        USER_CARD_POSTAL_CODE
      );

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#bundleSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-0').click();
      cy.dGet('#vote-option-bundle').click();
      cy.dGet('#bundle-votes-number').clear().type('10');
      cy.dGet('#use-bundle-votes').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-supported').click();
    });

    it('can add a custom option to the same superpoll', () => {
      const CUSTOM_OPTION = `new option ${testSeed}1`;
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#bundles');
      cy.dGet('#add-option-button').click();
      cy.dGet('#add-option-input').type(CUSTOM_OPTION);
      cy.dGet('#add-option-submit').click();
      cy.dGet('#add-option-confirm').click();
      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-suggested').click();
    });

    it('can contribute to the same superpoll with the card payment', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#support-button-supported').click();
      cy.dGet('#vote-option-0').click();
      cy.dGet('#confirm-vote').click();

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();
    });
  });

  describe('User willing to add card first', () => {
    const USER_EMAIL = `test_user_${testSeed}4@newnew.co`;
    const USER_CARD_NUMBER = '5200828282828210';
    const USER_CARD_EXPIRY = '1226';
    const USER_CARD_CVC = '123';
    const USER_CARD_POSTAL_CODE = '90210';

    // Ignore tutorials
    const defaultStorage = {
      userTutorialsProgress:
        '{"remainingAcSteps":[],"remainingMcSteps":[],"remainingCfSteps":[],"remainingAcCrCurrentStep":[],"remainingCfCrCurrentStep":[],"remainingMcCrCurrentStep":[]}',
    };
    const storage = createStorage(defaultStorage);

    before(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
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

    it('can sign in', () => {
      cy.dGet('#log-in').click();
      cy.url().should('include', '/sign-up');

      cy.dGet('#authenticate-input').type(USER_EMAIL);
      cy.dGet('#authenticate-form').submit();
      cy.url().should('include', 'verify-email');
      cy.contains(USER_EMAIL);

      enterVerificationCode(VERIFICATION_CODE);
      cy.url().should('eq', `${Cypress.env('NEXT_PUBLIC_APP_URL')}/`, {
        timeout: 15000,
      });
    });

    it('can enter settings', () => {
      cy.dGet('#profile-link').click();
      cy.url().should('include', 'profile');
      cy.dGet('#settings-button').click();
      cy.url().should('include', 'profile/settings');
    });

    it('can add a card', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/profile/settings`);
      cy.dGet('#cards').click();
      cy.dGet('#add-new-card').click();

      // Wait for stripe elements to load
      cy.wait(2000);
      enterCardInfo(
        USER_CARD_NUMBER,
        USER_CARD_EXPIRY,
        USER_CARD_CVC,
        USER_CARD_POSTAL_CODE
      );

      cy.dGet('#submit-card').click();

      cy.dGet('#add-card-success', { timeout: 30000 }).click();
    });

    it('can enter a post page and contribute to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#support-button-2').click();
      cy.dGet('#vote-option-2').click();
      cy.dGet('#confirm-vote').click();

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-supported').click();
    });

    it('can enter the post page, buy a bundle and contribute to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#buy-bundle-button').click();
      cy.dGet('#buy-bundle-1-button').click();

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#bundleSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-supported').click();
      cy.dGet('#vote-option-bundle').click();
      cy.dGet('#bundle-votes-number').clear().type('10');
      cy.dGet('#use-bundle-votes').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();
    });
  });
});
