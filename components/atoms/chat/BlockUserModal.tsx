import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import Modal from '../../organisms/Modal';
import Button from '../Button';

interface IBlockUserModal {
  confirmBlockUser: boolean;
  onUserBlock: () => void;
  userName: string;
  closeModal: () => void;
}

export const BlockUserModal: React.FC<IBlockUserModal> = ({ confirmBlockUser, onUserBlock, userName, closeModal }) => {
  const { t } = useTranslation('chat');

  const handleConfirmClick = () => {
    onUserBlock();
  };
  return (
    <Modal show={confirmBlockUser} onClose={closeModal}>
      <SContainer>
        <SModal>
          <SModalTitle>{t('modal.block-user.title')}</SModalTitle>
          <SModalMessage>
            {t('modal.block-user.message-first-part')} {userName} {t('modal.block-user.message-second-part')}
          </SModalMessage>
          <SModalButtons>
            <SCancelButton>{t('modal.block-user.button-cancel')}</SCancelButton>
            <SConfirmButton onClick={handleConfirmClick}>{t('modal.block-user.button-confirm')}</SConfirmButton>
          </SModalButtons>
        </SModal>
      </SContainer>
    </Modal>
  );
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
  background-color: ${(props) => props.theme.colorsThemed.background.secondary};
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
  background: ${(props) =>
    props.theme.name === 'light' ? props.theme.colors.dark : props.theme.colorsThemed.background.quaternary};
  &:hover {
    background: ${(props) =>
      props.theme.name === 'light' ? props.theme.colors.dark : props.theme.colorsThemed.background.quaternary};
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
