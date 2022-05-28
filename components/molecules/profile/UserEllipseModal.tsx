import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import Text from '../../atoms/Text';

interface IUserEllipseModal {
  isOpen: boolean;
  zIndex: number;
  isSubscribed: boolean;
  isBlocked: boolean;
  loggedIn: boolean;
  onClose: () => void;
  handleClickUnsubscribe: () => void;
  handleClickReport: () => void;
  handleClickBlock: () => void;
}

const UserEllipseModal: React.FunctionComponent<IUserEllipseModal> = ({
  isOpen,
  zIndex,
  isSubscribed,
  isBlocked,
  loggedIn,
  onClose,
  handleClickUnsubscribe,
  handleClickReport,
  handleClickBlock,
}) => {
  const { t } = useTranslation('profile');

  const reportUserHandler = () => {
    handleClickReport();
    onClose();
  };

  const blockHandler = () => {
    handleClickBlock();
    onClose();
  };

  const unsubHandler = () => {
    handleClickUnsubscribe();
    onClose();
  };

  return (
    <Modal show={isOpen} overlaydim additionalz={zIndex} onClose={onClose}>
      <SWrapper>
        <SContentContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {isSubscribed && (
            <SButton onClick={unsubHandler}>
              <Text variant={2}>{t('ellipse.unsub')}</Text>
            </SButton>
          )}
          <SButton onClick={reportUserHandler}>
            <Text variant={2} tone='error'>
              {t('ellipse.report')}
            </Text>
          </SButton>
          {loggedIn && (
            <SButton onClick={blockHandler}>
              <Text variant={2}>
                {!isBlocked ? t('ellipse.block') : t('ellipse.unblock')}
              </Text>
            </SButton>
          )}
        </SContentContainer>
        <Button
          view='modalSecondary'
          style={{
            height: '56px',
            width: 'calc(100% - 32px)',
          }}
          onClick={onClose}
        >
          {t('Cancel')}
        </Button>
      </SWrapper>
    </Modal>
  );
};

export default UserEllipseModal;

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
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.tertiary};

  border-radius: ${({ theme }) => theme.borderRadius.medium};

  z-index: 1;

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
