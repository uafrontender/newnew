import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { toast } from 'react-toastify';

import {
  SBottomAction,
  SBottomActionButton,
  SBottomActionIcon,
  SBottomActionLeft,
  SBottomActionMessage,
  SBottomActionText,
  SBottomActionTitle,
} from '../../atoms/chat/styles';
import Text from '../../atoms/Text';

import { useAppSelector } from '../../../redux-store/store';
import { subscribeToCreator } from '../../../api/endpoints/subscription';
import { createStripeSetupIntent } from '../../../api/endpoints/payments';

const PaymentModal = dynamic(() => import('../checkout/PaymentModal'));
const LoadingModal = dynamic(() => import('../LoadingModal'));

interface ISubscriptionExpired {
  user: newnewapi.IUser;
  saveCardFromRedirect?: boolean;
  setupIntentClientSecretFromRedirect?: string;
  resetSetSetupIntent: () => void;
}

const SubscriptionExpired: React.FC<ISubscriptionExpired> = React.memo(
  ({
    user,
    saveCardFromRedirect,
    setupIntentClientSecretFromRedirect,
    resetSetSetupIntent,
  }) => {
    const router = useRouter();
    const { t } = useTranslation('page-Chat');
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);

    const [loadingModalOpen, setLoadingModalOpen] = useState(false);

    useEffect(() => {
      const subscribeToCreatorAfterStripeRedirect = async () => {
        if (!setupIntentClientSecretFromRedirect || loadingModalOpen) return;

        try {
          setLoadingModalOpen(true);

          const stripeContributionRequest =
            new newnewapi.StripeContributionRequest({
              stripeSetupIntentClientSecret:
                setupIntentClientSecretFromRedirect,
              ...(saveCardFromRedirect !== undefined
                ? {
                    saveCard: saveCardFromRedirect,
                  }
                : {}),
            });

          resetSetSetupIntent();

          const res = await subscribeToCreator(stripeContributionRequest);

          if (!res.data || res.error) {
            throw new Error(res.error?.message ?? 'Request failed');
          }

          if (
            res.data?.status ===
            newnewapi.SubscribeToCreatorResponse.Status.ALREADY_SUBSCRIBED
          ) {
            router.push(`/direct-messages/${user.username}`);
          }

          if (
            res.data.status ===
            newnewapi.SubscribeToCreatorResponse.Status.SUCCESS
          ) {
            router.push(
              `${process.env.NEXT_PUBLIC_APP_URL}/subscription-success?userId=${user.uuid}&username=${user.username}&`
            );
          }

          setLoadingModalOpen(false);
        } catch (err: any) {
          console.error(err);
          toast.error(err.message);

          setLoadingModalOpen(false);
        }
      };

      if (setupIntentClientSecretFromRedirect && !loadingModalOpen) {
        subscribeToCreatorAfterStripeRedirect();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const createSetupIntent = useCallback(async () => {
      try {
        const payload = new newnewapi.CreateStripeSetupIntentRequest({
          subscribeToCreatorUuid: user.uuid,
        });
        const response = await createStripeSetupIntent(payload);

        if (
          !response.data ||
          response.error ||
          !response.data?.stripeSetupIntentClientSecret
        ) {
          throw new Error(response.error?.message || 'Some error occurred');
        }

        return response.data;
      } catch (err) {
        console.error(err);
        return undefined;
      }
    }, [user.uuid]);

    const handlePayWithCard = async ({
      stripeSetupIntentClientSecret,
      cardUuid,
      saveCard,
    }: {
      cardUuid?: string;
      stripeSetupIntentClientSecret: string;
      saveCard?: boolean;
    }) => {
      try {
        const stripeContributionRequest =
          new newnewapi.StripeContributionRequest({
            cardUuid,
            ...(!cardUuid ? { stripeSetupIntentClientSecret } : {}),
            ...(saveCard !== undefined
              ? {
                  saveCard,
                }
              : {}),
          });

        const res = await subscribeToCreator(stripeContributionRequest);

        if (!res.data || res.error) {
          throw new Error(res.error?.message ?? 'Request failed');
        }

        if (
          res.data.status ===
          newnewapi.SubscribeToCreatorResponse.Status.SUCCESS
        ) {
          router.push(
            `${process.env.NEXT_PUBLIC_APP_URL}/subscription-success?userId=${user.uuid}&username=${user.username}&`
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <SBottomActionContainer>
        <SBottomActionLeft>
          <SBottomActionIcon>🙊</SBottomActionIcon>
          <SBottomActionText>
            <SBottomActionTitle>
              {t('subscriptionExpired.title')}
            </SBottomActionTitle>
            <SBottomActionMessage>
              {t('subscriptionExpired.message')}
            </SBottomActionMessage>
          </SBottomActionText>
        </SBottomActionLeft>
        <SBottomActionButton
          withDim
          withShrink
          view='primaryGrad'
          onClick={() => {
            setPaymentModalOpen(true);
          }}
        >
          {t('subscriptionExpired.buttonText')}
        </SBottomActionButton>

        <PaymentModal
          // predefinedOption='card'
          isOpen={paymentModalOpen}
          zIndex={10}
          showTocApply
          onClose={() => setPaymentModalOpen(false)}
          handlePayWithCard={handlePayWithCard}
          redirectUrl={`/direct-messages/${user.username}`}
          createStripeSetupIntent={createSetupIntent}
        >
          <div>
            <SPaymentModalTitle variant={3}>
              {t('modal.renewSubscriptionsSubtitle')}
            </SPaymentModalTitle>
            <SPaymentModalCreatorInfo>
              {user.avatarUrl && (
                <SAvatar>
                  <img
                    src={user.avatarUrl}
                    alt={user.nickname ? user.nickname : `@${user.username}`}
                  />
                </SAvatar>
              )}
              <div>
                <SCreatorUsername>
                  {isMobile ? user.nickname : `@${user.username}`}
                </SCreatorUsername>
              </div>
            </SPaymentModalCreatorInfo>
          </div>
        </PaymentModal>
        {/* Loading Modal */}
        {loadingModalOpen && (
          <LoadingModal isOpen={loadingModalOpen} zIndex={14} />
        )}
      </SBottomActionContainer>
    );
  }
);

export default SubscriptionExpired;

const SBottomActionContainer = styled(SBottomAction)`
  margin-bottom: 16px;
`;

const SPaymentModalTitle = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};

  text-align: center;
  margin-bottom: 12px;

  ${({ theme }) => theme.media.tablet} {
    text-align: left;
    margin-bottom: 6px;
  }
`;

const SPaymentModalCreatorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  justify-content: center;
  flex-direction: column;
  text-align: center;

  ${({ theme }) => theme.media.tablet} {
    text-align: initial;
    flex-direction: row;
    justify-content: flex-start;
  }
`;

const SAvatar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  overflow: hidden;
  position: relative;

  grid-area: avatar;
  justify-self: left;

  width: 84px;
  height: 84px;
  border-radius: 50%;

  img {
    display: block;
    width: 84px;
    height: 84px;
  }

  ${({ theme }) => theme.media.tablet} {
    width: 36px;
    height: 36px;
    border-radius: 50%;

    img {
      display: block;
      width: 36px;
      height: 36px;
    }
  }
`;

const SCreatorUsername = styled.span`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`;
