import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import Text from '../../atoms/Text';

interface IChatEllipseMenu {
  user: newnewapi.IUser;
  isVisible: boolean;
  handleClose: () => void;
  onUserBlock: () => void;
  onUserReport: () => void;
  userBlocked?: boolean;
  isAnnouncement?: boolean;
  myRole: newnewapi.ChatRoom.MyRole;
}

const ChatEllipseMenu: React.FC<IChatEllipseMenu> = ({
  isVisible,
  handleClose,
  userBlocked,
  onUserBlock,
  onUserReport,
  isAnnouncement,
  user,
  myRole,
}) => {
  const { t } = useTranslation('chat');
  const containerRef = useRef<HTMLDivElement>();
  const router = useRouter();

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

  const blockUserHandler = () => {
    onUserBlock();
    handleClose();
  };

  const reportUserHandler = () => {
    onUserReport();
    handleClose();
  };

  const viewUserProfile = () => {
    router.push(`/${user.username}`);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <SContainer
          ref={(el) => {
            containerRef.current = el!!;
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {myRole === 2 && !isAnnouncement && (
            <SButton onClick={viewUserProfile}>
              <Text variant={2}>{t('ellipse.view-profile')}</Text>
            </SButton>
          )}
          <SButton onClick={reportUserHandler}>
            <Text variant={2} tone='error'>
              {!isAnnouncement
                ? t('ellipse.report-user')
                : t('ellipse.report-group')}
            </Text>
          </SButton>
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
        </SContainer>
      )}
    </AnimatePresence>
  );
};

ChatEllipseMenu.defaultProps = {
  userBlocked: false,
  isAnnouncement: false,
};

export default ChatEllipseMenu;

const SContainer = styled(motion.div)`
  position: absolute;
  top: 100%;
  z-index: 10;
  right: 16px;
  width: 216px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.tertiary};

  ${({ theme }) => theme.media.laptop} {
    right: 16px;
  }
`;

const SButton = styled.button`
  background: none;
  border: transparent;
  text-align: left;
  width: 100%;
  cursor: pointer;
  padding: 8px;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.borderRadius.smallLg};

  &:focus {
    outline: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colorsThemed.background.quinary};
  }
`;
