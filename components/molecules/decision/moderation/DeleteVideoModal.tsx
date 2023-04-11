import React, { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import Modal from '../../../organisms/Modal';
import Button from '../../../atoms/Button';
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import { Mixpanel } from '../../../../utils/mixpanel';

interface IDeleteVideoModal {
  isVisible: boolean;
  isLoading: boolean;
  closeModal: () => void;
  handleConfirmDelete: () => void;
}

const DeleteVideoModal: React.FC<IDeleteVideoModal> = ({
  isVisible,
  isLoading,
  closeModal,
  handleConfirmDelete,
}) => {
  const { t } = useTranslation('page-Post');
  const { postParsed } = usePostInnerState();

  const handleCloseModalMixpanel = useCallback(() => {
    Mixpanel.track('Click close delete additional video modal', {
      _stage: 'Post',
      _postUuid: postParsed?.postUuid,
      _component: 'DeleteVideoModal',
    });
    closeModal();
  }, [closeModal, postParsed?.postUuid]);

  const handleConfirmDeleteMixpanel = useCallback(() => {
    Mixpanel.track('Click cofirm delete additional video', {
      _stage: 'Post',
      _postUuid: postParsed?.postUuid,
      _component: 'DeleteVideoModal',
    });
    handleConfirmDelete();
  }, [handleConfirmDelete, postParsed?.postUuid]);

  return (
    <Modal show={isVisible} additionalz={12} onClose={handleCloseModalMixpanel}>
      <SContainer>
        <SModal>
          <SModalTitle>{t('deleteVideoModal.title')}</SModalTitle>
          <SModalMessage>{t('deleteVideoModal.body')}</SModalMessage>
          <SModalButtons>
            <SCancelButton
              view='modalSecondarySelected'
              onClick={handleCloseModalMixpanel}
            >
              {t('deleteVideoModal.button.cancel')}
            </SCancelButton>
            <SConfirmButton
              view='danger'
              disabled={isLoading}
              onClick={handleConfirmDeleteMixpanel}
            >
              {t('deleteVideoModal.button.confirm')}
            </SConfirmButton>
          </SModalButtons>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default DeleteVideoModal;

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
