import React from 'react';
import styled, { css } from 'styled-components';

import EllipseMenu from '../../../atoms/EllipseMenu';
import SharePanel from '../../../atoms/SharePanel';

interface IPostShareEllipseMenu {
  postUuid: string;
  postShortId: string;
  isVisible: boolean;
  onClose: () => void;
  anchorElement?: HTMLElement;
}

const PostShareEllipseMenu: React.FunctionComponent<IPostShareEllipseMenu> =
  React.memo(({ postUuid, postShortId, isVisible, onClose, anchorElement }) => (
    <SEllipseMenu
      isOpen={isVisible}
      onClose={onClose}
      anchorElement={anchorElement}
    >
      <SSharePanel
        linkToShare={`${process.env.NEXT_PUBLIC_APP_URL}/p/${
          postShortId || postUuid
        }`}
      />
    </SEllipseMenu>
  ));

export default PostShareEllipseMenu;

const SEllipseMenu = styled(EllipseMenu)`
  position: fixed;
  width: 260px;

  ${({ theme }) =>
    theme.name === 'light' &&
    css`
      box-shadow: 0px 0px 35px 0px rgba(0, 0, 0, 0.25);
    `}
`;
const SSharePanel = styled(SharePanel)`
  width: 100%;
`;
