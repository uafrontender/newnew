import React, { useState } from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import dynamic from 'next/dynamic';

import {
  SBottomAction,
  SBottomActionButton,
  SBottomActionIcon,
  SBottomActionLeft,
  SBottomActionMessage,
  SBottomActionText,
  SBottomActionTitle,
} from '../../atoms/chat/styles';

import getDisplayname from '../../../utils/getDisplayname';

const BuyBundleModal = dynamic(() => import('../bundles/BuyBundleModal'));

interface ISubscriptionExpired {
  user: newnewapi.IUser;
  myRole: newnewapi.ChatRoom.MyRole;
}

const SubscriptionExpired: React.FC<ISubscriptionExpired> = React.memo(
  ({ user, myRole }) => {
    const { t } = useTranslation('page-Chat');
    const [buyBundleModalOpen, setBuyBundleModalOpen] = useState(false);
    return (
      <>
        <SBottomActionContainer>
          <SBottomActionLeft>
            <SBottomActionIcon>🙊</SBottomActionIcon>
            <SBottomActionText>
              <SBottomActionTitle>
                {t('subscriptionExpired.title')}
              </SBottomActionTitle>
              {myRole === 1 && user.options?.isOfferingBundles && (
                <SBottomActionMessage>
                  {t('subscriptionExpired.message')} {getDisplayname(user)}
                </SBottomActionMessage>
              )}
            </SBottomActionText>
          </SBottomActionLeft>
          {myRole === 1 && user.options?.isOfferingBundles && (
            <SBottomActionButton
              withDim
              withShrink
              view='primaryGrad'
              onClick={() => {
                setBuyBundleModalOpen(true);
              }}
            >
              {t('subscriptionExpired.buttonText')}
            </SBottomActionButton>
          )}
        </SBottomActionContainer>
        <BuyBundleModal
          show={buyBundleModalOpen}
          creator={user}
          onClose={() => {
            setBuyBundleModalOpen(false);
          }}
        />
      </>
    );
  }
);

export default SubscriptionExpired;

const SBottomActionContainer = styled(SBottomAction)`
  margin-bottom: 16px;
`;
