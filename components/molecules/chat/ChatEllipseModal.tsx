import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import Text from '../../atoms/Text';
import { useAppSelector } from '../../../redux-store/store';

interface IChatEllipseModal {
  isOpen: boolean;
  zIndex: number;
  onClose: () => void;
  userBlocked?: boolean;
  onUserBlock: () => void;
  onUserReport: () => void;
  isAnnouncement?: boolean;
}

const ChatEllipseModal: React.FunctionComponent<IChatEllipseModal> = ({
  isOpen,
  zIndex,
  onClose,
  userBlocked,
  onUserBlock,
  onUserReport,
  isAnnouncement,
}) => {
  const { t } = useTranslation('chat');
  const user = useAppSelector((state) => state.user);

  const blockUserHandler = () => {
    onUserBlock();
    onClose();
  };

  const reportUserHandler = () => {
    onUserReport();
    onClose();
  };

  return (
    <Modal show={isOpen} overlaydim additionalz={zIndex} onClose={onClose}>
      <SWrapper>
        <SContentContainer
          onClick={(e: any) => {
            e.stopPropagation();
          }}
        >
          {user.userData?.options?.isCreator && !isAnnouncement && (
            <>
              <SButton onClick={() => {}}>
                <Text variant={2}>{t('ellipse.view-profile')}</Text>
              </SButton>
              <SSeparator />
            </>
          )}
          <SButton onClick={reportUserHandler}>
            <Text variant={2} tone='error'>
              {!isAnnouncement
                ? t('ellipse.report-user')
                : t('ellipse.report-group')}
            </Text>
          </SButton>
          <SSeparator />
          <SButton onClick={blockUserHandler}>
            {!isAnnouncement ? (
              <Text variant={2}>
                {userBlocked
                  ? t('ellipse.unblock-user')
                  : t('ellipse.block-user')}
              </Text>
            ) : (
              <Text variant={2}>
                {userBlocked
                  ? t('ellipse.unblock-group')
                  : t('ellipse.block-group')}
              </Text>
            )}
          </SButton>
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

export default ChatEllipseModal;

ChatEllipseModal.defaultProps = {
  userBlocked: false,
  isAnnouncement: false,
};

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

const SSeparator = styled.div`
  margin: 0 20px;
  height: 1px;
  overflow: hidden;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.background.outlines1
      : props.theme.colorsThemed.background.tertiary};
  border: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};
`;
