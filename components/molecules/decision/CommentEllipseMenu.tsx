import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import Text from '../../atoms/Text';

interface ICommentEllipseMenu {
  isVisible: boolean;
  canDeleteComment: boolean;
  isMyComment: boolean;
  handleClose: () => void;
  onDeleteComment: () => void;
  onUserReport: () => void;
}

const CommentEllipseMenu: React.FC<ICommentEllipseMenu> = ({
  isVisible,
  isMyComment,
  canDeleteComment,
  handleClose,
  onDeleteComment,
  onUserReport,
}) => {
  const { t } = useTranslation('decision');
  const containerRef = useRef<HTMLDivElement>();

  useOnClickEsc(containerRef, handleClose);
  useOnClickOutside(containerRef, handleClose);

  const reportUserHandler = () => {
    onUserReport();
    handleClose();
  };

  const deleteCommentHandler = () => {
    onDeleteComment();
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
          {canDeleteComment && (
            <SButton onClick={deleteCommentHandler}>
              <Text variant={2}>{t('comments.delete')}</Text>
            </SButton>
          )}
          {!isMyComment && (
            <SButton onClick={reportUserHandler}>
              <Text variant={2}>{t('comments.report')}</Text>
            </SButton>
          )}
        </SContainer>
      )}
    </AnimatePresence>
  );
};

export default CommentEllipseMenu;

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
    props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.tertiary};

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
