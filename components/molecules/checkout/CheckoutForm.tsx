import React, { useState, useMemo, useContext } from 'react';
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
import { newnewapi } from 'newnew-api';

import Button from '../../atoms/Button';
import Text from '../../atoms/Text';
import Toggle from '../../atoms/Toggle';
import OptionCard from './OptionCard';
import Input from '../../atoms/Input';

import { formatNumber } from '../../../utils/format';
import { useCards } from '../../../contexts/cardsContext';
import { useAppSelector } from '../../../redux-store/store';
import { updateStripeSetupIntent } from '../../../api/endpoints/payments';
import { RewardContext } from '../../../contexts/rewardContext';
import assets from '../../../constants/assets';

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
  handlePayWithCard?: (params: {
    rewardAmount: number;
    stripeSetupIntentClientSecret: string;
    cardUuid?: string;
    saveCard?: boolean;
  }) => void;
  stipeSecret: string;
  redirectUrl: string;
  noRewards?: boolean;
}

const CheckoutForm: React.FC<ICheckoutForm> = ({
  handlePayWithCard,
  amount,
  showTocApply,
  bottomCaption,
  stipeSecret,
  redirectUrl,
  noRewards,
}) => {
  const { t } = useTranslation('modal-PaymentModal');
  const elements = useElements();
  const stripe = useStripe();

  const { loggedIn } = useAppSelector((state) => state.user);

  const [isStripeReady, setIsStripeReady] = useState(false);

  const { cards } = useCards();

  const primaryCard = useMemo(
    () => cards?.find((card) => card.isPrimary),
    [cards]
  );

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    PaymentMethodTypes | undefined
  >();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [saveCard, setSaveCard] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { rewardBalance, isRewardBalanceLoading } = useContext(RewardContext);
  const [useRewards, setUseRewards] = useState(false);

  const rewardUsed =
    useRewards && rewardBalance?.usdCents && amount
      ? Math.min(rewardBalance.usdCents, amount)
      : 0;

  const handleSetEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const { executeRecaptcha } = useGoogleReCaptcha();

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
          if (
            selectedPaymentMethod === PaymentMethodTypes.PrimaryCard &&
            primaryCard
          ) {
            handlePayWithCard?.({
              rewardAmount: rewardUsed,
              cardUuid: primaryCard.cardUuid as string,
              stripeSetupIntentClientSecret: stipeSecret,
            });
          } else if (
            selectedPaymentMethod === PaymentMethodTypes.NewCard ||
            !primaryCard
          ) {
            if (!loggedIn) {
              const updateStripeSetupIntentRequest =
                new newnewapi.UpdateStripeSetupIntentRequest({
                  stripeSetupIntentClientSecret: stipeSecret,
                  guestEmail: email,
                  saveCard,
                });

              await updateStripeSetupIntent(updateStripeSetupIntentRequest);
            }

            const { error } = await stripe.confirmSetup({
              elements,
              confirmParams: {
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/${redirectUrl}?save_card=${saveCard}`,
              },
              redirect: 'if_required',
            });

            if (error) {
              toast.error(error.message);

              throw new Error(error.message);
            }

            handlePayWithCard?.({
              rewardAmount: rewardUsed,
              stripeSetupIntentClientSecret: stipeSecret,
              saveCard,
              ...(!loggedIn ? { email } : {}),
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {primaryCard && (
        <>
          <OptionCard
            handleClick={() =>
              setSelectedPaymentMethod(PaymentMethodTypes.PrimaryCard)
            }
            selected={selectedPaymentMethod === PaymentMethodTypes.PrimaryCard}
            label={`Primary card **** ${primaryCard.last4}`}
          />
          <OptionCard
            handleClick={() =>
              setSelectedPaymentMethod(PaymentMethodTypes.NewCard)
            }
            selected={selectedPaymentMethod === PaymentMethodTypes.NewCard}
            label='New card'
          />
        </>
      )}

      {(selectedPaymentMethod === PaymentMethodTypes.NewCard ||
        !primaryCard) && (
        <SPaymentFormWrapper>
          {!loggedIn && isStripeReady && (
            <Input
              value={email}
              isValid={email.length > 0 && !emailError}
              onChange={handleSetEmail}
              placeholder={t('email')}
              type='email'
              errorCaption={emailError}
            />
          )}
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
      {!noRewards && (
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

const RewardContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid;
  border-color: ${({ theme }) => theme.colorsThemed.text.primary};
  border-radius: 24px;
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
  ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  margin-right: 20px;
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
