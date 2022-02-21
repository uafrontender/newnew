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
  onUserReport: () => void;
}

const ChatEllipseModal: React.FunctionComponent<IChatEllipseModal> = ({ isOpen, zIndex, onClose, onUserReport }) => {
  const { t } = useTranslation('decision');
  const reportUserHandler = () => {
    onUserReport();
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
          <SButton onClick={reportUserHandler}>
            <Text variant={2}>{t('comments.report')}</Text>
          </SButton>
        </SContentContainer>
        <Button
          view="modalSecondary"
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
  background: ${(props) =>
    props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.tertiary};

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
  padding: 16px;
  &:focus {
    outline: none;
  }
`;
