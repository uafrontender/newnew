import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import Text from '../../atoms/Text';

interface IChatEllipseModal {
  isOpen: boolean;
  zIndex: number;
  onClose: () => void;
  userBlocked?: boolean;
  onUserBlock: () => void;
}

const ChatEllipseModal: React.FunctionComponent<IChatEllipseModal> = ({
  isOpen,
  zIndex,
  onClose,
  userBlocked,
  onUserBlock,
}) => {
  const { t } = useTranslation('chat');

  const blockUserHandler = () => {
    onUserBlock();
    onClose();
  };

  return (
    <Modal show={isOpen} overlayDim additionalZ={zIndex} onClose={onClose}>
      <SWrapper>
        <SContentContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <SButton
            onClick={() => {}}
            style={{
              marginBottom: '28px',
            }}
          >
            <Text variant={2}>{t('ellipse.report-user')}</Text>
          </SButton>
          <SButton onClick={blockUserHandler}>
            <Text variant={2}>{userBlocked ? t('ellipse.unblock-user') : t('ellipse.block-user')}</Text>
          </SButton>
        </SContentContainer>
        <Button
          view="secondary"
          style={{
            height: '56px',
            width: 'calc(100% - 32px)',
          }}
        >
          {t('Cancel')}
        </Button>
      </SWrapper>
    </Modal>
  );
};

ChatEllipseModal.defaultProps = {
  userBlocked: false,
};

export default ChatEllipseModal;

const SWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 16px;
`;

const SContentContainer = styled.div`
  width: calc(100% - 32px);
  height: fit-content;

  display: flex;
  flex-direction: column;

  padding: 16px;
  padding-bottom: 30px;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: 480px;
    margin: auto;
  }
`;

const SButton = styled.button`
  background: none;
  border: transparent;

  text-align: center;

  cursor: pointer;

  &:focus {
    outline: none;
  }
`;
