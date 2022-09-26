import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import { StripePaymentElementOptions } from '@stripe/stripe-js';

import Button from '../../atoms/Button';
import Text from '../../atoms/Text';
import OptionCard from './OptionCard';
import Input from '../../atoms/Input';
import CheckMark from '../CheckMark';

import { formatNumber } from '../../../utils/format';
import { useCards } from '../../../contexts/cardsContext';
import { useAppSelector } from '../../../redux-store/store';
import { IReCaptchaRes } from '../../interfaces/reCaptcha';
import { ISetupIntent } from '../../../utils/hooks/useStripeSetupIntent';

// eslint-disable-next-line no-shadow
enum PaymentMethodTypes {
  PrimaryCard = 'primaryCard',
  NewCard = 'newCard',
}

interface ICheckoutForm {
  setupIntent: ISetupIntent;
  redirectUrl: string;
  amount?: number;
  showTocApply?: boolean;
  bottomCaption?: React.ReactNode;
  handlePayWithCard?: (params: {
    cardUuid?: string;
    saveCard?: boolean;
  }) => void;
}

const CheckoutForm: React.FC<ICheckoutForm> = ({
  setupIntent,
  redirectUrl,
  amount,
  showTocApply,
  bottomCaption,
  handlePayWithCard,
}) => {
  const { t } = useTranslation('modal-PaymentModal');
  const { loggedIn } = useAppSelector((state) => state.user);

  const [isStripeReady, setIsStripeReady] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    PaymentMethodTypes | undefined
  >();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const elements = useElements();
  const { cards } = useCards();
  const stripe = useStripe();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const primaryCard = useMemo(
    () => cards?.find((card) => card.isPrimary),
    [cards]
  );

  useEffect(() => {
    if (!selectedPaymentMethod && primaryCard) {
      setSelectedPaymentMethod(PaymentMethodTypes.PrimaryCard);
    }
  }, [selectedPaymentMethod, primaryCard]);

  const toggleSaveCard = useCallback(() => {
    setSaveCard((prevState) => !prevState);
  }, []);

  const handleSetEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!stripe || !elements) {
        throw new Error('Stripe initialization error');
      }

      if (!loggedIn && !email) {
        setEmailError('Email is required');
        return;
      }

      if (!executeRecaptcha) {
        throw new Error('executeRecaptcha not available');
      }

      setIsSubmitting(true);

      const recaptchaToken = await executeRecaptcha();

      if (recaptchaToken) {
        const res = await fetch('/api/post_recaptcha_query', {
          method: 'POST',
          body: JSON.stringify({
            recaptchaToken,
          }),
        });

        const jsonRes: IReCaptchaRes = await res.json();
        if (
          process.env.NEXT_PUBLIC_ENVIRONMENT === 'test' ||
          (jsonRes?.success && jsonRes?.score && jsonRes?.score > 0.5)
        ) {
          // pay with primary card
          if (
            selectedPaymentMethod === PaymentMethodTypes.PrimaryCard &&
            primaryCard
          ) {
            await handlePayWithCard?.({
              cardUuid: primaryCard.cardUuid as string,
            });

            // pay with new card
          } else if (
            selectedPaymentMethod === PaymentMethodTypes.NewCard ||
            !primaryCard
          ) {
            if (!loggedIn) {
              const { errorKey } = await setupIntent.update({
                email,
                saveCard,
              });

              if (errorKey) {
                throw new Error(t(errorKey));
              }
            }

            const { error } = await stripe.confirmSetup({
              elements,
              confirmParams: {
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/${redirectUrl}?save_card=${saveCard}`,
              },
              redirect: 'if_required',
            });

            if (!error) {
              await handlePayWithCard?.({
                saveCard,
              });
            }
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
      toast.error(err.message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentElementOptions: StripePaymentElementOptions = useMemo(
    () => ({
      terms: { card: 'never' },
    }),
    []
  );

  return (
    <SForm onSubmit={handleSubmit}>
      {/* Payment method */}
      <Text variant='subtitle'>{t('paymentMethodTitle')}</Text>
      {primaryCard && (
        <>
          <OptionCard
            handleClick={() =>
              setSelectedPaymentMethod(PaymentMethodTypes.PrimaryCard)
            }
            selected={selectedPaymentMethod === PaymentMethodTypes.PrimaryCard}
            label={`${t('primaryCard')} **** ${primaryCard.last4}`}
          />
          <OptionCard
            handleClick={() =>
              setSelectedPaymentMethod(PaymentMethodTypes.NewCard)
            }
            selected={selectedPaymentMethod === PaymentMethodTypes.NewCard}
            label={t('newCard')}
          />
        </>
      )}

      {(selectedPaymentMethod === PaymentMethodTypes.NewCard ||
        !primaryCard) && (
        <SPaymentFormWrapper isSingleForm={!primaryCard}>
          {!loggedIn && isStripeReady && (
            <SEmailInput
              id='email-input'
              value={email}
              isValid={email.length > 0 && !emailError}
              onChange={handleSetEmail}
              placeholder={t('email')}
              type='email'
              errorCaption={emailError}
            />
          )}
          <PaymentElement
            id='stripePayment'
            onReady={() => setIsStripeReady(true)}
            options={paymentElementOptions}
          />
          {/* Show save toggle only if user already has primary card otherwise card will be saved in any case */}
          {isStripeReady && primaryCard && (
            <SSaveCard>
              <CheckMark
                selected={saveCard}
                handleChange={toggleSaveCard}
                label={t('saveCard')}
                variant={2}
                size='small'
              />
            </SSaveCard>
          )}
        </SPaymentFormWrapper>
      )}

      <SPayButtonDiv>
        <SPayButton
          type='submit'
          id='pay'
          view='primaryGrad'
          disabled={primaryCard ? !selectedPaymentMethod : false}
          loading={isSubmitting}
        >
          {t('payButton')}
          {amount && ` $${formatNumber(amount / 100, amount % 1 === 0)}`}
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
    </SForm>
  );
};

export default CheckoutForm;

const SForm = styled.form`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const SPaymentFormWrapper = styled.div<{ isSingleForm: boolean }>`
  margin-top: ${({ isSingleForm }) => (isSingleForm ? '12px' : '24px')};
`;

const SSaveCard = styled.div`
  margin-top: 24px;
  padding-top: 11px;
  margin-bottom: 24px;

  border-top: 1px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 0;
  }
`;

const SEmailInput = styled(Input)`
  padding: 10.5px 20px;
  margin-bottom: 12px;
  border-color: transparent;

  &::placeholder {
    color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  }
  &:-ms-input-placeholder {
    color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  }
  &::-ms-input-placeholder {
    color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  }
`;

const SPayButtonDiv = styled.div`
  width: 100%;
  margin-top: 40px;
  margin-bottom: 24px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 24px;
    margin-bottom: 0;
  }
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
