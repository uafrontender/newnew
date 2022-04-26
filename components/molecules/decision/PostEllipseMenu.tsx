import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import useOnClickEsc from '../../../utils/hooks/useOnClickEsc';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import Text from '../../atoms/Text';

interface IPostEllipseMenu {
  postType: string;
  isVisible: boolean;
  isFollowing: boolean;
  isFollowingDecision: boolean;
  handleFollowDecision: () => void;
  handleToggleFollowingCreator: () => void;
  handleReportOpen: ()=> void;
  onClose: () => void;
}

const PostEllipseMenu: React.FunctionComponent<IPostEllipseMenu> = ({
  postType,
  isVisible,
  isFollowing,
  isFollowingDecision,
  handleFollowDecision,
  handleToggleFollowingCreator,
  handleReportOpen,
  onClose,
}) => {
  const { t } = useTranslation('decision');
  const containerRef = useRef<HTMLDivElement>();

  useOnClickEsc(containerRef, onClose);
  useOnClickOutside(containerRef, onClose);

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
            onClick={() => handleToggleFollowingCreator()}
            style={{
              marginBottom: '16px',
            }}
          >
            <Text
              variant={3}
            >
              { !isFollowing ? t('ellipse.follow-creator') : t('ellipse.unfollow-creator') }
            </Text>
          </SButton>
          <SButton
            onClick={() => handleFollowDecision()}
          >
            <Text
              variant={3}
            >
              { !isFollowingDecision ? t('ellipse.follow-decision', { postType: t(`postType.${postType}`) }) : t('ellipse.unfollow-decision', { postType: t(`postType.${postType}`) }) }
            </Text>
          </SButton>
          <SSeparator />
          <SButton
            onClick={() => {
              handleReportOpen();
              onClose();
            }}
          >
            <Text
              variant={3}
              tone='error'
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

  background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};

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
