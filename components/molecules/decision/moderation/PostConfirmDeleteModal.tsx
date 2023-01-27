import React, { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import Modal from '../../../organisms/Modal';
import Button from '../../../atoms/Button';
import { TPostType } from '../../../../utils/switchPostType';
import { Mixpanel } from '../../../../utils/mixpanel';

interface IPostConfirmDeleteModal {
  postUuid: string;
  postType: TPostType;
  isVisible: boolean;
  closeModal: () => void;
  handleConfirmDelete: () => void;
}

const PostConfirmDeleteModal: React.FC<IPostConfirmDeleteModal> = ({
  postUuid,
  postType,
  isVisible,
  closeModal,
  handleConfirmDelete,
}) => {
  const { t } = useTranslation('page-Post');

  const closeModalMixpanel = useCallback(() => {
    Mixpanel.track('Close Confrim Delete Post Modal', {
      _stage: 'Post',
      _postUuid: postUuid,
      _component: 'PostConfirmDeleteModal',
    });
    closeModal();
  }, [closeModal, postUuid]);

  const handleConfirmDeleteMixpanel = useCallback(() => {
    Mixpanel.track('Confirm Deleting Post', {
      _stage: 'Post',
      _postUuid: postUuid,
      _component: 'PostConfirmDeleteModal',
    });
    handleConfirmDelete();
  }, [handleConfirmDelete, postUuid]);

  return (
    <Modal show={isVisible} additionalz={12} onClose={closeModalMixpanel}>
      <SContainer>
        <SModal>
          <SModalTitle>
            {t('deletePostModal.title', {
              postType: t(`postType.${postType}`),
            })}
          </SModalTitle>
          <SModalMessage>
            {t('deletePostModal.body', { postType: t(`postType.${postType}`) })}
          </SModalMessage>
          <SModalButtons>
            <SCancelButton onClick={closeModalMixpanel}>
              {t('deletePostModal.button.cancel')}
            </SCancelButton>
            <SConfirmButton onClick={handleConfirmDeleteMixpanel}>
              {t('deletePostModal.button.confirm')}
            </SConfirmButton>
          </SModalButtons>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default PostConfirmDeleteModal;

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
