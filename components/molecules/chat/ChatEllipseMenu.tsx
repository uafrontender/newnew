import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import Text from '../../atoms/Text';

interface IChatEllipseMenu {
  isVisible: boolean;
  // handleFollowDecision: () => {};
  handleClose: () => void;
}

const ChatEllipseMenu: React.FunctionComponent<IChatEllipseMenu> = ({
  isVisible,
  // handleFollowDecision,
  handleClose,
}) => {
  const { t } = useTranslation('chat');
  const containerRef = useRef<HTMLDivElement>();

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

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
          <SButton onClick={() => {}}>
            <Text variant={2}>{t('ellipse.report-user')}</Text>
          </SButton>
          <SButton onClick={() => console.log('clicked')}>
            <Text variant={2}>{t('ellipse.block-user')}</Text>
          </SButton>
        </SContainer>
      )}
    </AnimatePresence>
  );
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
  box-shadow: 0px 0px 35px 20px rgba(0, 0, 0, 0.25);
  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

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
