import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import Text from '../../atoms/Text';

interface IPostEllipseMenuModeration {
  isVisible: boolean;
  handleClose: () => void;
  handleOpenDeletePostModal: () => void;
}

const PostEllipseMenuModeration: React.FunctionComponent<IPostEllipseMenuModeration> = ({
  isVisible,
  handleClose,
  handleOpenDeletePostModal,
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
            onClick={() => {
              handleOpenDeletePostModal();
              handleClose();
            }}
          >
            <Text
              variant={3}
            >
              { t('ellipse.deleteDecision') }
            </Text>
          </SButton>
        </SContainer>
      )}
    </AnimatePresence>
  );
};

export default PostEllipseMenuModeration;

const SContainer = styled(motion.div)`
  position: absolute;
  top: calc(100% - 10px);
  z-index: 10;
  right: 16px;

  min-width: max-content;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

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

  padding: 8px;
  border-radius: 12px;

  cursor: pointer;
  transition: 0.2s linear;

  &:focus, &:hover {
    outline: none;
    background-color: ${({ theme }) => theme.colorsThemed.background.quinary};
  }
`;

