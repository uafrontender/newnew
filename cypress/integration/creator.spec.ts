import createStorage from './utils/createStorage';
import enterCardInfo from './utils/enterCardInfo';
import enterVerificationCode from './utils/enterVerificationCode';

import { fetchProtobuf } from '../../api/apiConfigs';
import { newnewapi } from 'newnew-api';
import getShortPostIdFromUrl from './utils/getShortPostIdFromUrl';

const VERIFICATION_CODE = '111111';

context('Creator flow', () => {
  const testSeed = Date.now();

  const WL_USER_EMAIL = `test_user_wl_${testSeed}@newnew.co`;
  const CREATOR_EMAIL = `test_creator_${testSeed}@newnew.co`;

  let creatorUsername = '';
  let eventShortId = '';
  let superpollShortId = '';
  let payedToSuperpoll: number[] = [];
  let payedToBid: number[] = [];
  // TODO: Calculate to check bundle earnings
  let payedForBundles: number[] = [];
  let eventBids: { text: string; amount: number }[] = [];

  const SUPERPOLL_OPTIONS = [1, 2, 5, 10, 15, 25] as const;
  type SuperpollOption = typeof SUPERPOLL_OPTIONS[number];

  const BID_TO_WIN_TEXT = 'Bid winning';

  const BUNDLE_OFFERS = [500, 2500, 5000, 7500];

  let nextUserEmailId = 0;
  function getNextUserEmail() {
    const nextUserEmail = `test_user_${testSeed}${nextUserEmailId}@newnew.co`;
    nextUserEmailId++;
    return nextUserEmail;
  }

  let nextBidId = 0;
  function getBidOptionText() {
    // If too many numbers are added, user gets 403
    const nextBid = `Bid ${nextBidId}`;
    nextBidId++;
    return nextBid;
  }

  let nextOptionId = 0;
  function getNextCustomOptionText() {
    const nextOption = `new option ${testSeed}${nextOptionId}`;
    nextOptionId++;
    return nextOption;
  }

  function voteOnSuperpoll(
    optionIndex: number | 'supported' | 'suggested',
    voteOptionPrice: SuperpollOption | 'custom',
    votesNumber?: number
  ) {
    const supportButtonSelector = `#support-button-${optionIndex}`;
    cy.dGet(supportButtonSelector).click();

    if (voteOptionPrice === 'custom') {
      cy.dGet('#vote-option-custom').click();
      cy.dGet('#custom-votes-input').type(votesNumber.toString());
      cy.dGet('#custom-votes-submit').click();
      const customVotesPriceInCents = 2000 * 1.3 + (votesNumber - 2000) * 1;

      const fee = customVotesPriceInCents * 0.0225;
      const sumToPay = getDollarsFromCentsNumber(customVotesPriceInCents + fee);

      cy.dGet('#custom-votes-price')
        .invoke('text')
        .should('contain', sumToPay.toString());
    } else {
      const voteOptionIndex = SUPERPOLL_OPTIONS.indexOf(voteOptionPrice);
      const votePriceSelector = `#vote-option-${voteOptionIndex}-price`;
      cy.dGet(votePriceSelector)
        .invoke('text')
        .should('contain', voteOptionPrice);
      const voteButtonSelector = `#vote-option-${voteOptionIndex}`;
      cy.dGet(voteButtonSelector).click();
      cy.dGet('#confirm-vote').click();
    }

    return () => {
      if (voteOptionPrice === 'custom') {
        const customContribution = 2000 * 1.3 + (votesNumber - 2000) * 1;
        payedToSuperpoll.push(customContribution);
      } else {
        payedToSuperpoll.push(voteOptionPrice * 100);
      }
    };
  }

  function bidOnEvent(optionText: string, optionAmount: number): () => void {
    cy.dGet('#text-input').type(optionText);
    cy.dGet('#bid-input').type(optionAmount.toString());
    cy.dGet('#submit')
      .should('be.enabled')
      .should('not.have.css', 'cursor', 'wait')
      .click();

    return () => {
      const optionAmountInCents = optionAmount * 100;
      payedToBid.push(optionAmountInCents);
      eventBids.push({ text: optionText, amount: optionAmountInCents });
    };
  }

  // Need both correct text and index
  function boostEventBid(
    optionIndex: number,
    optionText: string,
    optionAmount: number
  ): () => void {
    const buttonSelector = `#bid-${optionIndex}-support`;
    cy.dGet(buttonSelector).click();
    const inputSelector = `#bid-${optionIndex}-amount`;
    cy.dGet(inputSelector).type(optionAmount.toString());
    const submitSelector = `#bid-${optionIndex}-submit`;
    cy.dGet(submitSelector)
      .should('be.enabled')
      .should('not.have.css', 'cursor', 'wait')
      .click();

    return () => {
      const optionAmountInCents = optionAmount * 100;
      payedToBid.push(optionAmountInCents);

      eventBids.push({ text: optionText, amount: optionAmountInCents });
    };
  }

  function getWinningBid() {
    const bidsMap = new Map<string, number>();

    eventBids.forEach((bid) => {
      const existingBidValue = bidsMap.get(bid.text) ?? 0;
      bidsMap.set(bid.text, existingBidValue + bid.amount);
    });

    let winningBid: { text: string; totalAmount: number };
    bidsMap.forEach((amount, text) => {
      if (!winningBid || winningBid.totalAmount < amount) {
        winningBid = {
          text: text,
          totalAmount: amount,
        };
      }
    });

    const winningsBids = eventBids.filter(
      (bid) => bid.text === winningBid.text
    );

    return { ...winningBid, bids: winningsBids.map((bid) => bid.amount) };
  }

  function calculateEarnings(rawAmountInCents: number): number {
    const feesInCents = Math.ceil(0.129 * rawAmountInCents) + 30;
    return rawAmountInCents - feesInCents;
  }

  function calculateTotalEarnings(contributions: number[]): number {
    const earnings = contributions.map((contribution) =>
      calculateEarnings(contribution)
    );
    return earnings.reduce((acc, next) => acc + next);
  }

  function getDollarsFromCentsNumber(amountInCents: number): number {
    const amountInDollars = Math.ceil(amountInCents) / 100;
    // Round up small decimal point error
    const roundedAmountInDollars = Math.round(amountInDollars * 100) / 100;
    return roundedAmountInDollars;
  }

  Cypress.on('uncaught:exception', (err, runnable) => {
    // Do nothing
    return false;
  });

  before(() => {
    cy.task('log', `test seed is ${testSeed}`);
  });

  describe('Creator', () => {
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
      cy.url().should('include', '/creator-onboarding');

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
      cy.dGet('#nickname_input').type(testSeed.toString());
      cy.dGet('#username_input').then((elem) => {
        creatorUsername = (Cypress.$(elem).val() as string).slice(1);
        // cy.log(creatorUsername);
      });

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
      cy.url().should('include', '/creation');

      // Waiting for an element to be attached to the DOM
      cy.wait(2000);
      cy.dGet('#auction').click();
      cy.url().should('include', '/creation/auction');

      // Waiting for an element to be attached to the DOM
      cy.wait(2000);
      cy.dGet('#title').type(`CI post event ${testSeed}`);

      cy.dGet('#expiresAt').click();
      cy.dGet('#1-hour').click();

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

      cy.dGet('#review')
        .should('be.enabled', {
          timeout: 60000,
        })
        .click();
      cy.url().should('include', '/creation/auction/preview');

      cy.dGet('#publish').click();

      cy.dGet('#see-post').click();

      cy.url()
        .should('include', '/p/')
        .then((urlstring) => {
          eventShortId = getShortPostIdFromUrl(urlstring);
        });
    });

    it('can create a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/creation`);
      cy.url().should('include', '/creation');

      // Waiting for an element to be attached to the DOM
      cy.wait(2000);
      cy.dGet('#multiple-choice').click();
      cy.url().should('include', '/creation/multiple-choice');

      // Waiting for an element to be attached to the DOM
      cy.wait(2000);
      cy.dGet('#title').type(`CI post superpoll ${testSeed}`);

      cy.dGet('#option-0').type(`first option`);
      cy.dGet('#option-1').type(`second option`);

      cy.dGet('#add-option').click();
      cy.dGet('#option-2').type(`third option`);

      // IDEA: move option around?

      cy.dGet('#expiresAt').click();
      cy.dGet('#1-hour').click();

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

      cy.dGet('#review')
        .should('be.enabled', {
          timeout: 60000,
        })
        .click();
      cy.url().should('include', '/creation/multiple-choice/preview');

      cy.dGet('#publish').click();

      cy.dGet('#see-post').click();
      cy.url()
        .should('include', '/p/')
        .then((urlstring) => {
          superpollShortId = getShortPostIdFromUrl(urlstring);
        });
    });

    it('can enable bundles', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/creator/dashboard`);
      cy.url().should('include', '/creator/dashboard');
      // Waiting for an element to be attached to the DOM
      cy.wait(2000);
      cy.dGet('#bundles-navigation').click();
      cy.url().should('include', '/creator/bundles');

      cy.dGet('#turn-on-bundles-button').click();
      cy.dGet('#turn-on-bundles-modal-button').click();
      cy.dGet('#success-bundle-modal').should('be.visible');
    });
  });

  describe('Whitelisted user willing to contribute', () => {
    const USER_EMAIL = WL_USER_EMAIL;

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

    it('can contribute to an event', () => {
      const BID_OPTION_AMOUNT = 85;

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${eventShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = bidOnEvent(BID_TO_WIN_TEXT, BID_OPTION_AMOUNT);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });

      cy.contains(BID_TO_WIN_TEXT);
      cy.contains(`${BID_OPTION_AMOUNT}`);
    });

    it('can boost own bid', () => {
      const BID_OPTION_AMOUNT = 15;

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${eventShortId}`);
      cy.url().should('include', '/p/');
      const onSuccess = boostEventBid(0, BID_TO_WIN_TEXT, BID_OPTION_AMOUNT);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });

      cy.contains(BID_TO_WIN_TEXT);
      cy.contains(`${BID_OPTION_AMOUNT}`);
    });

    it('can contribute to a superpoll ', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll(1, 2);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });

      cy.dGet('#support-button-supported').should('be.visible');
    });

    it('can make a custom contribution to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll('supported', 'custom', 3856);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });
    });

    it('can buy a bundle from a post page and contribute to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      // Wait for bundle offers to load
      cy.wait(4000);
      cy.dGet('#buy-bundle-button').click();
      cy.dGet('#buy-bundle-0-button').click();

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#bundleSuccess', {
        timeout: 15000,
      }).click();
      payedForBundles.push(BUNDLE_OFFERS[0]);
      cy.dGet('#bundles');

      cy.dGet('#support-button-supported').click();
      cy.dGet('#vote-option-bundle').click();
      cy.dGet('#bundle-votes-number').clear().type('10');
      cy.dGet('#use-bundle-votes').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();
    });

    it('can add a custom option to a superpoll', () => {
      const CUSTOM_OPTION = getNextCustomOptionText();
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#bundles');

      cy.dGet('#add-option-button').click();
      cy.dGet('#add-option-input').type(CUSTOM_OPTION);
      cy.dGet('#add-option-submit').should('be.enabled').click();
      cy.dGet('#add-option-confirm').click();
      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-suggested').should('be.visible');
    });

    it('can`t add another custom option to the same superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#add-option-button').should('not.exist');
    });

    it('can delete own custom option', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#suggested-option-container').click();
      cy.dGet('#option-ellipse-menu-delete').click();
      cy.dGet('#confirm-delete-option').click();

      cy.dGet('#support-button-suggested').should('not.exist');
      cy.dGet('#add-option-button').should('be.visible');
    });

    it('can add a new custom option after deleting old one', () => {
      const CUSTOM_OPTION = getNextCustomOptionText();
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#bundles');

      cy.dGet('#add-option-button').click();
      cy.dGet('#add-option-input').type(CUSTOM_OPTION);
      cy.dGet('#add-option-submit').should('be.enabled').click();
      cy.dGet('#add-option-confirm').click();
      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-suggested').should('be.visible');
    });
  });

  describe('Guest willing to contribute', () => {
    let USER_EMAIL;
    const USER_CARD_NUMBER = '4242424242424242';
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

    it('can boost a bid without prior authentication', () => {
      // Clear auth, use new email
      cy.setCookie('accessToken', '');
      cy.setCookie('refreshToken', '');
      storage.restart();

      cy.reload();
      cy.wait(2000);

      USER_EMAIL = getNextUserEmail();
      const BID_OPTION_AMOUNT = 10;

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${eventShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = boostEventBid(0, BID_TO_WIN_TEXT, BID_OPTION_AMOUNT);

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
      })
        .click()
        .then(() => {
          onSuccess();
        });

      cy.contains(BID_TO_WIN_TEXT);
      cy.contains(`${BID_OPTION_AMOUNT}`);
    });

    it('can contribute to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll(0, 1);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });

      cy.dGet('#support-button-supported').should('be.visible');
    });

    it('can make a custom contribution to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll('supported', 'custom', 2100);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });

      cy.dGet('#support-button-supported').should('be.visible');
    });
  });

  describe('User willing to contribute as a guest', () => {
    const USER_EMAIL = getNextUserEmail();
    const USER_CARD_NUMBER = '4242424242424242';
    const USER_ANOTHER_CARD_NUMBER = '5200828282828210';
    const USER_CARD_EXPIRY = '1226';
    const USER_CARD_CVC = '123';
    const USER_CARD_POSTAL_CODE = '90210';

    const BID_OPTION_TEXT = getBidOptionText();

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

    it('can contribute to an event without prior authentication', () => {
      // Clear auth, use new email
      cy.setCookie('accessToken', '');
      cy.setCookie('refreshToken', '');
      storage.restart();

      cy.reload();
      cy.wait(2000);

      const BID_OPTION_AMOUNT = 10;

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${eventShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = bidOnEvent(BID_OPTION_TEXT, BID_OPTION_AMOUNT);

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
      })
        .click()
        .then(() => {
          onSuccess();
        });

      cy.contains(BID_OPTION_TEXT);
      cy.contains(`${BID_OPTION_AMOUNT}`);
    });

    it('can boost a bid as a guest with the same card', () => {
      // Clear auth, use new email
      cy.setCookie('accessToken', '');
      cy.setCookie('refreshToken', '');
      storage.restart();

      cy.reload();
      cy.wait(2000);

      const BID_OPTION_AMOUNT = 10;

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${eventShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = boostEventBid(0, BID_TO_WIN_TEXT, BID_OPTION_AMOUNT);

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
      })
        .click()
        .then(() => {
          onSuccess();
        });

      cy.contains(BID_TO_WIN_TEXT);
      cy.contains(`${BID_OPTION_AMOUNT}`);
    });

    it('can contribute to a superpoll with the same card', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll(0, 1);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });

      cy.dGet('#support-button-supported').should('be.visible');
    });

    it('can boost a bid as a guest with another card', () => {
      // Clear auth, use new email
      cy.setCookie('accessToken', '');
      cy.setCookie('refreshToken', '');
      storage.restart();

      cy.reload();
      cy.wait(2000);

      const BID_OPTION_AMOUNT = 10;

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${eventShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = boostEventBid(0, BID_TO_WIN_TEXT, BID_OPTION_AMOUNT);

      cy.dGet('#email-input').type(USER_EMAIL);
      enterCardInfo(
        USER_ANOTHER_CARD_NUMBER,
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
      })
        .click()
        .then(() => {
          onSuccess();
        });

      cy.contains(BID_TO_WIN_TEXT);
      cy.contains(`${BID_OPTION_AMOUNT}`);
    });

    it('can contribute to a superpoll with another card', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll('supported', 1);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });

      cy.dGet('#support-button-supported').should('be.visible');
    });
  });

  describe('Guest willing to buy a bundle', () => {
    let USER_EMAIL;
    const USER_CARD_NUMBER = '4242424242424242';
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

    it('can buy a bundle from a post page without prior authentication and contribute to a superpoll with bundle votes', () => {
      // Clear auth, use new email
      cy.setCookie('accessToken', '');
      cy.setCookie('refreshToken', '');
      storage.restart();

      cy.reload();
      cy.wait(2000);

      USER_EMAIL = getNextUserEmail();

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

      cy.url().should('include', '/p/');
      cy.dGet('#bundles');

      // Could be great to show bundle purchased modal, but we don't know which offer was acquired

      cy.dGet('#support-button-0').click();
      cy.dGet('#vote-option-bundle').click();
      cy.dGet('#bundle-votes-number').clear().type('10');
      cy.dGet('#use-bundle-votes').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();
      payedForBundles.push(BUNDLE_OFFERS[1]);

      cy.dGet('#support-button-supported').should('be.visible');
    });

    it('can add a custom option to a superpoll', () => {
      const CUSTOM_OPTION = getNextCustomOptionText();
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#bundles');

      cy.dGet('#add-option-button').click();
      cy.dGet('#add-option-input').type(CUSTOM_OPTION);
      cy.dGet('#add-option-submit').should('be.enabled').click();
      cy.dGet('#add-option-confirm').click();
      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-suggested').should('be.visible');
    });

    it('can`t add another custom option to the same superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#add-option-button').should('not.exist');
    });

    it('can delete own custom option', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#suggested-option-container').click();
      cy.dGet('#option-ellipse-menu-delete').click();
      cy.dGet('#confirm-delete-option').click();

      cy.dGet('#support-button-suggested').should('not.exist');
      cy.dGet('#add-option-button').should('be.visible');
    });

    it('can add a new custom option after deleting old one', () => {
      const CUSTOM_OPTION = getNextCustomOptionText();
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#bundles');

      cy.dGet('#add-option-button').click();
      cy.dGet('#add-option-input').type(CUSTOM_OPTION);
      cy.dGet('#add-option-submit').should('be.enabled').click();
      cy.dGet('#add-option-confirm').click();
      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-suggested').should('be.visible');
    });

    it('can contribute to a superpoll with a card payment', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll('supported', 1);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });
    });

    it('can make a custom contribution to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll('supported', 'custom', 2901);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });
    });
  });

  describe('Guest willing to add a custom option', () => {
    let USER_EMAIL;
    const USER_CARD_NUMBER = '4242424242424242';
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

    it('can add a custom option to a superpoll without prior authentication', () => {
      const CUSTOM_OPTION = getNextCustomOptionText();
      // Clear auth, use new email
      cy.setCookie('accessToken', '');
      cy.setCookie('refreshToken', '');
      storage.restart();

      cy.reload();
      cy.wait(2000);

      USER_EMAIL = getNextUserEmail();

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#add-option-button').click();
      cy.dGet('#add-option-input').type(CUSTOM_OPTION);
      cy.dGet('#add-option-submit').should('be.enabled').click();

      cy.dGet('#buy-bundle-2-button').click();

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

      cy.url().should('include', '/p/');
      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();
      payedForBundles.push(BUNDLE_OFFERS[2]);
      // Could be great to show bundle purchased modal, but we don't know which offer was acquired

      cy.dGet('#bundles');
      cy.dGet('#support-button-suggested').should('be.visible');
    });

    it('can use all bundle votes on own custom option', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#bundles');

      cy.dGet('#support-button-suggested').click();
      cy.dGet('#vote-option-bundle').click();
      cy.dGet('#use-bundle-votes').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();
    });

    it('can`t add another custom option to the same superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#add-option-button').should('not.exist');
    });

    it('can delete own custom option', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#suggested-option-container').click();
      cy.dGet('#option-ellipse-menu-delete').click();
      cy.dGet('#confirm-delete-option').click();

      cy.dGet('#support-button-suggested').should('not.exist');
      cy.dGet('#add-option-button').should('be.visible');
    });

    it('can add a new custom option after deleting old one', () => {
      const CUSTOM_OPTION = getNextCustomOptionText();
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#bundles');

      cy.dGet('#add-option-button').click();
      cy.dGet('#add-option-input').type(CUSTOM_OPTION);
      cy.dGet('#add-option-submit').should('be.enabled').click();
      cy.dGet('#add-option-confirm').click();
      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-suggested').should('be.visible');
    });

    it('can contribute to a superpoll with a card payment', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll('suggested', 1);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();
      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });
    });

    it('can make a custom contribution to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll('suggested', 'custom', 2305);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });
    });
  });

  describe('Guest willing to buy a bundle from profile', () => {
    let USER_EMAIL;
    const USER_CARD_NUMBER = '4242424242424242';
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

    // Can fail if strict mode is enabled
    it('can enter post page from creators profile', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/${creatorUsername}`);
      cy.url().should('include', creatorUsername);
      const postCardSelector = `#post-card-${superpollShortId}`;
      cy.dGet(postCardSelector).click();

      cy.url().should('include', '/p/');
    });

    it('can buy a bundle from creator`s profile', () => {
      // Clear auth, use new email
      cy.setCookie('accessToken', '');
      cy.setCookie('refreshToken', '');
      storage.restart();

      cy.reload();
      cy.wait(2000);

      USER_EMAIL = getNextUserEmail();

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/${creatorUsername}`);
      cy.url().should('include', creatorUsername);
      cy.dGet('#buy-bundle-button').click();
      cy.dGet('#buy-bundle-3-button').click();

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

      cy.url().should('include', creatorUsername);

      // Could be great to show bundle purchased modal, but we don't know which offer was acquired

      payedForBundles.push(BUNDLE_OFFERS[3]);
      // Can fail due to issues with WS event
      cy.dGet('#bundles');

      cy.dGet('#see-bundle-button').should('be.visible');
    });

    it('can contribute to a superpoll with bundle votes', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#support-button-0').click();
      cy.dGet('#vote-option-bundle').click();
      cy.dGet('#bundle-votes-number').clear().type('10');
      cy.dGet('#use-bundle-votes').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-supported').should('be.visible');
    });

    it('can add a custom option to a superpoll', () => {
      const CUSTOM_OPTION = getNextCustomOptionText();
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#bundles');

      cy.dGet('#add-option-button').click();
      cy.dGet('#add-option-input').type(CUSTOM_OPTION);
      cy.dGet('#add-option-submit').should('be.enabled').click();
      cy.dGet('#add-option-confirm').click();
      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-suggested').should('be.visible');
    });

    it('can`t add another custom option to the same superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#add-option-button').should('not.exist');
    });

    it('can delete own custom option', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#suggested-option-container').click();
      cy.dGet('#option-ellipse-menu-delete').click();
      cy.dGet('#confirm-delete-option').click();

      cy.dGet('#support-button-suggested').should('not.exist');
      cy.dGet('#add-option-button').should('be.visible');
    });

    it('can add a new custom option after deleting old one', () => {
      const CUSTOM_OPTION = getNextCustomOptionText();
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#bundles');

      cy.dGet('#add-option-button').click();
      cy.dGet('#add-option-input').type(CUSTOM_OPTION);
      cy.dGet('#add-option-submit').should('be.enabled').click();
      cy.dGet('#add-option-confirm').click();
      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-suggested').should('be.visible');
    });

    it('can contribute to a superpoll with a card payment', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll('supported', 1);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });
    });

    it('can make a custom contribution to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll('supported', 'custom', 13678);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });
    });
  });

  describe('User willing to contribute', () => {
    const USER_EMAIL = getNextUserEmail();
    const USER_CARD_NUMBER = '4242424242424242';
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

    it('can contribute to an event', () => {
      const BID_OPTION_TEXT = getBidOptionText();
      const BID_OPTION_AMOUNT = 15;

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${eventShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = bidOnEvent(BID_OPTION_TEXT, BID_OPTION_AMOUNT);

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
      })
        .click()
        .then(() => {
          onSuccess();
        });

      cy.contains(BID_OPTION_TEXT);
      cy.contains(`${BID_OPTION_AMOUNT}`);
    });

    it('can contribute to a superpoll ', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll(1, 2);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });

      cy.dGet('#support-button-supported').should('be.visible');
    });

    it('can make a custom contribution to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll('supported', 'custom', 3856);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });
    });
  });

  describe('User willing to buy a bundle', () => {
    const USER_EMAIL = getNextUserEmail();
    const USER_CARD_NUMBER = '4242424242424242';
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

    it('can buy a bundle from a post page and contribute to a superpoll with bundle votes', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      // Wait for bundle offers to load
      cy.wait(4000);

      cy.dGet('#buy-bundle-button').click();
      cy.dGet('#buy-bundle-0-button').click();

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
      payedForBundles.push(BUNDLE_OFFERS[0]);
      cy.dGet('#bundles');

      cy.dGet('#support-button-0').click();
      cy.dGet('#vote-option-bundle').click();
      cy.dGet('#bundle-votes-number').clear().type('10');
      cy.dGet('#use-bundle-votes').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-supported').should('be.visible');
    });

    it('can add a custom option to a superpoll', () => {
      const CUSTOM_OPTION = getNextCustomOptionText();
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#bundles');

      cy.dGet('#add-option-button').click();
      cy.dGet('#add-option-input').type(CUSTOM_OPTION);
      cy.dGet('#add-option-submit').should('be.enabled').click();
      cy.dGet('#add-option-confirm').click();
      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-suggested').should('be.visible');
    });

    it('can`t add another custom option to the same superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#add-option-button').should('not.exist');
    });

    it('can delete own custom option', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#suggested-option-container').click();
      cy.dGet('#option-ellipse-menu-delete').click();
      cy.dGet('#confirm-delete-option').click();

      cy.dGet('#support-button-suggested').should('not.exist');
      cy.dGet('#add-option-button').should('be.visible');
    });

    it('can add a new custom option after deleting old one', () => {
      const CUSTOM_OPTION = getNextCustomOptionText();
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#bundles');

      cy.dGet('#add-option-button').click();
      cy.dGet('#add-option-input').type(CUSTOM_OPTION);
      cy.dGet('#add-option-submit').should('be.enabled').click();
      cy.dGet('#add-option-confirm').click();
      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-suggested').should('be.visible');
    });

    it('can contribute to a superpoll with a card payment', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll('supported', 1);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });
    });

    it('can make a custom contribution to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll('supported', 'custom', 13678);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });
    });
  });

  describe('User willing to buy a bundle from profile', () => {
    const USER_EMAIL = getNextUserEmail();
    const USER_CARD_NUMBER = '4242424242424242';
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

    // Can fail if strict mode is enabled
    it('can enter post page from creators profile', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/${creatorUsername}`);
      cy.url().should('include', creatorUsername);
      const postCardSelector = `#post-card-${superpollShortId}`;
      cy.dGet(postCardSelector).click();

      cy.url().should('include', '/p/');
    });

    it('can buy a bundle from creator`s profile', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/${creatorUsername}`);
      cy.url().should('include', creatorUsername);
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
      payedForBundles.push(BUNDLE_OFFERS[1]);
      cy.dGet('#bundles');

      cy.dGet('#see-bundle-button').should('be.visible');
    });

    it('can contribute to a superpoll with bundle votes', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#support-button-0').click();
      cy.dGet('#vote-option-bundle').click();
      cy.dGet('#bundle-votes-number').clear().type('10');
      cy.dGet('#use-bundle-votes').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-supported').should('be.visible');
    });

    it('can add a custom option to a superpoll', () => {
      const CUSTOM_OPTION = getNextCustomOptionText();
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#bundles');

      cy.dGet('#add-option-button').click();
      cy.dGet('#add-option-input').type(CUSTOM_OPTION);
      cy.dGet('#add-option-submit').should('be.enabled').click();
      cy.dGet('#add-option-confirm').click();
      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-suggested').should('be.visible');
    });

    it('can`t add another custom option to the same superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#add-option-button').should('not.exist');
    });

    it('can delete own custom option', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#suggested-option-container').click();
      cy.dGet('#option-ellipse-menu-delete').click();
      cy.dGet('#confirm-delete-option').click();

      cy.dGet('#support-button-suggested').should('not.exist');
      cy.dGet('#add-option-button').should('be.visible');
    });

    it('can add a new custom option after deleting old one', () => {
      const CUSTOM_OPTION = `5new option ${testSeed}7`;
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#bundles');

      cy.dGet('#add-option-button').click();
      cy.dGet('#add-option-input').type(CUSTOM_OPTION);
      cy.dGet('#add-option-submit').should('be.enabled').click();
      cy.dGet('#add-option-confirm').click();
      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-suggested').should('be.visible');
    });

    it('can contribute to a superpoll with a card payment', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll('supported', 1);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });
    });

    it('can make a custom contribution to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll('supported', 'custom', 13678);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });
    });
  });

  describe('User willing to add card first', () => {
    const USER_EMAIL = getNextUserEmail();
    const USER_CARD_NUMBER = '4242424242424242';
    const USER_CARD_2_NUMBER = '6011111111111117';
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
      cy.url().should('include', '/profile/settings');
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

    it('can contribute to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      // Possible hot fix for CI
      cy.wait(5000);
      const onSuccess = voteOnSuperpoll(2, 5);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });

      cy.dGet('#support-button-supported').should('be.visible');
    });

    it('can buy a bundle from a post page and contribute to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      // Wait for bundle offers to load
      cy.wait(4000);
      cy.dGet('#buy-bundle-button').click();
      cy.dGet('#buy-bundle-2-button').click();

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#bundleSuccess', {
        timeout: 15000,
      }).click();
      payedForBundles.push(BUNDLE_OFFERS[2]);
      cy.dGet('#bundles');

      cy.dGet('#support-button-supported').click();
      cy.dGet('#vote-option-bundle').click();
      cy.dGet('#bundle-votes-number').clear().type('10');
      cy.dGet('#use-bundle-votes').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();
    });

    it('can add a custom option to a superpoll', () => {
      const CUSTOM_OPTION = getNextCustomOptionText();
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#bundles');

      cy.dGet('#add-option-button').click();
      cy.dGet('#add-option-input').type(CUSTOM_OPTION);
      cy.dGet('#add-option-submit').should('be.enabled').click();
      cy.dGet('#add-option-confirm').click();
      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-suggested').should('be.visible');
    });

    it('can`t add another custom option to the same superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#add-option-button').should('not.exist');
    });

    it('can delete own custom option', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      cy.dGet('#suggested-option-container').click();
      cy.dGet('#option-ellipse-menu-delete').click();
      cy.dGet('#confirm-delete-option').click();

      cy.dGet('#support-button-suggested').should('not.exist');
      cy.dGet('#add-option-button').should('be.visible');
    });

    it('can add a new custom option after deleting old one', () => {
      const CUSTOM_OPTION = getNextCustomOptionText();
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#bundles');

      cy.dGet('#add-option-button').click();
      cy.dGet('#add-option-input').type(CUSTOM_OPTION);
      cy.dGet('#add-option-submit').should('be.enabled').click();
      cy.dGet('#add-option-confirm').click();
      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      }).click();

      cy.dGet('#support-button-suggested').should('be.visible');
    });

    it('can make a custom contribution to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = voteOnSuperpoll('supported', 'custom', 4234);

      // Wait stripe elements
      cy.wait(1000);
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });
    });

    it('can contribute to an event with another card', () => {
      const BID_OPTION_TEXT = getBidOptionText();
      const BID_OPTION_AMOUNT = 20;

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${eventShortId}`);
      cy.url().should('include', '/p/');

      const onSuccess = bidOnEvent(BID_OPTION_TEXT, BID_OPTION_AMOUNT);

      // Wait stripe elements
      cy.wait(1000);

      cy.dGet('#new-card').click();

      // Wait for stripe elements to load
      cy.wait(2000);
      enterCardInfo(
        USER_CARD_2_NUMBER,
        USER_CARD_EXPIRY,
        USER_CARD_CVC,
        USER_CARD_POSTAL_CODE
      );
      cy.dGet('#pay').click();

      cy.dGet('#paymentSuccess', {
        timeout: 15000,
      })
        .click()
        .then(() => {
          onSuccess();
        });

      cy.contains(BID_OPTION_TEXT);
      cy.contains(`${BID_OPTION_AMOUNT}`);
    });
  });

  describe('Creator willing to respond', () => {
    const defaultStorage = {
      userTutorialsProgress:
        '{"remainingAcSteps":[],"remainingMcSteps":[],"remainingCfSteps":[],"remainingAcCrCurrentStep":[],"remainingCfCrCurrentStep":[],"remainingMcCrCurrentStep":[], "remainingAcResponseCurrentStep":[], "remainingMcResponseCurrentStep":[]}',
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
      cy.dGet('#log-in-to-create').click();
      cy.url().should('include', '/sign-up?to=create');

      cy.dGet('#authenticate-input').type(CREATOR_EMAIL);
      cy.dGet('#authenticate-form').submit();
      cy.url().should('include', 'verify-email');
      cy.contains(CREATOR_EMAIL);

      enterVerificationCode(VERIFICATION_CODE);
      cy.url().should('include', '/creator/dashboard', {
        timeout: 15000,
      });
    });

    it('can change title of an active post', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${eventShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#edit-title').click();
      const newTitle = `CI post event ${testSeed} finishing`;
      cy.dGet('#edit-title-input').clear().type(newTitle);
      cy.dGet('#edit-title-submit')
        .should('be.enabled')
        .should('not.have.css', 'cursor', 'wait')
        .click();
      cy.dGet('#post-title').invoke('text').should('contain', newTitle);
    });

    it('[system call - end posts]', () => {
      // Wait for cookies
      cy.wait(2000);
      cy.getCookie('accessToken').then((cookie) => {
        fetchProtobuf<newnewapi.EmptyRequest, newnewapi.EmptyResponse>(
          newnewapi.EmptyRequest,
          newnewapi.EmptyResponse,
          `https://api-dev.newnew.co/v1/dev/update_post_internal_fields?post_uuid=${eventShortId}`,
          'post',
          new newnewapi.EmptyRequest(),
          {
            'x-auth-token': cookie.value,
            'x-from': 'web',
          },
          'cors',
          'same-origin',
          undefined
        );

        fetchProtobuf<newnewapi.EmptyRequest, newnewapi.EmptyResponse>(
          newnewapi.EmptyRequest,
          newnewapi.EmptyResponse,
          `https://api-dev.newnew.co/v1/dev/update_post_internal_fields?post_uuid=${superpollShortId}`,
          'post',
          new newnewapi.EmptyRequest(),
          {
            'x-auth-token': cookie.value,
            'x-from': 'web',
          },
          'cors',
          'same-origin',
          undefined
        );
      });

      // Wait for dev BE to finish with post
      cy.wait(30000);
    });

    it('can respond to an event', () => {
      const winningBid = getWinningBid();
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${eventShortId}`);
      cy.url().should('include', '/p/');

      const payedToBidTotal = payedToBid.reduce((acc, next) => acc + next);
      cy.dGet('#total-bids-amount')
        .invoke('text')
        .should(
          'contain',
          getDollarsFromCentsNumber(payedToBidTotal).toString()
        );

      cy.dGet('#select-option-0').click();

      cy.dGet('#bid-details')
        .invoke('text')
        .should(
          'contain',
          getDollarsFromCentsNumber(winningBid.totalAmount).toString()
        );
      cy.dGet('#bid-details').invoke('text').should('contain', winningBid.text);

      cy.dGet('#confirm-winning-bid').click();

      cy.dGet('#post-tab-response').click();
      // TODO: can fail due to video processing taking long. Separate stage of selecting winning bid out
      cy.dGet('#post-earnings')
        .invoke('text')
        .should(
          'contain',
          getDollarsFromCentsNumber(winningBid.totalAmount).toString()
        );

      cy.dGet('#upload-response-button').should('be.enabled');

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

      cy.dGet('#upload-button', { timeout: 90000 })
        .should('be.enabled')
        .click();
      cy.dGet('#earned-amount')
        .invoke('text')
        .should(
          'contain',
          getDollarsFromCentsNumber(winningBid.totalAmount).toString()
        );
    });

    it('can change title of a finished post', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#edit-title').click();
      const newTitle = `CI post superpoll ${testSeed} finished`;
      cy.dGet('#edit-title-input').clear().type(newTitle);
      cy.dGet('#edit-title-submit')
        .should('be.enabled')
        .should('not.have.css', 'cursor', 'wait')
        .click();
      cy.dGet('#post-title').invoke('text').should('contain', newTitle);
    });

    it('can respond to a superpoll', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');

      const payedToSuperpollTotal = payedToSuperpoll.reduce(
        (acc, next) => acc + next
      );

      cy.dGet('#post-earnings')
        .invoke('text')
        .should(
          'contain',
          getDollarsFromCentsNumber(payedToSuperpollTotal).toString()
        );

      cy.dGet('#upload-response-button').should('be.enabled');

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

      cy.dGet('#upload-button', { timeout: 90000 })
        .should('be.enabled')
        .click();

      cy.dGet('#earned-amount')
        .invoke('text')
        .should(
          'contain',
          getDollarsFromCentsNumber(payedToSuperpollTotal).toString()
        );
    });

    it('can change title of a post with a response published', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/p/${superpollShortId}`);
      cy.url().should('include', '/p/');
      cy.dGet('#edit-title').click();
      const newTitle = `CI post superpoll ${testSeed} published`;
      cy.dGet('#edit-title-input').clear().type(newTitle);
      cy.dGet('#edit-title-submit')
        .should('be.enabled')
        .should('not.have.css', 'cursor', 'wait')
        .click();
      cy.dGet('#post-title').invoke('text').should('contain', newTitle);
    });

    it('can access dashboard and add bio and see correct earnings on dashboard', () => {
      const CREATOR_BIO = 'I am test creator!';

      cy.dGet('#dashboard').click();
      cy.url().should('include', '/creator/dashboard');
      cy.dGet('#add-bio').click();
      cy.url().should('include', '/creator-onboarding-about');
      cy.dGet('#bio-input').type(CREATOR_BIO);
      cy.dGet('#submit').click();
      cy.url().should('include', '/creator-onboarding-stripe');
    });

    it('can see correct earnings on dashboard page', () => {
      // Let data update on BE
      cy.wait(10000);

      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/creator/dashboard`);

      // Let data load
      cy.wait(2000);

      const winningBid = getWinningBid();
      const acEarnings = calculateTotalEarnings(winningBid.bids);
      cy.dGet('#ac-earnings')
        .invoke('text')
        .should('contain', getDollarsFromCentsNumber(acEarnings).toString());

      const mcEarnings = calculateTotalEarnings(payedToSuperpoll);
      cy.dGet('#mc-earnings')
        .invoke('text')
        .should('contain', getDollarsFromCentsNumber(mcEarnings).toString());

      const bundleEarnings = calculateTotalEarnings(payedForBundles);
      cy.dGet('#bundles-earnings')
        .invoke('text')
        .should(
          'contain',
          getDollarsFromCentsNumber(bundleEarnings).toString()
        );

      const totalEarnings = acEarnings + mcEarnings + bundleEarnings;
      cy.dGet('#total-earnings')
        .invoke('text')
        .should('contain', getDollarsFromCentsNumber(totalEarnings).toString());
      // Let video capture the data
      cy.wait(2000);
    });

    it('can see correct earnings on bundles page', () => {
      cy.visit(`${Cypress.env('NEXT_PUBLIC_APP_URL')}/creator/bundles`);

      // Let data load
      cy.wait(2000);

      const bundleEarnings = calculateTotalEarnings(payedForBundles);
      cy.dGet('#total-bundle-earnings')
        .invoke('text')
        .should(
          'contain',
          getDollarsFromCentsNumber(bundleEarnings).toString()
        );

      BUNDLE_OFFERS.forEach((offer) => {
        const bundlesSold = payedForBundles.filter((x) => x === offer);
        const bundleEarnings = calculateTotalEarnings(bundlesSold);

        const bundleEarningsSelector = `#${offer}-bundle-earnings`;
        cy.dGet(bundleEarningsSelector)
          .invoke('text')
          .should(
            'contain',
            getDollarsFromCentsNumber(bundleEarnings).toString()
          );

        // Bundles sold number is broken
        // const bundleSoldSelector = `#${offer}-bundle-sold`;
        // cy.dGet(bundleSoldSelector)
        //   .invoke('text')
        //   .should('contain', bundlesSold.length.toString());
      });

      // Let video capture the data
      cy.wait(2000);
    });
  });
});
