import React from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { markUser } from '../../../api/endpoints/user';
import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import { getBlockedUsers } from '../../../contexts/blockedUsersContext';

interface IBlockUserModal {
  user: newnewapi.IUser;
  confirmBlockUser: boolean;
  onUserBlock: () => void;
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
  const { t } = useTranslation('chat');

  const { blockUser } = getBlockedUsers();

  async function blockUserRequest() {
    try {
      const payload = new newnewapi.MarkUserRequest({
        markAs: 3,
        userUuid: user.uuid,
      });
      const res = await markUser(payload);
      if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');
      blockUser(user.uuid!!);
      onUserBlock();
    } catch (err) {
      console.error(err);
    }
  }
  const handleConfirmClick = () => {
    blockUserRequest();
  };
  return (
    <Modal show={confirmBlockUser} onClose={closeModal}>
      <SContainer>
        <SModal>
          <SModalTitle>{isAnnouncement ? t('modal.block-group.title') : t('modal.block-user.title')}</SModalTitle>
          <SModalMessage>
            {t('modal.block-user.message-first-part')} {user.nickname} {t('modal.block-user.message-second-part')}
          </SModalMessage>
          <SModalButtons>
            <SCancelButton>{t('modal.block-user.button-cancel')}</SCancelButton>
            <SConfirmButton onClick={handleConfirmClick}>
              {isAnnouncement ? t('modal.block-group.button-confirm') : t('modal.block-user.button-confirm')}
            </SConfirmButton>
          </SModalButtons>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default BlockUserModal;

BlockUserModal.defaultProps = {
  isAnnouncement: false,
};

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
    props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.secondary};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  color: ${(props) =>
    props.theme.name === 'light' ? props.theme.colorsThemed.text.primary : props.theme.colors.white};
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  line-height: 24px;
`;

const SModalTitle = styled.strong`
  font-size: 20px;
  margin-bottom: 16px;
`;

const SModalMessage = styled.p`
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
  color: ${(props) =>
    props.theme.name === 'light' ? props.theme.colorsThemed.text.primary : props.theme.colors.white};
  background: ${(props) => props.theme.colorsThemed.background.quaternary};
  &:hover {
    background: ${(props) =>
      props.theme.name === 'light' ? props.theme.colors.dark : props.theme.colorsThemed.background.quaternary};
    color: ${(props) => props.theme.colors.white};
    background: ${(props) => props.theme.colorsThemed.background.quaternary};
  }
`;

const SConfirmButton = styled(Button)`
  padding: 12px 24px;
  line-height: 24px;
  font-size: 14px;
  margin-left: auto;
  flex-shrink: 0;
  background-color: ${(props) => props.theme.colorsThemed.accent.error};
  &:hover {
    background-color: ${(props) => props.theme.colorsThemed.accent.error};
  }
`;
