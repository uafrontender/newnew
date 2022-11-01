import { newnewapi } from 'newnew-api';
import { Trans, useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { buyCreatorsBundles } from '../../../api/endpoints/bundles';
import { useGetAppConstants } from '../../../contexts/appConstantsContext';
import { useAppSelector } from '../../../redux-store/store';
import { formatNumber } from '../../../utils/format';
import getCustomerPaymentFee from '../../../utils/getCustomerPaymentFee';
import getDisplayname from '../../../utils/getDisplayname';
import useStripeSetupIntent from '../../../utils/hooks/useStripeSetupIntent';
import { Mixpanel } from '../../../utils/mixpanel';
import Text from '../../atoms/Text';
import PaymentModal from '../checkout/PaymentModal';
import LoadingModal from '../LoadingModal';
import BulletLine from './BulletLine';
import BundlePaymentSuccessModal from './BundlePaymentSuccessModal';

interface IBundlePaymentModal {
  creator: newnewapi.IUser;
  bundleOffer: newnewapi.IBundleOffer;
  onClose: () => void;
  onCloseSuccessModal?: () => void;
}

const BundlePaymentModal: React.FC<IBundlePaymentModal> = ({
  creator,
  bundleOffer,
  onClose,
  onCloseSuccessModal,
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { appConstants } = useGetAppConstants();
  const user = useAppSelector((state) => state.user);

  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [paymentSuccessModalOpen, setPaymentSuccessModalOpen] = useState(false);

  const paymentAmountInCents = useMemo(
    () => bundleOffer.price!.usdCents!,
    [bundleOffer]
  );

  const paymentFeeInCents = useMemo(
    () =>
      getCustomerPaymentFee(
        paymentAmountInCents,
        parseFloat(appConstants.customerFee)
      ),
    [paymentAmountInCents, appConstants.customerFee]
  );

  const voteOnPostRequest = useMemo(
    () =>
      new newnewapi.BuyCreatorsBundle({
        creatorUuid: creator.uuid,
        bundleUuid: bundleOffer.bundleUuid,
        amount: bundleOffer.price,
        customerFee: new newnewapi.MoneyAmount({
          usdCents: paymentFeeInCents,
        }),
      }),
    [creator, bundleOffer, paymentFeeInCents]
  );

  // TODO: Fix setup intent
  const setupIntent = useStripeSetupIntent({
    purpose: voteOnPostRequest,
    isGuest: !user.loggedIn,
    // TODO: Fix redirect
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/bundles`,
  });

  const handlePayWithCard = useCallback(
    async ({
      cardUuid,
      saveCard,
    }: {
      cardUuid?: string;
      saveCard?: boolean;
    }) => {
      setLoadingModalOpen(true);

      if (setupIntent.isGuest) {
        router.push(
          `${process.env.NEXT_PUBLIC_APP_URL}/sign-up-payment?stripe_setup_intent_client_secret=${setupIntent.setupIntentClientSecret}`
        );
        return;
      }

      Mixpanel.track('Buy bundle click');

      try {
        const stripeContributionRequest =
          new newnewapi.StripeContributionRequest({
            cardUuid,
            stripeSetupIntentClientSecret: setupIntent.setupIntentClientSecret,
            ...(saveCard !== undefined
              ? {
                  saveCard,
                }
              : {}),
          });

        const res = await buyCreatorsBundles(stripeContributionRequest);

        if (
          !res.data ||
          res.error ||
          res.data.status !== newnewapi.VoteOnPostResponse.Status.SUCCESS
        ) {
          throw new Error(
            res.error?.message ?? t('modal.buyBundle.error.requestFailed')
          );
        }

        setPaymentSuccessModalOpen(true);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message);
      } finally {
        setLoadingModalOpen(false);
        setupIntent.destroy();
      }
    },
    [setupIntent, router, t, setPaymentSuccessModalOpen]
  );

  const paymentWithFeeInCents = useMemo(
    () => paymentAmountInCents + paymentFeeInCents,
    [paymentAmountInCents, paymentFeeInCents]
  );

  const daysOfAccess = bundleOffer.accessDurationInSeconds! / 60 / 60 / 24;
  const monthsOfAccess = Math.floor(daysOfAccess / 30);
  const unitOfTimeLeft = monthsOfAccess > 1 ? 'months' : 'month';

  // TODO: Handle redirect
  return (
    <>
      <PaymentModal
        zIndex={12}
        isOpen
        amount={paymentWithFeeInCents}
        setupIntent={setupIntent}
        redirectUrl='bundles'
        onClose={onClose}
        handlePayWithCard={handlePayWithCard}
        bottomCaption={
          (!appConstants.minHoldAmount?.usdCents ||
            paymentWithFeeInCents > appConstants.minHoldAmount?.usdCents) && (
            <SPaymentSign variant='subtitle'>
              {t('modal.buyBundle.paymentModalFooter.body', {
                creator: getDisplayname(creator),
              })}
              *
              <Link href='https://terms.newnew.co'>
                <SPaymentTermsLink
                  href='https://terms.newnew.co'
                  target='_blank'
                >
                  {t('modal.buyBundle.paymentModalFooter.terms')}
                </SPaymentTermsLink>
              </Link>{' '}
              {t('modal.buyBundle.paymentModalFooter.apply')}
            </SPaymentSign>
          )
        }
      >
        <ModalTitle>
          {t('modal.buyBundle.payment.header', { creator: creator.username })}
        </ModalTitle>
        <SVotesNumber>
          <Trans
            t={t}
            i18nKey='modal.buyBundle.votes'
            // @ts-ignore
            components={[
              <VotesNumberSpan />,
              { amount: formatNumber(bundleOffer.votesAmount as number, true) },
            ]}
          />
        </SVotesNumber>
        <AccessDescription>
          {t('modal.buyBundle.access', {
            amount: monthsOfAccess,
            unit: t(`modal.buyBundle.unit.${unitOfTimeLeft}`),
          })}
        </AccessDescription>
        <BundleFeatures>
          <BulletLine>{t('modal.buyBundle.customOptions')}</BulletLine>
          <BulletLine>{t('modal.buyBundle.chat')}</BulletLine>
        </BundleFeatures>
      </PaymentModal>
      {/* Loading Modal */}
      <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
      {/* TODO: Add success modal */}
      {paymentSuccessModalOpen && (
        <BundlePaymentSuccessModal
          show
          zIndex={13}
          creator={creator}
          bundleOffer={bundleOffer}
          onClose={() => {
            setPaymentSuccessModalOpen(false);
            onClose();

            if (onCloseSuccessModal) {
              onCloseSuccessModal();
            }
          }}
        />
      )}
    </>
  );
};

export default BundlePaymentModal;

const SPaymentSign = styled(Text)`
  margin-top: 24px;

  text-align: center;
  white-space: pre-wrap;
  word-break: break-word;
`;

const SPaymentTermsLink = styled.a`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
`;

const ModalTitle = styled.h4`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  font-size: 12px;
  line-height: 16px;

  margin-top: 16px;
  margin-bottom: 16px;
`;

const SVotesNumber = styled.p`
  font-weight: 700;
  color: ${({ theme }) => theme.colorsThemed.text.primary};

  font-size: 32px;
  line-height: 40px;

  margin-bottom: 10px;

  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const VotesNumberSpan = styled.span`
  color: ${({ theme }) =>
    theme.name === 'light'
      ? theme.colorsThemed.text.primary
      : theme.colorsThemed.accent.yellow};
`;

const AccessDescription = styled.p`
  font-weight: 600;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  font-size: 14px;
  line-height: 20px;

  margin-bottom: 12px;
`;

const BundleFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid;
  border-color: rgba(255, 255, 255, 0.1);
  margin-bottom: 8px;
`;
