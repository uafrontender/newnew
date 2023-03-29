import React from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
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
import { Mixpanel } from '../../../utils/mixpanel';
import DisplayName from '../../atoms/DisplayName';

const BlockUserModal = dynamic(() => import('./BlockUserModal'));

interface IBlockedUser {
  onUserBlock: () => void;
  closeModal: () => void;
  confirmBlockUser: boolean;
  isBlocked?: boolean;
  isAnnouncement?: boolean;
  user: newnewapi.IVisavisUser;
}

const BlockedUser: React.FC<IBlockedUser> = ({
  onUserBlock,
  isBlocked,
  confirmBlockUser,
  user,
  closeModal,
  isAnnouncement,
}) => {
  const { t } = useTranslation('page-Chat');

  return (
    <>
      {isBlocked && (
        <SBottomAction>
          <SBottomActionLeft>
            <SBottomActionIcon>🤐</SBottomActionIcon>
            <SBottomActionText>
              <SBottomActionTitle>
                {isAnnouncement
                  ? t('groupBlocked.title')
                  : `${t('userBlocked.title')}`}
                <DisplayName user={user.user} />
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
            onClick={() => {
              Mixpanel.track('Unblock User Button Clicked', {
                _stage: 'Direct Messages',
                _component: 'BlockedUser',
                _userUuid: user.user?.uuid,
              });

              onUserBlock();
            }}
          >
            {isAnnouncement
              ? t('groupBlocked.buttonText')
              : t('userBlocked.buttonText')}
          </SBottomActionButton>
        </SBottomAction>
      )}
      <BlockUserModal
        confirmBlockUser={confirmBlockUser}
        onUserBlock={onUserBlock}
        user={user}
        closeModal={closeModal}
        isAnnouncement={isAnnouncement}
      />
    </>
  );
};

export default BlockedUser;

BlockedUser.defaultProps = {
  isBlocked: false,
  isAnnouncement: false,
};
