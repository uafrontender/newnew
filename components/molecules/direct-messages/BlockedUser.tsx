import React, { useCallback, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';

import {
  SBottomAction,
  SBottomActionButton,
  SBottomActionIcon,
  SBottomActionLeft,
  SBottomActionMessage,
  SBottomActionText,
  SBottomActionTitle,
} from '../../atoms/direct-messages/styles';
import { Mixpanel } from '../../../utils/mixpanel';
import DisplayName from '../../atoms/DisplayName';

interface IBlockedUser {
  onUserUnblock: () => void;
  isBlocked?: boolean;
  isAnnouncement?: boolean;
  user: newnewapi.IVisavisUser;
  variant?: 'primary' | 'secondary';
}

const BlockedUser: React.FC<IBlockedUser> = ({
  onUserUnblock,
  isBlocked,
  user,
  isAnnouncement,
  variant,
}) => {
  const { t } = useTranslation('page-Chat');

  const [isLoading, setIsLoading] = useState(false);

  const unblockUser = useCallback(async () => {
    Mixpanel.track('Unblock User Button Clicked', {
      _stage: 'Direct Messages',
      _component: 'BlockedUser',
      _userUuid: user.user?.uuid,
    });
    setIsLoading(true);
    await onUserUnblock();
    setIsLoading(false);
  }, [onUserUnblock, user.user?.uuid]);

  return (
    <>
      {isBlocked && (
        <SBottomAction variant={variant}>
          <SBottomActionLeft>
            <SBottomActionIcon>🤐</SBottomActionIcon>
            <SBottomActionText>
              <SBottomActionTitle>
                {isAnnouncement
                  ? t('groupBlocked.title')
                  : `${t('userBlocked.title')}`}
                <SDisplayName user={user.user} />
              </SBottomActionTitle>
              <SBottomActionMessage>
                {isAnnouncement
                  ? t('groupBlocked.message')
                  : t('userBlocked.message')}
              </SBottomActionMessage>
            </SBottomActionText>
          </SBottomActionLeft>
          <SBottomActionButton
            withDim
            withShrink
            view='quaternary'
            onClick={unblockUser}
            loading={isLoading}
          >
            {isAnnouncement
              ? t('groupBlocked.buttonText')
              : t('userBlocked.buttonText')}
          </SBottomActionButton>
        </SBottomAction>
      )}
    </>
  );
};

export default BlockedUser;

BlockedUser.defaultProps = {
  isBlocked: false,
  isAnnouncement: false,
};

const SDisplayName = styled(DisplayName)`
  max-width: 100%;
`;
