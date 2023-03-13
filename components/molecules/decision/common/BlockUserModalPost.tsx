import React, { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';

import Modal from '../../../organisms/Modal';
import Button from '../../../atoms/Button';
import { useGetBlockedUsers } from '../../../../contexts/blockedUsersContext';
import { Mixpanel } from '../../../../utils/mixpanel';
import { usePostInnerState } from '../../../../contexts/postInnerContext';
import DisplayName from '../../../DisplayName';

interface IBlockUserModalPost {
  user: newnewapi.IUser;
  confirmBlockUser: boolean;
  closeModal: () => void;
}

const BlockUserModalPost: React.FC<IBlockUserModalPost> = ({
  confirmBlockUser,
  user,
  closeModal,
}) => {
  const { t } = useTranslation('page-Post');
  const { changeUserBlockedStatus } = useGetBlockedUsers();

  const { postParsed } = usePostInnerState();

  const handleConfirmClick = useCallback(() => {
    Mixpanel.track('Confirm User Blocked', {
      _stage: 'Post',
      _postUuid: postParsed?.postUuid,
      _blockedUserUuid: user.uuid,
      _component: 'BlockUserModalPost',
    });
    changeUserBlockedStatus(user.uuid, true);
    closeModal();
  }, [changeUserBlockedStatus, closeModal, postParsed?.postUuid, user.uuid]);

  return (
    <Modal additionalz={15} show={confirmBlockUser} onClose={closeModal}>
      <SContainer>
        <SModal>
          <SModalTitle>{t('blockUserModal.title')}</SModalTitle>
          <SModalMessage>
            {t('blockUserModal.messageFirstPart')}
            <DisplayName user={user} />
            {t('blockUserModal.messageSecondPart')}
          </SModalMessage>
          <SModalButtons>
            <SCancelButton view='secondary' onClick={closeModal}>
              {t('blockUserModal.button.cancel')}
            </SCancelButton>
            <SConfirmButton view='danger' onClick={handleConfirmClick}>
              {t('blockUserModal.button.confirm')}
            </SConfirmButton>
          </SModalButtons>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default BlockUserModalPost;

BlockUserModalPost.defaultProps = {};

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
  display: inline-flex;
  white-space: pre;
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
