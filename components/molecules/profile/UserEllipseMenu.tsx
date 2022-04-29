import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import Text from '../../atoms/Text';

interface IUserEllipseMenu {
  isVisible: boolean;
  isSubscribed: boolean;
  isBlocked: boolean;
  loggedIn: boolean;
  handleClose: () => void;
  handleClickUnsubscribe: () => void;
  handleClickReport: () => void;
  handleClickBlock: () => void;
}

const UserEllipseMenu: React.FC<IUserEllipseMenu> = ({
  isVisible,
  isSubscribed,
  isBlocked,
  loggedIn,
  handleClose,
  handleClickUnsubscribe,
  handleClickReport,
  handleClickBlock,
}) => {
  const { t } = useTranslation('profile');
  const containerRef = useRef<HTMLDivElement>();

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

  const reportUserHandler = () => {
    handleClickReport();
    handleClose();
  };

  const blockHandler = () => {
    handleClickBlock();
    handleClose();
  };

  const unsubHandler = () => {
    handleClickUnsubscribe();
    handleClose();
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
        </SContainer>
      )}
    </AnimatePresence>
  );
};

export default UserEllipseMenu;

const SContainer = styled(motion.div)`
  position: absolute;
  top: 260px;
  right: 0px;
  z-index: 10;
  min-width: 180px;

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
    top: 312px;
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
