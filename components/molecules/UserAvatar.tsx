import React from 'react';
import styled, { css, useTheme } from 'styled-components';

import Button from '../atoms/Button';
import InlineSVG from '../atoms/InlineSVG';

import userIcon from '../../public/images/svg/icons/filled/UnregisteredUser.svg';
import { useAppState } from '../../contexts/appStateContext';

interface IUserAvatar {
  avatarUrl?: string;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>
  ) => any;
  withClick?: boolean;
}

export const UserAvatar: React.FC<IUserAvatar> = React.memo((props) => {
  const { avatarUrl, onClick, withClick, ...rest } = props;
  const { resizeMode } = useAppState();

  const theme = useTheme();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

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
      <img src={avatarUrl} alt='User avatar' />
    </SContainer>
  );
});

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
  width: 36px;
  height: 36px;
  position: relative;
  overflow: hidden;
  min-width: 36px;
  min-height: 36px;
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

const SButton = styled(Button)`
  padding: 8px;
  border-radius: 12px;

  ${(props) => props.theme.media.tablet} {
    padding: 12px;
    border-radius: 16px;
  }
`;
