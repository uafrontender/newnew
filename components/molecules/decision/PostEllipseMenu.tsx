import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import Text from '../../atoms/Text';

interface IPostEllipseMenu {
  isVisible: boolean;
  handleClose: () => void;
}

const PostEllipseMenu: React.FunctionComponent<IPostEllipseMenu> = ({
  isVisible,
  handleClose,
}) => {
  const { t } = useTranslation('decision');
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
          <SButton
            onClick={() => {}}
            style={{
              marginBottom: '16px',
            }}
          >
            <Text
              variant={3}
            >
              { t('ellipse.follow-creator') }
            </Text>
          </SButton>
          <SButton
            onClick={() => {}}
          >
            <Text
              variant={3}
            >
              { t('ellipse.follow-decision') }
            </Text>
          </SButton>
          <SSeparator />
          <SButton
            onClick={() => {}}
          >
            <Text
              variant={3}
            >
              { t('ellipse.report') }
            </Text>
          </SButton>
        </SContainer>
      )}
    </AnimatePresence>
  );
};

export default PostEllipseMenu;

const SContainer = styled(motion.div)`
  position: absolute;
  top: calc(100% - 10px);
  z-index: 10;
  right: 16px;
  width: 216px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  ${({ theme }) => theme.media.laptop} {
    right: 16px;
  }
`;

const SButton = styled.button`
  background: none;
  border: transparent;

  cursor: pointer;

  &:focus {
    outline: none;
  }
`;

const SSeparator = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colorsThemed.background.outlines1};
`;
