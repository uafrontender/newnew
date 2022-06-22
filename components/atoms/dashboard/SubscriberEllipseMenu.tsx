import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import Link from 'next/link';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import Text from '../Text';

interface ISubscriberEllipseMenu {
  user: newnewapi.IUser;
  isVisible: boolean;
  handleClose: () => void;
  onUserBlock: () => void;
  onUserReport: () => void;
  userBlocked?: boolean;
}

const SubscriberEllipseMenu: React.FC<ISubscriberEllipseMenu> = ({
  isVisible,
  handleClose,
  userBlocked,
  onUserBlock,
  onUserReport,
  user,
}) => {
  const { t } = useTranslation('common');
  const containerRef = useRef<HTMLDivElement>();

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
          <Link href={`/${user.username}`}>
            <a>
              <SButton>
                <Text variant={2}>{t('ellipse.view')}</Text>
              </SButton>
            </a>
          </Link>
          <SButton onClick={reportUserHandler}>
            <Text variant={2}>{t('ellipse.report')}</Text>
          </SButton>
          <SButton onClick={blockUserHandler}>
            <Text variant={2}>
              {userBlocked ? t('ellipse.unblock') : t('ellipse.block')}
            </Text>
          </SButton>
        </SContainer>
      )}
    </AnimatePresence>
  );
};

SubscriberEllipseMenu.defaultProps = {
  userBlocked: false,
};

export default SubscriberEllipseMenu;

const SContainer = styled(motion.div)`
  position: absolute;
  top: 100%;
  z-index: 10;
  right: 16px;
  width: 216px;
  box-shadow: 0px 0px 35px 20px rgba(0, 0, 0, 0.25);

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
  a {
    display: block;
    width: 100%;
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
