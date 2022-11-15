import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';

import Modal from '../../../../organisms/Modal';
import Button from '../../../../atoms/Button';

interface IAcPickWinningOptionModal {
  isVisible: boolean;
  children: React.ReactNode;
  closeModal: () => void;
  handleConfirm: () => void;
}

const AcPickWinningOptionModal: React.FC<IAcPickWinningOptionModal> = ({
  isVisible,
  children,
  closeModal,
  handleConfirm,
}) => {
  const { t } = useTranslation('page-Post');

  return (
    <Modal show={isVisible} additionalz={12} onClose={closeModal}>
      <SContainer>
        <SModal onClick={(e) => e.stopPropagation()}>
          <SModalTitle>
            {t('acPostModeration.optionsTab.selectWinner.title')}
          </SModalTitle>
          <SModalMessage>
            {t('acPostModeration.optionsTab.selectWinner.body')}
          </SModalMessage>
          {children}
          <SModalButtons>
            <SCancelButton view='secondary' onClick={closeModal}>
              {t('acPostModeration.optionsTab.selectWinner.button.cancel')}
            </SCancelButton>
            <SConfirmButton view='primaryGrad' onClick={handleConfirm}>
              {t('acPostModeration.optionsTab.selectWinner.button.confirm')}
            </SConfirmButton>
          </SModalButtons>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default AcPickWinningOptionModal;

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
  font-size: 20px;
  margin-bottom: 16px;
`;

const SModalMessage = styled.p`
  font-size: 16px;
  margin-bottom: 24px;
`;

const SModalButtons = styled.div`
  display: flex;

  margin-top: 24px;
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
`;
