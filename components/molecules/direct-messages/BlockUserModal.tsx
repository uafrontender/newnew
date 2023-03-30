import React from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';

import { useGetBlockedUsers } from '../../../contexts/blockedUsersContext';

import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import { Mixpanel } from '../../../utils/mixpanel';
import DisplayName from '../../atoms/DisplayName';

interface IBlockUserModal {
  user: newnewapi.IVisavisUser;
  confirmBlockUser: boolean;
  onUserBlock?: () => void;
  closeModal: () => void;
  isAnnouncement?: boolean;
}

const BlockUserModal: React.FC<IBlockUserModal> = ({
  confirmBlockUser,
  onUserBlock,
  user,
  closeModal,
  isAnnouncement,
}) => {
  const { t } = useTranslation('page-Chat');

  const { changeUserBlockedStatus } = useGetBlockedUsers();

  const handleConfirmClick = () => {
    Mixpanel.track('Confirm Block User Button Clicked', {
      _stage: 'Direct Messages',
      _component: 'BlockUserModal',
      _userUuid: user.user?.uuid,
    });
    changeUserBlockedStatus(user.user?.uuid, true);
    onUserBlock?.();
    closeModal();
  };
  return (
    <Modal show={confirmBlockUser} onClose={closeModal} additionalz={1000}>
      <SContainer>
        <SModal>
          <SModalTitle>
            {isAnnouncement ? (
              t('modal.blockGroup.title')
            ) : (
              <>
                {t('modal.blockUser.title')} <DisplayName user={user.user} />
              </>
            )}
          </SModalTitle>
          <SModalMessage>
            {t('modal.blockUser.messageFirstPart')}
            <DisplayName user={user.user} />{' '}
            {t('modal.blockUser.messageSecondPart')}
          </SModalMessage>
          <SModalButtons>
            <SCancelButton view='secondary' onClick={closeModal}>
              {t('modal.blockUser.button.cancel')}
            </SCancelButton>
            <SConfirmButton view='danger' onClick={handleConfirmClick}>
              {isAnnouncement
                ? t('modal.blockGroup.button.confirm')
                : t('modal.blockUser.button.confirm')}
            </SConfirmButton>
          </SModalButtons>
        </SModal>
      </SContainer>
    </Modal>
  );
};

BlockUserModal.defaultProps = {
  isAnnouncement: false,
  onUserBlock: () => {},
};

export default BlockUserModal;

const SContainer = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const SModal = styled.div`
  max-width: 480px;
  width: 100%;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.secondary};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  line-height: 24px;
`;

const SModalTitle = styled.strong`
  display: inline-flex;
  white-space: pre;
  font-size: 20px;
  margin-bottom: 16px;
`;

const SModalMessage = styled.p`
  display: inline-flex;
  white-space: pre;
  flex-flow: wrap;
  font-size: 16px;
  margin-bottom: 24px;
`;

const SModalButtons = styled.div`
  display: flex;
`;

const SCancelButton = styled(Button)`
  padding: 12px 24px;
  line-height: 24px;
  font-size: 14px;
  margin-right: auto;
  flex-shrink: 0;
`;

const SConfirmButton = styled(Button)`
  padding: 12px 24px;
  line-height: 24px;
  font-size: 14px;
  margin-left: auto;
  flex-shrink: 0;
`;
