import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
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

const PaymentModal = dynamic(() => import('../checkout/PaymentModal'));

interface ISubscriptionExpired {
  user: newnewapi.IUser;
}

const SubscriptionExpired: React.FC<ISubscriptionExpired> = React.memo(
  ({ user }) => {
    const { t } = useTranslation('chat');
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);

    const handlePayWithCard = async () => {
      try {
        const payload = new newnewapi.SubscribeToCreatorRequest({
          creatorUuid: user.uuid,
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription-success?userId=${user.uuid}&`,
          cancelUrl: window.location.href,
        });

        const res = await subscribeToCreator(payload);

        if (!res.data?.checkoutUrl || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        const url = res.data.checkoutUrl;
        if (url) window.location.href = url;
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <SBottomAction>
        <SBottomActionLeft>
          <SBottomActionIcon>🙊</SBottomActionIcon>
          <SBottomActionText>
            <SBottomActionTitle>
              {t('subscription-expired.title')}
            </SBottomActionTitle>
            <SBottomActionMessage>
              {t('subscription-expired.message')}
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
          {t('subscription-expired.button-text')}
        </SBottomActionButton>

        <PaymentModal
          predefinedOption='card'
          isOpen={paymentModalOpen}
          zIndex={10}
          showTocApply
          onClose={() => setPaymentModalOpen(false)}
          handlePayWithCardStripeRedirect={handlePayWithCard}
        >
          <div>
            <SPaymentModalTitle variant={3}>
              {t('modal.renewSubcriptionsSubtitle')}
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
      </SBottomAction>
    );
  }
);

export default SubscriptionExpired;

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
