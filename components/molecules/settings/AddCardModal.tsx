import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

// Components
import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import Text from '../../atoms/Text';
import ModalPaper from '../../organisms/ModalPaper';

interface IReCaptchaRes {
  success?: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  errors?: Array<string> | string;
}

interface IAddCardModal {
  show: boolean;
  closeModal: () => void;
}

const AddCardModal: React.FC<IAddCardModal> = ({ show, closeModal }) => {
  const { t } = useTranslation('page-Profile');
  const { t: tCommon } = useTranslation('common');

  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStripeReady, setIsStripeReady] = useState(false);

  const handleConfirmSetup = async () => {
    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        // TODO: change to env
        return_url: `${window?.location?.origin}/profile/settings/card-setup-complete`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmitWithCaptchaProtection = async (
    e: React.ChangeEvent<HTMLFormElement>
  ) => {
    try {
      e.preventDefault();
      console.log('here');
      if (!executeRecaptcha) {
        throw new Error('executeRecaptcha not available');
      }

      setIsLoading(true);

      const recaptchaToken = await executeRecaptcha();

      if (recaptchaToken) {
        const res = await fetch('/api/post_recaptcha_query', {
          method: 'POST',
          body: JSON.stringify({
            recaptchaToken,
          }),
        });

        const jsonRes: IReCaptchaRes = await res.json();

        if (jsonRes?.success && jsonRes?.score && jsonRes?.score > 0.5) {
          await handleConfirmSetup();
        } else {
          if (!jsonRes?.errors) {
            throw new Error('ReCaptcha failed');
          }

          if (Array.isArray(jsonRes?.errors)) {
            throw new Error(jsonRes.errors[0]?.toString());
          }

          throw new Error(jsonRes.errors?.toString());
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!show) {
      setErrorMessage('');
      setIsStripeReady(false);
    }
  }, [show]);

  console.log(isLoading, 'isLoading');

  return (
    <Modal show={show} onClose={closeModal} overlaydim>
      <ModalPaper
        title={t('Settings.sections.cards.button.addNewCard')}
        onClose={closeModal}
        isCloseButton
        isMobileFullScreen
      >
        <form onSubmit={handleSubmitWithCaptchaProtection}>
          <PaymentElement
            onReady={() => {
              setIsStripeReady(true);
            }}
          />
          {errorMessage && (
            <SErrorText variant={3} tone='error'>
              {errorMessage}
            </SErrorText>
          )}
          {isStripeReady && (
            <SModalButtons>
              <SCancelButton onClick={closeModal} view='secondary'>
                {tCommon('button.cancel')}
              </SCancelButton>
              <SAddButton
                view='primary'
                disabled={!stripe || isLoading}
                type='submit'
                style={{
                  ...(isLoading ? { cursor: 'wait' } : {}),
                }}
              >
                {t('Settings.sections.cards.button.addCard')}
              </SAddButton>
            </SModalButtons>
          )}
        </form>
      </ModalPaper>
    </Modal>
  );
};

export default AddCardModal;

AddCardModal.defaultProps = {};

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
