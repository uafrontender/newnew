import { newnewapi } from 'newnew-api';
import { Trans, useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { buyCreatorsBundle } from '../../../api/endpoints/bundles';
import { useGetAppConstants } from '../../../contexts/appConstantsContext';
import { usePushNotifications } from '../../../contexts/pushNotificationsContext';
import { useAppSelector } from '../../../redux-store/store';
import { formatNumber } from '../../../utils/format';
import getCustomerPaymentFee from '../../../utils/getCustomerPaymentFee';
import getDisplayname from '../../../utils/getDisplayname';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';
import useStripeSetupIntent from '../../../utils/hooks/useStripeSetupIntent';
import { Mixpanel } from '../../../utils/mixpanel';
import { ModalType } from '../../organisms/Modal';
import PaymentModal from '../checkout/PaymentModal';
import LoadingModal from '../LoadingModal';
import BulletLine from './BulletLine';
import BundlePaymentSuccessModal from './BundlePaymentSuccessModal';

const getPayWithCardErrorMessage = (
  status?: newnewapi.BuyCreatorsBundleResponse.Status
) => {
  switch (status) {
    case newnewapi.BuyCreatorsBundleResponse.Status.NOT_ENOUGH_FUNDS:
      return 'errors.notEnoughMoney';
    case newnewapi.BuyCreatorsBundleResponse.Status.CARD_NOT_FOUND:
      return 'errors.cardNotFound';
    case newnewapi.BuyCreatorsBundleResponse.Status.CARD_CANNOT_BE_USED:
      return 'errors.cardCannotBeUsed';
    default:
      return 'errors.requestFailed';
  }
};

interface IBundlePaymentModal {
  creator: newnewapi.IUser;
  bundleOffer: newnewapi.IBundleOffer;
  successPath: string;
  modalType?: ModalType;
  additionalZ?: number;
  onClose: () => void;
  onCloseSuccessModal?: () => void;
}

const BundlePaymentModal: React.FC<IBundlePaymentModal> = ({
  creator,
  bundleOffer,
  successPath,
  modalType,
  additionalZ,
  onClose,
  onCloseSuccessModal,
}) => {
  const { t } = useTranslation('common');
  const { t: tPost } = useTranslation('page-Post');
  const { showErrorToastCustom } = useErrorToasts();
  const router = useRouter();
  const { appConstants } = useGetAppConstants();
  const user = useAppSelector((state) => state.user);
  const { promptUserWithPushNotificationsPermissionModal } =
    usePushNotifications();

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

  const buyCreatorsBundleRequest = useMemo(
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

  const successUrl = useMemo(() => {
    if (successPath.includes('?')) {
      return `${process.env.NEXT_PUBLIC_APP_URL}${successPath}&bundle=true`;
    }
    return `${process.env.NEXT_PUBLIC_APP_URL}${successPath}?bundle=true`;
  }, [successPath]);

  const setupIntent = useStripeSetupIntent({
    purpose: buyCreatorsBundleRequest,
    isGuest: !user.loggedIn,
    successUrl,
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

      Mixpanel.track('Pay With Card', {
        _component: 'BundlePaymentModal',
        _paymentMethod: cardUuid ? 'Primary card' : 'New card',
      });

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

        const res = await buyCreatorsBundle(stripeContributionRequest);

        if (
          !res.data ||
          res.error ||
          res.data.status !== newnewapi.VoteOnPostResponse.Status.SUCCESS
        ) {
          throw new Error(
            res.error?.message ??
              tPost(getPayWithCardErrorMessage(res.data?.status))
          );
        }

        setPaymentSuccessModalOpen(true);
      } catch (err: any) {
        console.error(err);
        showErrorToastCustom(err.message);
      } finally {
        setLoadingModalOpen(false);
        setupIntent.destroy();
      }
    },
    [setupIntent, router, tPost, showErrorToastCustom]
  );

  const paymentWithFeeInCents = useMemo(
    () => paymentAmountInCents + paymentFeeInCents,
    [paymentAmountInCents, paymentFeeInCents]
  );

  const daysOfAccess = bundleOffer.accessDurationInSeconds! / 60 / 60 / 24;
  const monthsOfAccess = Math.floor(daysOfAccess / 30);
  const unitOfTimeLeft = monthsOfAccess > 1 ? 'months' : 'month';

  return (
    <>
      <PaymentModal
        zIndex={additionalZ ?? 12}
        isOpen
        amount={paymentWithFeeInCents}
        setupIntent={setupIntent}
        redirectUrl='bundles'
        modalType={paymentSuccessModalOpen ? 'covered' : modalType}
        onClose={onClose}
        handlePayWithCard={handlePayWithCard}
      >
        <ModalTitle>
          {t('modal.buyBundle.payment.header', {
            creator: getDisplayname(creator),
          })}
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
      {/* Success modal */}
      {paymentSuccessModalOpen && (
        <BundlePaymentSuccessModal
          show
          modalType={modalType === 'covered' ? 'covered' : 'following'}
          zIndex={additionalZ ? additionalZ + 1 : 13}
          creator={creator}
          bundleOffer={bundleOffer}
          onClose={() => {
            setPaymentSuccessModalOpen(false);
            onClose();

            if (onCloseSuccessModal) {
              onCloseSuccessModal();
            }

            promptUserWithPushNotificationsPermissionModal();
          }}
        />
      )}
    </>
  );
};

export default BundlePaymentModal;

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
  border-color: ${({ theme }) =>
    theme.name === 'light'
      ? 'rgba(0, 21, 128, 0.1)'
      : 'rgba(255, 255, 255, 0.1)'};
  margin-bottom: 8px;
`;
