import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { SetupIntent } from '@stripe/stripe-js';
import { newnewapi } from 'newnew-api';

import { createStripeSetupIntent } from '../../../api/endpoints/payments';
import { useAppSelector } from '../../../redux-store/store';
import StripeElements from '../../../HOC/StripeElementsWithClientSecret';
import useRecaptcha from '../../../utils/hooks/useRecaptcha';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';

// Components
import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import Text from '../../atoms/Text';
import ModalPaper from '../../organisms/ModalPaper';
import Lottie from '../../atoms/Lottie';
import CardSetupCompleteModal from '../../organisms/settings/CardSetupCompleteModal';

import logoAnimation from '../../../public/animations/mobile_logo.json';
import ReCaptchaV2 from '../../atoms/ReCaptchaV2';

interface IAddCardForm {
  onCancel: () => void;
  onSuccess: (setupIntent: SetupIntent) => void;
}

const AddCardForm: React.FC<IAddCardForm> = ({ onCancel, onSuccess }) => {
  const { t } = useTranslation('page-Profile');
  const { showErrorToastPredefined } = useErrorToasts();
  const { t: tCommon } = useTranslation('common');

  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState('');
  const [isStripeReady, setIsStripeReady] = useState(false);

  const handleConfirmSetup = async () => {
    if (!stripe || !elements) {
      return;
    }

    const { setupIntent, error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile/settings/card-setup-complete`,
      },
      redirect: 'if_required',
    });

    if (error && error.type === 'card_error') {
      throw new Error(error.message);
    }

    if (!error) {
      onSuccess(setupIntent);
    }
  };

  const handleSubmit = async () => {
    try {
      await handleConfirmSetup();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'An error occurred');
    }
  };

  const recaptchaRef = useRef(null);

  const {
    onChangeRecaptchaV2,
    isRecaptchaV2Required,
    submitWithRecaptchaProtection,
    isSubmitting,
    errorMessage: recaptchaErrorMessage,
  } = useRecaptcha(handleSubmit, recaptchaRef);

  useEffect(() => {
    if (recaptchaErrorMessage) {
      showErrorToastPredefined(recaptchaErrorMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recaptchaErrorMessage]);

  useEffect(() => {
    // fix recaptcha challenge overlay issue
    if (isRecaptchaV2Required) {
      document.body.style.top = '0';
    }
  }, [isRecaptchaV2Required]);

  useEffect(
    () => () => {
      setErrorMessage('');
      setIsStripeReady(false);
    },
    []
  );

  return (
    <SForm
      onSubmit={(e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        submitWithRecaptchaProtection();
      }}
    >
      <PaymentElement
        id='stripePayment'
        onReady={() => {
          setIsStripeReady(true);
        }}
        options={{
          terms: {
            card: 'never',
          },
          wallets: {
            googlePay: 'never',
            applePay: 'never',
          },
        }}
      />
      {isRecaptchaV2Required && (
        <SReCaptchaV2 onChange={onChangeRecaptchaV2} ref={recaptchaRef} />
      )}

      {errorMessage && (
        <SErrorText variant={3} tone='error'>
          {errorMessage}
        </SErrorText>
      )}
      {isStripeReady && (
        <SModalButtons>
          <SAddButton
            id='submit-card'
            view='primary'
            disabled={!stripe || isSubmitting}
            type='submit'
            loading={isSubmitting}
            style={{
              ...(isSubmitting ? { cursor: 'wait' } : {}),
            }}
          >
            {t('Settings.sections.cards.button.addCard')}
          </SAddButton>
          <SCancelButton onClick={onCancel} view='secondary'>
            {tCommon('button.cancel')}
          </SCancelButton>
        </SModalButtons>
      )}
    </SForm>
  );
};

interface IAddCardModal {
  show: boolean;
  closeModal: () => void;
}

const AddCardModal: React.FC<IAddCardModal> = ({ show, closeModal }) => {
  const { t } = useTranslation('page-Profile');

  const [stripeSecret, setStripeSecret] = useState('');
  const [isStripeSecretLoading, setIsStripeSecretLoading] = useState(false);

  const { loggedIn } = useAppSelector((state) => state.user);

  useEffect(() => {
    const creteSetupIntent = async () => {
      try {
        setIsStripeSecretLoading(true);
        const payload = new newnewapi.CreateStripeSetupIntentRequest({
          saveCardRequest: new newnewapi.SaveCardRequest(),
        });
        const response = await createStripeSetupIntent(payload);

        if (
          !response.data ||
          response.error ||
          !response.data.stripeSetupIntentClientSecret
        ) {
          throw new Error(response.error?.message || 'Some error occurred');
        }

        setStripeSecret(response.data.stripeSetupIntentClientSecret);
      } catch (err) {
        console.error(err);
      } finally {
        setIsStripeSecretLoading(false);
      }
    };

    if (loggedIn && show) {
      creteSetupIntent();
    }
  }, [loggedIn, show]);

  const handleClose = () => {
    setStripeSecret('');
    closeModal();
  };

  const [isCardSetupCompleted, setIsCardSetupCompleted] = useState(false);
  const [stripeSetupIntent, setStripeSetupIntent] =
    useState<SetupIntent | null>(null);

  const handleCloseCardSetupCompleteModal = () => {
    setIsCardSetupCompleted(false);
    handleClose();
  };

  const onCardSuccess = (setupIntentValue: SetupIntent) => {
    setIsCardSetupCompleted(true);
    setStripeSetupIntent(setupIntentValue);
  };

  if (!loggedIn) {
    return null;
  }

  return (
    <>
      <Modal show={show} onClose={handleClose} overlaydim>
        <SModalPaper
          title={t('Settings.sections.cards.button.addNewCard')}
          onClose={handleClose}
          isCloseButton
          isMobileFullScreen
        >
          {isStripeSecretLoading && (
            <SLoader>
              <Lottie
                width={64}
                height={64}
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: logoAnimation,
                }}
              />
            </SLoader>
          )}
          <StripeElements stipeSecret={stripeSecret}>
            <AddCardForm onCancel={closeModal} onSuccess={onCardSuccess} />
          </StripeElements>
        </SModalPaper>
      </Modal>
      {isCardSetupCompleted && stripeSetupIntent && (
        <CardSetupCompleteModal
          show={isCardSetupCompleted}
          closeModal={handleCloseCardSetupCompleteModal}
          clientSecret={stripeSetupIntent.client_secret}
          setupIntentId={stripeSetupIntent.id}
        />
      )}
    </>
  );
};

export default AddCardModal;

AddCardModal.defaultProps = {};

const SModalPaper = styled(ModalPaper)`
  min-height: 200px;

  & > div {
    overflow-x: hidden;

    &:not(:first-child) {
      height: 100%;
    }
  }
`;

const SReCaptchaV2 = styled(ReCaptchaV2)`
  margin-top: 20px;
`;

const SForm = styled.form`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SModalButtons = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: auto;

  ${({ theme }) => theme.media.tablet} {
    flex-direction: row-reverse;
    margin-top: 32px;
  }
`;

const SCancelButton = styled(Button)`
  padding: 12px 24px;
  margin-top: 16px;
  flex-shrink: 0;

  font-size: 14px;
  line-height: 24px;

  ${({ theme }) => theme.media.tablet} {
    display: block;
    margin-right: auto;
    margin-top: 0;
  }
`;

const SAddButton = styled(Button)`
  flex: 1;
  ${({ theme }) => theme.media.tablet} {
    flex: initial;
  }
`;

const SErrorText = styled(Text)`
  text-align: center;
  margin-top: 8px;
`;

const SLoader = styled.div`
  top: 50%;
  left: 50%;
  z-index: 20;
  position: absolute;
  transform: translate(-50%, -50%);
`;
