import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import useOnClickEsc from '../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../utils/hooks/useOnClickOutside';
import Text from '../atoms/Text';

interface IPostCardEllipseMenu {
  postType: string;
  isVisible: boolean;
  isFollowingDecision: boolean;
  isMyPost: boolean;
  handleFollowDecision: () => void;
  handleReportOpen: () => void;
  handleDeleteModalOpen: () => void;
  onClose: () => void;
}

const PostCardEllipseMenu: React.FunctionComponent<IPostCardEllipseMenu> =
  React.memo(
    ({
      postType,
      isVisible,
      isFollowingDecision,
      isMyPost,
      handleFollowDecision,
      handleReportOpen,
      handleDeleteModalOpen,
      onClose,
    }) => {
      const { t } = useTranslation('home');
      const containerRef = useRef<HTMLDivElement>();

      useOnClickEsc(containerRef, onClose);
      useOnClickOutside(containerRef, onClose);

      if (isMyPost) {
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
                onClick={(e) => e.stopPropagation()}
              >
                <SButton
                  onClick={() => {
                    handleDeleteModalOpen();
                    onClose();
                  }}
                >
                  <Text variant={3} tone='error'>
                    {t('ellipse.report')}
                  </Text>
                </SButton>
              </SContainer>
            )}
          </AnimatePresence>
        );
      }

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
              onClick={(e) => e.stopPropagation()}
            >
              <SButton onClick={() => handleFollowDecision()}>
                <Text variant={3}>
                  {!isFollowingDecision
                    ? t('ellipse.follow-decision', {
                        postType: t(`postType.${postType}`),
                      })
                    : t('ellipse.unfollow-decision', {
                        postType: t(`postType.${postType}`),
                      })}
                </Text>
              </SButton>
              <SSeparator />
              <SButton
                onClick={() => {
                  handleReportOpen();
                  onClose();
                }}
              >
                <Text variant={3} tone='error'>
                  {t('ellipse.report')}
                </Text>
              </SButton>
            </SContainer>
          )}
        </AnimatePresence>
      );
    }
  );

export default PostCardEllipseMenu;

const SContainer = styled(motion.div)`
  position: absolute;
  top: 56px;
  z-index: 10;
  right: 16px;
  width: calc(100% - 32px);

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  ${({ theme }) => theme.media.tablet} {
    right: 12px;
  }
`;

const SButton = styled.button`
  background: none;
  border: transparent;

  cursor: pointer;

  text-align: right;

  &:focus {
    outline: none;
  }
`;

const SSeparator = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
  width: 100%;
  border-bottom: 1px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};
`;
