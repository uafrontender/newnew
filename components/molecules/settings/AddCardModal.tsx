import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { SetupIntent } from '@stripe/stripe-js';
import { newnewapi } from 'newnew-api';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'react-toastify';

import { createStripeSetupIntent } from '../../../api/endpoints/payments';
import { useAppSelector } from '../../../redux-store/store';
import StripeElements from '../../../HOC/StripeElementsWithClientSecret';
import useRecaptcha from '../../../utils/hooks/useRecaptcha';

// Components
import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import Text from '../../atoms/Text';
import ModalPaper from '../../organisms/ModalPaper';
import Lottie from '../../atoms/Lottie';
import CardSetupCompleteModal from '../../organisms/settings/CardSetupCompleteModal';

import logoAnimation from '../../../public/animations/mobile_logo.json';

interface IAddCardForm {
  onCancel: () => void;
  onSuccess: (setupIntent: SetupIntent) => void;
}

const AddCardForm: React.FC<IAddCardForm> = ({ onCancel, onSuccess }) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Profile');
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
  } = useRecaptcha(handleSubmit, 0.5, 0.4, recaptchaRef);

  useEffect(() => {
    if (recaptchaErrorMessage) {
      toast.error(recaptchaErrorMessage);
    }
  }, [recaptchaErrorMessage]);

  useEffect(
    () => () => {
      setErrorMessage('');
      setIsStripeReady(false);
    },
    []
  );

  return (
    <form onSubmit={submitWithRecaptchaProtection}>
      <PaymentElement
        id='stripePayment'
        onReady={() => {
          setIsStripeReady(true);
        }}
        options={{
          terms: {
            card: 'never',
          },
        }}
      />
      {isRecaptchaV2Required && (
        <SRecaptchaWrapper>
          <ReCAPTCHA
            ref={recaptchaRef}
            size='normal'
            theme={theme.name === 'dark' ? 'dark' : 'light'}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY ?? ''}
            onChange={onChangeRecaptchaV2}
          />
        </SRecaptchaWrapper>
      )}

      {errorMessage && (
        <SErrorText variant={3} tone='error'>
          {errorMessage}
        </SErrorText>
      )}
      {isStripeReady && (
        <SModalButtons>
          <SCancelButton onClick={onCancel} view='secondary'>
            {tCommon('button.cancel')}
          </SCancelButton>
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
        </SModalButtons>
      )}
    </form>
  );
};

interface IAddCardModal {
  show: boolean;
  closeModal: () => void;
}

const AddCardModal: React.FC<IAddCardModal> = ({ show, closeModal }) => {
  const { t } = useTranslation('page-Profile');

  const [stipeSecret, setStripeSecret] = useState('');
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
          <StripeElements stipeSecret={stipeSecret}>
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
`;

const SRecaptchaWrapper = styled.div`
  margin-top: 20px;
`;

const SModalButtons = styled.div`
  display: flex;
  margin-top: 32px;
`;

const SCancelButton = styled(Button)`
  display: none;

  padding: 12px 24px;
  line-height: 24px;
  font-size: 14px;
  margin-right: auto;
  flex-shrink: 0;

  ${({ theme }) => theme.media.tablet} {
    display: block;
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
