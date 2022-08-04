import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import styled from 'styled-components';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { toast } from 'react-toastify';
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';

import Button from '../../atoms/Button';
import Text from '../../atoms/Text';
import Toggle from '../../atoms/Toggle';
import OptionCard from './OptionCard';

import { formatNumber } from '../../../utils/format';
import { useCards } from '../../../contexts/cardsContext';

interface IReCaptchaRes {
  success?: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  errors?: Array<string> | string;
}

// eslint-disable-next-line no-shadow
enum PaymentMethodTypes {
  PrimaryCard = 'primaryCard',
  NewCard = 'newCard',
}

interface ICheckoutForm {
  amount?: number;
  showTocApply?: boolean;
  bottomCaption?: React.ReactNode;
  handlePayWithCardStripeRedirect?: (params: {
    cardUuid?: string;
    stripeSetupIntentClientSecret: string;
    saveCard?: boolean;
  }) => void;
  stipeSecret: string;
}

const CheckoutForm: React.FC<ICheckoutForm> = ({
  handlePayWithCardStripeRedirect,
  amount,
  showTocApply,
  bottomCaption,
  stipeSecret,
}) => {
  const { t } = useTranslation('modal-PaymentModal');
  const elements = useElements();
  const stripe = useStripe();

  const [isStripeReady, setIsStripeReady] = useState(false);

  const { cards } = useCards();

  const primaryCard = useMemo(
    () => cards?.find((card) => card.isPrimary),
    [cards]
  );

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    PaymentMethodTypes | undefined
  >();

  const [saveCard, setSaveCard] = useState(false);

  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!stripe || !elements) {
        throw new Error('Stripe initialization error');
      }

      if (!executeRecaptcha) {
        throw new Error('executeRecaptcha not available');
      }

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
          if (
            selectedPaymentMethod === PaymentMethodTypes.PrimaryCard &&
            primaryCard
          ) {
            handlePayWithCardStripeRedirect?.({
              cardUuid: primaryCard.cardUuid as string,
              stripeSetupIntentClientSecret: stipeSecret,
            });
          } else if (selectedPaymentMethod === PaymentMethodTypes.NewCard) {
            const { error } = await stripe.confirmSetup({
              elements,
              confirmParams: {
                return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile/settings/card-setup-complete`,
              },
              redirect: 'if_required',
            });

            if (error) {
              toast.error(error.message);

              throw new Error(error.message);
            }

            handlePayWithCardStripeRedirect?.({
              stripeSetupIntentClientSecret: stipeSecret,
              saveCard,
            });
          }
        } else {
          throw new Error(
            // eslint-disable-next-line no-nested-ternary
            jsonRes?.errors
              ? Array.isArray(jsonRes?.errors)
                ? jsonRes.errors[0]?.toString()
                : jsonRes.errors?.toString()
              : 'ReCaptcha failed'
          );
        }
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {primaryCard && (
        <OptionCard
          handleClick={() =>
            setSelectedPaymentMethod(PaymentMethodTypes.PrimaryCard)
          }
          selected={selectedPaymentMethod === PaymentMethodTypes.PrimaryCard}
          label={`Primary card **** ${primaryCard.last4}`}
        />
      )}

      <OptionCard
        handleClick={() => setSelectedPaymentMethod(PaymentMethodTypes.NewCard)}
        selected={selectedPaymentMethod === PaymentMethodTypes.NewCard}
        label='New card'
      />
      {selectedPaymentMethod === PaymentMethodTypes.NewCard && (
        <SPaymentFormWrapper>
          <PaymentElement onReady={() => setIsStripeReady(true)} />
          {isStripeReady && (
            <SSaveCard>
              <Toggle
                checked={saveCard}
                onChange={() => setSaveCard((prevState) => !prevState)}
              />
              <SSaveCardText variant={3}>
                Save card for future use
              </SSaveCardText>
            </SSaveCard>
          )}
        </SPaymentFormWrapper>
      )}
      <SPayButtonDiv>
        <SPayButton
          type='submit'
          id='pay'
          view='primaryGrad'
          disabled={!selectedPaymentMethod}
        >
          {t('payButton')}
          {amount &&
            ` $${formatNumber(Math.max(amount, 0) / 100, amount % 1 === 0)}`}
        </SPayButton>
        {bottomCaption || null}
        {showTocApply && (
          <STocApply>
            *{' '}
            <Link href='https://terms.newnew.co'>
              <a
                href='https://terms.newnew.co'
                target='_blank'
                rel='noreferrer'
              >
                {t('tocApplyLink')}
              </a>
            </Link>{' '}
            {t('tocApplyText')}
          </STocApply>
        )}
        {
          // TODO: re-enable / move / make final decision
          /* <STocApplyReCaptcha>
              {t('reCaptchaTos.siteProtectedBy')}{' '}
              <a target='_blank' href='https://policies.google.com/privacy'>
                {t('reCaptchaTos.privacyPolicy')}
              </a>{' '}
              {t('reCaptchaTos.and')}{' '}
              <a target='_blank' href='https://policies.google.com/terms'>
                {t('reCaptchaTos.tos')}
              </a>{' '}
              {t('reCaptchaTos.apply')}
            </STocApplyReCaptcha> */
        }
      </SPayButtonDiv>
    </form>
  );
};

export default CheckoutForm;

const SPaymentFormWrapper = styled.div`
  margin-bottom: 16px;
`;

const SSaveCard = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;
`;

const SSaveCardText = styled(Text)`
  margin-left: 8px;
`;

const SPayButtonDiv = styled.div`
  width: 100%;
`;

const SPayButton = styled(Button)`
  width: 100%;
`;

const STocApply = styled.div`
  margin-top: 16px;

  text-align: center;

  font-weight: 600;
  font-size: 12px;
  line-height: 16px;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  a {
    font-weight: 600;

    color: ${({ theme }) => theme.colorsThemed.text.secondary};

    &:hover,
    &:focus {
      outline: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};

      transition: 0.2s ease;
    }
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 14px;
    line-height: 20px;
  }
`;
