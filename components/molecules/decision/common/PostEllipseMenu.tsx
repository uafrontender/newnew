import React from 'react';
import { useTranslation } from 'next-i18next';
import styled, { css } from 'styled-components';

import EllipseMenu, { EllipseMenuButton } from '../../../atoms/EllipseMenu';
import { TPostType } from '../../../../utils/switchPostType';

interface IPostEllipseMenu {
  postType: TPostType;
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

    return (
      <SEllipseMenu
        isOpen={isVisible}
        onClose={onClose}
        anchorElement={anchorElement}
      >
        <EllipseMenuButton variant={3} onClick={handleFollowDecision}>
          {!isFollowingDecision
            ? t('ellipse.followDecision', {
                postType: t(`postType.${postType}`),
              })
            : t('ellipse.unFollowDecision', {
                postType: t(`postType.${postType}`),
              })}
        </EllipseMenuButton>
        <SSeparator />
        <EllipseMenuButton
          variant={3}
          tone='error'
          onClick={() => {
            handleReportOpen();
            onClose();
          }}
        >
          {t('ellipse.report')}
        </EllipseMenuButton>
      </SEllipseMenu>
    );
  }
);

export default PostEllipseMenu;

const SEllipseMenu = styled(EllipseMenu)`
  width: 216px;
  position: fixed;

  ${({ theme }) =>
    theme.name === 'light' &&
    css`
      box-shadow: 0px 0px 35px 0px rgba(0, 0, 0, 0.25);
    `}
`;

const SSeparator = styled.div`
  margin-top: 4px;
  margin-bottom: 4px;
  width: 100%;
  border-bottom: 1px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};
`;
