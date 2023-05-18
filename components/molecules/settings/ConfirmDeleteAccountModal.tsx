import React from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';

import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';

import { useAppDispatch } from '../../../redux-store/store';
import { deleteMyAccount } from '../../../api/endpoints/user';
import { logoutUserClearCookiesAndRedirect } from '../../../redux-store/slices/userStateSlice';
import { Mixpanel } from '../../../utils/mixpanel';
import { useAppState } from '../../../contexts/appStateContext';

interface IConfirmDeleteAccountModal {
  isVisible: boolean;
  closeModal: () => void;
}

const ConfirmDeleteAccountModal: React.FC<IConfirmDeleteAccountModal> = ({
  isVisible,
  closeModal,
}) => {
  const { t } = useTranslation('page-Profile');
  const dispatch = useAppDispatch();
  const { setUserLoggedIn } = useAppState();

  async function deleteUser() {
    try {
      const payload = new newnewapi.EmptyRequest({});

      const res = await deleteMyAccount(payload);

      if (!res.error) {
        dispatch(logoutUserClearCookiesAndRedirect());
        setUserLoggedIn(false);
      }
    } catch (err) {
      console.error(err);
    }
  }
  const handleConfirmClick = () => {
    Mixpanel.track('Confirm Delete Account Button Clicked', {
      _stage: 'Settings',
      _component: 'ConfirmDeleteMyAccountModal',
    });
    deleteUser();
  };
  return (
    <Modal show={isVisible} onClose={closeModal}>
      <SContainer>
        <SModal onClick={(e) => e.stopPropagation()}>
          <SModalTitle>{t('modal.deleteMyAccount.title')}</SModalTitle>
          <SModalMessage>{t('modal.deleteMyAccount.body')}</SModalMessage>
          <SModalButtons>
            <SCancelButton view='modalSecondarySelected' onClick={closeModal}>
              {t('modal.deleteMyAccount.button.cancel')}
            </SCancelButton>
            <SConfirmButton view='danger' onClick={handleConfirmClick}>
              {t('modal.deleteMyAccount.button.confirm')}
            </SConfirmButton>
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
  font-size: 22px;
  line-height: 30px;
  font-weight: 700;
  margin-bottom: 16px;
  text-align: center;

  ${({ theme }) => theme.media.tablet} {
    font-size: 28px;
    line-height: 36px;
  }

  ${({ theme }) => theme.media.desktop} {
    font-size: 32px;
    line-height: 40px;
  }
`;

const SModalMessage = styled.p`
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    margin-bottom: 24px;
  }
`;

const SModalButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

const SCancelButton = styled(Button)`
  padding: 12px 24px;
  line-height: 24px;
  font-size: 14px;
`;

const SConfirmButton = styled(Button)`
  padding: 12px 24px;
  line-height: 24px;
  font-size: 14px;
`;
