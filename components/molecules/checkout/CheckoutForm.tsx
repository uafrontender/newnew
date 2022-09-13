import React, {
  useState,
  useMemo,
  useContext,
  useEffect,
  useCallback,
} from 'react';
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
import Toggle from '../../atoms/Toggle';
import OptionCard from './OptionCard';
import Input from '../../atoms/Input';
import CheckMark from '../CheckMark';

import { formatNumber } from '../../../utils/format';
import { useCards } from '../../../contexts/cardsContext';
import { useAppSelector } from '../../../redux-store/store';
import { RewardContext } from '../../../contexts/rewardContext';
import assets from '../../../constants/assets';
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
  noRewards?: boolean;
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
  noRewards,
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
  const [useRewards, setUseRewards] = useState(false);

  const { rewardBalance, isRewardBalanceLoading } = useContext(RewardContext);
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

  const rewardUsed =
    useRewards && rewardBalance?.usdCents && amount
      ? Math.min(rewardBalance.usdCents, amount)
      : 0;

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

        if (jsonRes?.success && jsonRes?.score && jsonRes?.score > 0.5) {
          // save used rewards amount
          if (rewardUsed > 0) {
            const { errorKey } = await setupIntent.update({
              ...(rewardUsed > 0 ? { rewardAmount: rewardUsed } : {}),
            });

            if (errorKey) {
              throw new Error(t(errorKey));
            }
          }

          // pay with rewards amount only
          if (amount && rewardUsed >= amount && primaryCard) {
            await handlePayWithCard?.({
              cardUuid: primaryCard.cardUuid as string,
            });
            return;
          }

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

            if (error) {
              throw new Error(error.message);
            }

            await handlePayWithCard?.({
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
      toast.error(err.message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentElementOptions: StripePaymentElementOptions = useMemo(
    () => ({ terms: { card: 'never' } }),
    []
  );

  return (
    <SForm onSubmit={handleSubmit}>
      {/* Rewards */}
      {!noRewards && !!rewardBalance?.usdCents && (
        <RewardContainer>
          <RewardImage src={assets.decision.gold} alt='reward balance' />
          <RewardText>{t('rewardsText')}</RewardText>
          <RewardBalance>
            $
            {rewardBalance?.usdCents
              ? Math.round(rewardBalance.usdCents / 100)
              : 0}
          </RewardBalance>
          <Toggle
            checked={useRewards}
            disabled={isRewardBalanceLoading}
            onChange={() => {
              setUseRewards((curr) => !curr);
            }}
          />
        </RewardContainer>
      )}

      {/* Payment method */}
      {!(amount && rewardUsed >= amount && primaryCard) && (
        <>
          <Text variant='subtitle'>{t('paymentMethodTitle')}</Text>
          {primaryCard && (
            <>
              <OptionCard
                handleClick={() =>
                  setSelectedPaymentMethod(PaymentMethodTypes.PrimaryCard)
                }
                selected={
                  selectedPaymentMethod === PaymentMethodTypes.PrimaryCard
                }
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
                  value={email}
                  isValid={email.length > 0 && !emailError}
                  onChange={handleSetEmail}
                  placeholder={t('email')}
                  type='email'
                  errorCaption={emailError}
                />
              )}
              <PaymentElement
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
        </>
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
          {amount &&
            ` $${formatNumber(
              Math.max(amount - rewardUsed, 0) / 100,
              amount % 1 === 0
            )}`}
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

const RewardContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid;
  border-color: ${({ theme }) => theme.colorsThemed.text.primary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  height: 78px;
  margin-bottom: 16px;
  padding-left: 16px;
  padding-right: 18px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 24px;
    padding-left: 20px;
    padding-right: 30px;
  }
`;

const RewardImage = styled.img`
  height: 40px;
  width: 40px;
  margin-right: 16px;
  object-fit: cover;
`;

const RewardText = styled.div`
  ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  margin-right: 8px;
  flex-grow: 1;
`;

const RewardBalance = styled.div`
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  margin-right: 20px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
`;

const SPayButtonDiv = styled.div`
  width: 100%;
  margin-top: auto;
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
