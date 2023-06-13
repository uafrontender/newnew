import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import styled from 'styled-components';
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { StripePaymentElementOptions } from '@stripe/stripe-js';
import { useRouter } from 'next/router';

import Button from '../../atoms/Button';
import Text from '../../atoms/Text';
import OptionCard from './OptionCard';
import Input from '../../atoms/Input';
import CheckMark from '../CheckMark';
import ReCaptchaV2 from '../../atoms/ReCaptchaV2';

import { formatNumber } from '../../../utils/format';
import useCards from '../../../utils/hooks/useCards';
import { useAppSelector } from '../../../redux-store/store';
import { ISetupIntent } from '../../../utils/hooks/useStripeSetupIntent';
import useRecaptcha from '../../../utils/hooks/useRecaptcha';
import { useGetAppConstants } from '../../../contexts/appConstantsContext';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';

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
  const { showErrorToastCustom, showErrorToastPredefined } = useErrorToasts();
  const { userData } = useAppSelector((state) => state.user);
  const { userLoggedIn } = useAppState();
  const { appConstants } = useGetAppConstants();
  const router = useRouter();

  const [isStripeReady, setIsStripeReady] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    PaymentMethodTypes | undefined
  >();
  const [saveCard, setSaveCard] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const elements = useElements();
  const { primaryCard } = useCards();
  const stripe = useStripe();

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

  const handleSubmit = async () => {
    try {
      if (!stripe || !elements) {
        throw new Error('Stripe initialization error');
      }

      if (!userLoggedIn && !email) {
        setEmailError(t('errorCaptions.emailRequired'));
        return;
      }

      // pay with primary card
      if (
        (selectedPaymentMethod === PaymentMethodTypes.PrimaryCard &&
          primaryCard) ||
        userData?.options?.isWhiteListed
      ) {
        await handlePayWithCard?.({
          cardUuid: primaryCard!!.cardUuid as string,
        });

        // pay with new card
      } else if (
        selectedPaymentMethod === PaymentMethodTypes.NewCard ||
        !primaryCard
      ) {
        if (!userLoggedIn) {
          const { errorKey } = await setupIntent.update({
            email,
            saveCard,
          });

          if (errorKey) {
            throw new Error(t(errorKey as any));
          }
        }

        const { error } = await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/${
              router.locale !== 'en-US' ? `${router.locale}/` : ''
            }${redirectUrl}?save_card=${saveCard}`,
          },
          redirect: 'if_required',
        });

        if (error) {
          throw error;
        }

        await handlePayWithCard?.({
          saveCard,
        });
      }
    } catch (err: any) {
      if ((err.type && err.type === 'card_error') || !err.type) {
        showErrorToastCustom(err.message);
      }
      console.error(err, 'err');
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
  }, [recaptchaErrorMessage, showErrorToastPredefined]);

  const paymentElementOptions: StripePaymentElementOptions = useMemo(
    () => ({
      terms: { card: 'never' },
      wallets: {
        googlePay: 'never',
        applePay: 'never',
      },
    }),
    []
  );

  useEffect(() => {
    // fix recaptcha challenge overlay issue
    if (isRecaptchaV2Required) {
      document.body.style.top = '0';
    }
  }, [isRecaptchaV2Required]);

  return (
    <SForm
      id='checkout-form'
      onSubmitCapture={() => {
        Mixpanel.track('Submit Checkout Form', {
          _stage: 'Payment',
          _component: 'CheckoutForm',
        });
      }}
      onSubmit={(e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (userData?.options?.isWhiteListed) {
          handleSubmit();
        } else {
          submitWithRecaptchaProtection();
        }
      }}
    >
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
            id='new-card'
            handleClick={
              !userData?.options?.isWhiteListed
                ? () => setSelectedPaymentMethod(PaymentMethodTypes.NewCard)
                : () => {}
            }
            selected={selectedPaymentMethod === PaymentMethodTypes.NewCard}
            label={t('newCard')}
          />
        </>
      )}

      {(selectedPaymentMethod === PaymentMethodTypes.NewCard ||
        !primaryCard) && (
        <SPaymentFormWrapper isSingleForm={!primaryCard}>
          {!userLoggedIn && isStripeReady && (
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

      {isRecaptchaV2Required && (
        <SReCaptchaV2 onChange={onChangeRecaptchaV2} ref={recaptchaRef} />
      )}

      <SPayButtonDiv>
        <SPayButton
          type='submit'
          id='pay'
          view='primaryGrad'
          disabled={
            primaryCard ? !selectedPaymentMethod || isSubmitting : isSubmitting
          }
          loading={isSubmitting}
        >
          {t('payButton')}
          {amount && ` $${formatNumber(amount / 100, amount % 1 === 0)}`}
        </SPayButton>
        <SFeeHint variant='subtitle'>{`${t('processingFee')}: ${(
          parseFloat(appConstants.customerFee) * 100
        ).toFixed(2)}%`}</SFeeHint>
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
  margin-bottom: 12px;

  input {
    padding: 10.5px 20px;

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
  }
`;

const SReCaptchaV2 = styled(ReCaptchaV2)`
  margin-top: 20px;
  z-index: 20;
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

const SFeeHint = styled(Text)`
  margin-top: 8px;
  text-align: center;
  text-transform: capitalize;
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
