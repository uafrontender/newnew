import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import Modal from '../../../../organisms/Modal';
import Button from '../../../../atoms/Button';

interface IAcConfirmDeleteOptionModal {
  isVisible: boolean;
  closeModal: () => void;
  handleConfirmDelete: () => void;
}

const AcConfirmDeleteOptionModal: React.FC<IAcConfirmDeleteOptionModal> = ({
  isVisible,
  closeModal,
  handleConfirmDelete,
}) => {
  const { t } = useTranslation('page-Post');

  return (
    <Modal show={isVisible} additionalz={12} onClose={closeModal}>
      <SContainer>
        <SModal>
          <SModalTitle>
            {t('acPostModeration.deleteOptionModal.title')}
          </SModalTitle>
          <SModalMessage>
            {t('acPostModeration.deleteOptionModal.body')}
          </SModalMessage>
          <SModalButtons>
            <SCancelButton view='quaternary' onClick={closeModal}>
              {t('acPostModeration.deleteOptionModal.button.cancel')}
            </SCancelButton>
            <SConfirmButton view='danger' onClick={handleConfirmDelete}>
              {t('acPostModeration.deleteOptionModal.button.confirm')}
            </SConfirmButton>
          </SModalButtons>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default AcConfirmDeleteOptionModal;

const SContainer = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const SModal = styled.div`
  z-index: 10;
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
`;

const SConfirmButton = styled(Button)`
  padding: 12px 24px;
  line-height: 24px;
  font-size: 14px;
  margin-left: auto;
  flex-shrink: 0;
`;
