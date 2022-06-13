import React from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import { unsubscribeFromCreator } from '../../../api/endpoints/subscription';
import getDisplayname from '../../../utils/getDisplayname';

interface IUnsubscribeModal {
  user: newnewapi.IUser;
  confirmUnsubscribe: boolean;
  closeModal: () => void;
}

const UnsubscribeModal: React.FC<IUnsubscribeModal> = ({
  confirmUnsubscribe,
  user,
  closeModal,
}) => {
  const { t } = useTranslation('page-Profile');

  const handleUnsubscribeCreator = async () => {
    try {
      const payload = new newnewapi.UnsubscribeFromCreatorRequest({
        creatorUuid: user.uuid,
      });
      const res = await unsubscribeFromCreator(payload);
      if (res.error) throw new Error(res.error?.message ?? 'Request failed');
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };
  const handleConfirmClick = () => {
    handleUnsubscribeCreator();
  };
  return (
    <Modal show={confirmUnsubscribe} onClose={closeModal}>
      <SContainer>
        <SModal>
          <SModalTitle>{t('modal.unsubscribeUser.title')}</SModalTitle>
          <SModalMessage>
            {t(`modal.unsubscribeUser.message`, {
              username: getDisplayname(user),
            })}
          </SModalMessage>
          <SModalButtons>
            <SCancelButton onClick={closeModal}>
              {t('modal.unsubscribeUser.button.cancel')}
            </SCancelButton>
            <SConfirmButton onClick={handleConfirmClick}>
              {t('modal.unsubscribeUser.button.confirm')}
            </SConfirmButton>
          </SModalButtons>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default UnsubscribeModal;

const SContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  position: absolute;
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
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};
  background: ${(props) => props.theme.colorsThemed.background.quaternary};
  &:hover {
    background: ${(props) =>
      props.theme.name === 'light'
        ? props.theme.colors.dark
        : props.theme.colorsThemed.background.quaternary};
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
