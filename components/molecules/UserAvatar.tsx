import React, { useState } from 'react';
import styled, { css, useTheme } from 'styled-components';

import Button from '../atoms/Button';
import InlineSVG from '../atoms/InlineSVG';

import userIcon from '../../public/images/svg/icons/filled/UnregisteredUser.svg';
import { useAppState } from '../../contexts/appStateContext';
import GenericSkeleton from './GenericSkeleton';

interface IUserAvatar {
  avatarUrl?: string;
  withClick?: boolean;
  withSkeleton?: boolean;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>
  ) => any;
}

export const UserAvatar: React.FC<IUserAvatar> = React.memo(
  ({ avatarUrl, onClick, withSkeleton = false, withClick, ...rest }) => {
    const { resizeMode } = useAppState();
    const theme = useTheme();
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const [loaded, setLoaded] = useState(!withSkeleton);

    if (!avatarUrl) {
      return (
        <SButton iconOnly view='quaternary' onClick={onClick} {...rest}>
          <InlineSVG
            svg={userIcon}
            fill={theme.colorsThemed.text.primary}
            width={isMobile ? '20px' : '24px'}
            height={isMobile ? '20px' : '24px'}
          />
        </SButton>
      );
    }

    return (
      <SContainer {...rest} onClick={onClick} withClick={withClick ?? false}>
        <img
          src={avatarUrl}
          alt='User avatar'
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => {
            setLoaded(true);
          }}
        />
        {!loaded && (
          <SAvatarSkeleton
            bgColor={theme.colorsThemed.background.secondary}
            highlightColor={theme.colorsThemed.background.quaternary}
          />
        )}
      </SContainer>
    );
  }
);

export default UserAvatar;

UserAvatar.defaultProps = {
  avatarUrl: undefined,
  withClick: false,
  onClick: () => {},
};

interface ISContainer {
  withClick: boolean;
}

const SContainer = styled.div<ISContainer>`
  position: relative;
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
  overflow: hidden;
  border-radius: 18px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  ${(props) =>
    props.withClick &&
    css`
      cursor: pointer;
    `}

  ${(props) => props.theme.media.tablet} {
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    border-radius: 24px;
  }
`;

const SAvatarSkeleton = styled(GenericSkeleton)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 18px;
`;

const SButton = styled(Button)`
  padding: 8px;
  border-radius: 12px;

  ${(props) => props.theme.media.tablet} {
    padding: 12px;
    border-radius: 16px;
  }
`;
