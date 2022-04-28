import React from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';

import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';

import { useAppDispatch } from '../../../redux-store/store';
import { deleteMyAccount } from '../../../api/endpoints/user';
import { logoutUserClearCookiesAndRedirect } from '../../../redux-store/slices/userStateSlice';

interface IConfirmDeleteAccountModal {
  isVisible: boolean;
  closeModal: () => void;
}

const ConfirmDeleteAccountModal: React.FC<IConfirmDeleteAccountModal> = ({
  isVisible,
  closeModal,
}) => {
  const { t } = useTranslation('profile');
  const dispatch = useAppDispatch();

  async function deleteUser() {
    try {
      const payload = new newnewapi.EmptyRequest({});

      const res = await deleteMyAccount(payload);

      if (!res.error) {
        dispatch(logoutUserClearCookiesAndRedirect())
      }
    } catch (err) {
      console.error(err);
    }
  }
  const handleConfirmClick = () => {
    deleteUser();
  };
  return (
    <Modal show={isVisible} onClose={closeModal}>
      <SContainer>
        <SModal
          onClick={(e) => e.stopPropagation()}
        >
          <SModalTitle>{t('modal.delete-my-account.title')}</SModalTitle>
          <SModalMessage>
            {t('modal.delete-my-account.body')}
          </SModalMessage>
          <SModalButtons>
            <SConfirmButton onClick={handleConfirmClick}>
              {t('modal.delete-my-account.button-confirm')}
            </SConfirmButton>
            <SCancelButton
              onClick={closeModal}
            >
              {t('modal.delete-my-account.button-cancel')}
            </SCancelButton>
          </SModalButtons>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default ConfirmDeleteAccountModal;

ConfirmDeleteAccountModal.defaultProps = {};

const SContainer = styled.div`
  position: absolute;
  display: flex;
  height: 100%;
  width: 100%;
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
  text-align: center;
`;

const SModalMessage = styled.p`
  font-size: 16px;
  margin-bottom: 24px;
  text-align: center;
`;

const SModalButtons = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
`;

const SCancelButton = styled(Button)`
  padding: 12px 24px;
  line-height: 24px;
  font-size: 14px;
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
  background-color: ${(props) => props.theme.colorsThemed.accent.error};
  &:hover {
    background-color: ${(props) => props.theme.colorsThemed.accent.error};
  }
`;
