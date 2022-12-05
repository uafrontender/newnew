import createStorage from './utils/createStorage';
import enterCardInfo from './utils/enterCardInfo';
import enterVerificationCode from './utils/enterVerificationCode';

const VERIFICATION_CODE = '111111';
const postIdRegex = /p\/(.{36})/;

context('Main flow', () => {
  const testSeed = Date.now();

  let eventId = '';
  let superpollId = '';
  // let crowdfundingId = '';

  Cypress.on('uncaught:exception', (err, runnable) => {
    // Do nothing
    return false;
  });

  before(() => {
    cy.task('log', `test seed is ${testSeed}`);
  });

  describe('Creator', () => {
    const CREATOR_EMAIL = `test-creator-${testSeed}@newnew.co`;

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
      cy.get('#select-day-options').contains('1').click();

      cy.get('#select-month').click();
      cy.get('#select-month-options').contains('December').click();

      cy.get('#select-year').click();
      cy.get('#select-year-options').contains('1990').click();

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
        .should('include', '/p/')
        .then((urlstring) => {
          eventId = urlstring.match(postIdRegex)[1];
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
        .should('include', '/p/')
        .then((urlstring) => {
          superpollId = urlstring.match(postIdRegex)[1];
        });
    });

    /* it('can create a crowdfunding', () => {
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
      cy.get('#bundles-navigation').click();
      cy.url().should('include', '/creator/bundles');

      cy.get('#turn-on-bundles-button').click();
      cy.get('#turn-on-bundles-modal-button').click();
      cy.get('#success-bundle-modal').should('be.visible');
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
      cy.wait(4000);

      const attemptSeed = Math.floor(Math.random() * 100);
      USER_EMAIL = `test-user-${testSeed}${attemptSeed}0@newnew.co`;
      const BID_OPTION_TEXT = 'something';
      const BID_OPTION_AMOUNT = '10';

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${eventId}`);
      cy.url().should('include', '/p/');

      cy.get('#text-input').type(BID_OPTION_TEXT);
      cy.get('#bid-input').type(BID_OPTION_AMOUNT);
      cy.get('#submit')
        .should('be.enabled')
        .should('not.have.css', 'cursor', 'wait')
        .click();

      cy.get('#email-input').type(USER_EMAIL);
      enterCardInfo(
        USER_CARD_NUMBER,
        USER_CARD_EXPIRY,
        USER_CARD_CVC,
        USER_CARD_POSTAL_CODE
      );

      cy.get('#pay').click();

      cy.url().should('include', 'verify-email');
      cy.contains(USER_EMAIL);
      enterVerificationCode(VERIFICATION_CODE);

      cy.get('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.contains(BID_OPTION_TEXT);
      cy.contains(`${BID_OPTION_AMOUNT}`);
    });

    it('can enter another post page and contribute to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollId}`);
      cy.url().should('include', '/p/');

      cy.get('#support-button-0').click();
      cy.get('#vote-option-0').click();
      cy.get('#confirm-vote').click();

      cy.get('#pay').click();

      cy.get('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.get('#support-button-supported').click();
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
      cy.wait(4000);

      const attemptSeed = Math.floor(Math.random() * 100);
      USER_EMAIL = `test-user-${testSeed}${attemptSeed}0@newnew.co`;

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollId}`);
      cy.url().should('include', '/p/');

      cy.get('#buy-bundle-button').click();
      cy.get('#buy-bundle-1-button').click();

      cy.get('#email-input').type(USER_EMAIL);
      enterCardInfo(
        USER_CARD_NUMBER,
        USER_CARD_EXPIRY,
        USER_CARD_CVC,
        USER_CARD_POSTAL_CODE
      );

      cy.get('#pay').click();

      cy.url().should('include', 'verify-email');
      cy.contains(USER_EMAIL);
      enterVerificationCode(VERIFICATION_CODE);

      cy.url().should('include', '/bundles');

      // TODO: fix test below
      // wait and reload the page as WS is broken
      cy.wait(5000);
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollId}`);
      cy.url().should('include', '/p/');

      cy.get('#support-button-0').click();
      cy.get('#vote-option-bundle').click();
      cy.get('#bundle-votes-number').clear().type('10');
      cy.get('#use-bundle-votes').click();

      cy.get('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.get('#support-button-supported').click();
    });

    it('can add a custom option to the same superpoll', () => {
      const CUSTOM_OPTION = `new option ${testSeed}0`;
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollId}`);
      cy.url().should('include', '/p/');

      cy.get('#add-option-button').click();
      cy.get('#add-option-input').type(CUSTOM_OPTION);
      cy.get('#add-option-submit').click();
      cy.get('#add-option-confirm').click();
      cy.get('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.get('#support-button-suggested').click();
    });

    it('can contribute to the same superpoll with the card payment', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollId}`);
      cy.url().should('include', '/p/');

      cy.get('#support-button-supported').click();
      cy.get('#vote-option-0').click();
      cy.get('#confirm-vote').click();

      cy.get('#pay').click();

      cy.get('#paymentSuccess', {
        timeout: 15000,
      }).click();
    });
  });

  describe('User willing to contribute', () => {
    const USER_EMAIL = `test-user-${testSeed}2@newnew.co`;
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
      cy.get('#log-in').click();
      cy.url().should('include', '/sign-up');

      cy.get('#authenticate-input').type(USER_EMAIL);
      cy.get('#authenticate-form').submit();
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

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${eventId}`);
      cy.url().should('include', '/p/');

      cy.get('#text-input').type(BID_OPTION_TEXT);
      cy.get('#bid-input').type(BID_OPTION_AMOUNT);
      cy.get('#submit')
        .should('be.enabled')
        .should('not.have.css', 'cursor', 'wait')
        .click();

      cy.wait(4000);
      enterCardInfo(
        USER_CARD_NUMBER,
        USER_CARD_EXPIRY,
        USER_CARD_CVC,
        USER_CARD_POSTAL_CODE
      );

      cy.get('#pay').click();
      cy.get('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.contains(BID_OPTION_TEXT);
      cy.contains(`${BID_OPTION_AMOUNT}`);
    });

    it('can enter another post page and contribute to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollId}`);
      cy.url().should('include', '/p/');

      cy.get('#support-button-1').click();
      cy.get('#vote-option-1').click();
      cy.get('#confirm-vote').click();

      cy.get('#pay').click();

      cy.get('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.get('#support-button-supported').click();
    });
  });

  describe('User willing to buy a bundle', () => {
    const USER_EMAIL = `test-user-${testSeed}3@newnew.co`;
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
      cy.get('#log-in').click();
      cy.url().should('include', '/sign-up');

      cy.get('#authenticate-input').type(USER_EMAIL);
      cy.get('#authenticate-form').submit();
      cy.url().should('include', 'verify-email');
      cy.contains(USER_EMAIL);

      enterVerificationCode(VERIFICATION_CODE);
      cy.url().should('eq', `${Cypress.env('NEXT_PUBLIC_APP_URL')}/`, {
        timeout: 15000,
      });
    });

    it('can enter the post page, buy a bundle and contribute to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollId}`);
      cy.url().should('include', '/p/');

      cy.get('#buy-bundle-button').click();
      cy.get('#buy-bundle-1-button').click();

      cy.wait(4000);
      enterCardInfo(
        USER_CARD_NUMBER,
        USER_CARD_EXPIRY,
        USER_CARD_CVC,
        USER_CARD_POSTAL_CODE
      );

      cy.get('#pay').click();

      cy.get('#bundleSuccess', {
        timeout: 15000,
      }).click();

      // TODO: remove step below
      // wait and reload the page as WS is broken
      cy.wait(5000);
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollId}`);

      cy.get('#support-button-0').click();
      cy.get('#vote-option-bundle').click();
      cy.get('#bundle-votes-number').clear().type('10');
      cy.get('#use-bundle-votes').click();

      cy.get('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.get('#support-button-supported').click();
    });

    it('can add a custom option to the same superpoll', () => {
      const CUSTOM_OPTION = `new option ${testSeed}1`;
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollId}`);
      cy.url().should('include', '/p/');

      cy.get('#add-option-button').click();
      cy.get('#add-option-input').type(CUSTOM_OPTION);
      cy.get('#add-option-submit').click();
      cy.get('#add-option-confirm').click();
      cy.get('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.get('#support-button-suggested').click();
    });

    it('can contribute to the same superpoll with the card payment', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollId}`);
      cy.url().should('include', '/p/');

      cy.get('#support-button-supported').click();
      cy.get('#vote-option-0').click();
      cy.get('#confirm-vote').click();

      cy.get('#pay').click();

      cy.get('#paymentSuccess', {
        timeout: 15000,
      }).click();
    });
  });

  describe('User willing to add card first', () => {
    const USER_EMAIL = `test-user-${testSeed}4@newnew.co`;
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
      cy.get('#log-in').click();
      cy.url().should('include', '/sign-up');

      cy.get('#authenticate-input').type(USER_EMAIL);
      cy.get('#authenticate-form').submit();
      cy.url().should('include', 'verify-email');
      cy.contains(USER_EMAIL);

      enterVerificationCode(VERIFICATION_CODE);
      cy.url().should('eq', `${Cypress.env('NEXT_PUBLIC_APP_URL')}/`, {
        timeout: 15000,
      });
    });

    it('can enter settings', () => {
      cy.get('#profile-link').click();
      cy.url().should('include', 'profile');
      cy.get('#settings-button').click();
      cy.url().should('include', 'profile/settings');
    });

    it('can add a card', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/profile/settings`);
      cy.get('#cards').click();
      cy.get('#add-new-card').click();

      cy.wait(4000);
      enterCardInfo(
        USER_CARD_NUMBER,
        USER_CARD_EXPIRY,
        USER_CARD_CVC,
        USER_CARD_POSTAL_CODE
      );

      cy.get('#submit-card').click();

      // cy.get('#add-card-success', { timeout: 60000 }).click();
      // TODO: Re-enable part of the test above when WS updates work in test
      // Avoid WS update (temp)
      cy.wait(20000);
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/profile/settings`);
      cy.get('#cards').click();
      cy.contains('8210');
    });

    it('can enter a post page and contribute to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollId}`);
      cy.url().should('include', '/p/');

      cy.get('#support-button-2').click();
      cy.get('#vote-option-2').click();
      cy.get('#confirm-vote').click();

      cy.get('#pay').click();

      cy.get('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.get('#support-button-supported').click();
    });

    it('can enter the post page, buy a bundle and contribute to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollId}`);
      cy.url().should('include', '/p/');

      cy.get('#buy-bundle-button').click();
      cy.get('#buy-bundle-1-button').click();

      cy.get('#pay').click();

      cy.get('#bundleSuccess', {
        timeout: 15000,
      }).click();

      // TODO: remove step below
      // wait and reload the page as WS is broken
      cy.wait(5000);
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollId}`);

      cy.get('#support-button-supported').click();
      cy.get('#vote-option-bundle').click();
      cy.get('#bundle-votes-number').clear().type('10');
      cy.get('#use-bundle-votes').click();

      cy.get('#paymentSuccess', {
        timeout: 15000,
      }).click();
    });
  });
});
