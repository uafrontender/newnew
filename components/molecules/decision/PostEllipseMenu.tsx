import React, { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import EllipseMenu, { EllipseMenuButton } from '../../atoms/EllipseMenu';

interface IPostEllipseMenu {
  postType: string;
  isVisible: boolean;
  isFollowingDecision: boolean;
  handleFollowDecision: () => void;
  handleReportOpen: () => void;
  onClose: () => void;
  anchorElement?: HTMLElement;
}

const PostEllipseMenu: React.FunctionComponent<IPostEllipseMenu> = React.memo(
  ({
    postType,
    isVisible,
    isFollowingDecision,
    handleFollowDecision,
    handleReportOpen,
    onClose,
    anchorElement,
  }) => {
    const { t } = useTranslation('common');

    useEffect(() => {
      const postModal = document.getElementById('post-modal-container');
      if (isVisible && postModal) {
        postModal.style.overflow = 'hidden';
      } else if (postModal) {
        postModal.style.overflow = 'scroll';
      }
    }, [isVisible]);

    return (
      <SEllipseMenu
        isOpen={isVisible}
        onClose={onClose}
        anchorElement={anchorElement}
      >
        <SEllipseMenuButton variant={3} onClick={handleFollowDecision}>
          {!isFollowingDecision
            ? t('ellipse.followDecision', {
                postType: t(`postType.${postType}`),
              })
            : t('ellipse.unFollowDecision', {
                postType: t(`postType.${postType}`),
              })}
        </SEllipseMenuButton>
        <SSeparator />
        <SEllipseMenuButton
          variant={3}
          tone='error'
          onClick={() => {
            handleReportOpen();
            onClose();
          }}
        >
          {t('ellipse.report')}
        </SEllipseMenuButton>
      </SEllipseMenu>
    );
  }
);

export default PostEllipseMenu;

const SEllipseMenu = styled(EllipseMenu)`
  width: 216px;
  position: fixed;
`;

const SSeparator = styled.div`
  margin-top: 3px;
  margin-bottom: 3px;
  width: 100%;
  border-bottom: 1px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};
`;

const SEllipseMenuButton = styled(EllipseMenuButton)`
  :hover {
    background: transparent;
  }
`;
