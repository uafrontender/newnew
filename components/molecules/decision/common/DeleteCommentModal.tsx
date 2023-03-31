import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import Modal from '../../../organisms/Modal';
import Button from '../../../atoms/Button';

interface IDeleteCommentModal {
  isVisible: boolean;
  isDeletingComment: boolean;
  closeModal: () => void;
  handleConfirmDelete: () => void;
}

const DeleteCommentModal: React.FC<IDeleteCommentModal> = ({
  isVisible,
  isDeletingComment,
  closeModal,
  handleConfirmDelete,
}) => {
  const { t } = useTranslation('page-Post');

  return (
    <Modal show={isVisible} additionalz={12} onClose={closeModal}>
      <SContainer
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <SModal>
          <SModalTitle>{t('deleteCommentModal.title')}</SModalTitle>
          <SModalMessage>{t('deleteCommentModal.body')}</SModalMessage>
          <SModalButtons>
            <SCancelButton
              view='modalSecondary'
              disabled={isDeletingComment}
              onClick={() => closeModal()}
            >
              {t('deleteCommentModal.button.cancel')}
            </SCancelButton>
            <SConfirmButton
              view='danger'
              disabled={isDeletingComment}
              onClick={handleConfirmDelete}
            >
              {t('deleteCommentModal.button.confirm')}
            </SConfirmButton>
          </SModalButtons>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default DeleteCommentModal;

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
