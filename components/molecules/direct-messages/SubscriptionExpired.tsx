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
} from '../../atoms/direct-messages/styles';
import DisplayName from '../../atoms/DisplayName';

const BuyBundleModal = dynamic(() => import('../bundles/BuyBundleModal'));

interface ISubscriptionExpired {
  user: newnewapi.IUser;
  myRole: newnewapi.ChatRoom.MyRole;
  variant?: 'primary' | 'secondary';
  onRenewal: () => void;
}

const SubscriptionExpired: React.FC<ISubscriptionExpired> = React.memo(
  ({ user, myRole, variant, onRenewal }) => {
    const { t } = useTranslation('page-Chat');
    const [buyBundleModalOpen, setBuyBundleModalOpen] = useState(false);

    return (
      <>
        <SBottomActionContainer variant={variant}>
          <SBottomActionLeft>
            <SBottomActionIcon>🙊</SBottomActionIcon>
            <SBottomActionText>
              <SBottomActionTitle>
                {t('subscriptionExpired.title')}
              </SBottomActionTitle>
              {myRole === 1 && user.options?.isOfferingBundles && (
                <SBottomActionMessage>
                  <SMessageWrap>
                    {t('subscriptionExpired.message')}
                  </SMessageWrap>
                  <SDisplayName user={user} />
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
          modalType='initial'
          creator={user}
          // Only authorized user can prolong a subscription so success path is irrelevant
          successPath='/bundles'
          onClose={() => {
            setBuyBundleModalOpen(false);
          }}
          onSuccess={onRenewal}
        />
      </>
    );
  }
);

export default SubscriptionExpired;

const SBottomActionContainer = styled(SBottomAction)`
  /* margin-bottom: 16px; */
`;

const SMessageWrap = styled.span`
  white-space: pre-wrap;

  ${({ theme }) => theme.media.tablet} {
    white-space: pre;
  }
`;

const SDisplayName = styled(DisplayName)`
  max-width: 100%;
`;
