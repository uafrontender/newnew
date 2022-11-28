import React from 'react';
import { useTranslation } from 'next-i18next';
import styled, { css } from 'styled-components';

import EllipseMenu, { EllipseMenuButton } from '../../../atoms/EllipseMenu';
import { TPostType } from '../../../../utils/switchPostType';

interface IPostEllipseMenuModeration {
  postType: TPostType;
  isVisible: boolean;
  canDeletePost: boolean;
  handleClose: () => void;
  handleOpenDeletePostModal: () => void;
  anchorElement?: HTMLElement;
}

const PostEllipseMenuModeration: React.FunctionComponent<IPostEllipseMenuModeration> =
  React.memo(
    ({
      postType,
      isVisible,
      canDeletePost,
      handleClose,
      handleOpenDeletePostModal,
      anchorElement,
    }) => {
      const { t } = useTranslation('common');

      return (
        <SEllipseMenu
          isOpen={isVisible}
          onClose={handleClose}
          anchorElement={anchorElement}
        >
          <SEllipseMenuButton
            variant={3}
            disabled={!canDeletePost}
            onClick={() => {
              handleOpenDeletePostModal();
              handleClose();
            }}
          >
            {t('ellipse.deleteDecision', {
              postType: t(`postType.${postType}`),
            })}
          </SEllipseMenuButton>
        </SEllipseMenu>
      );
    }
  );

export default PostEllipseMenuModeration;

const SEllipseMenu = styled(EllipseMenu)`
  position: fixed;
  min-width: max-content;

  ${({ theme }) =>
    theme.name === 'light'
      ? css`
          background: ${() => theme.colorsThemed.background.quaternary};
        `
      : null}
`;

const SEllipseMenuButton = styled(EllipseMenuButton)`
  :hover {
    background: transparent;
  }
`;
