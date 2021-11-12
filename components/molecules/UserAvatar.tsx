import React from 'react';
import Image from 'next/image';
import styled, { css, useTheme } from 'styled-components';

import Button from '../atoms/Button';
import InlineSVG from '../atoms/InlineSVG';

import { useAppSelector } from '../../redux-store/store';

import userIcon from '../../public/images/svg/icons/filled/UnregisteredUser.svg';

interface IUserAvatar {
  user: {
    avatar?: string,
  },
  radius?: 'small' | 'medium' | 'large' | 'xxxLarge',
  onClick?: () => any,
  withClick?: boolean,
}

export const UserAvatar: React.FC<IUserAvatar> = (props) => {
  const {
    user,
    radius,
    onClick,
    withClick,
    ...rest
  } = props;
  const { resizeMode } = useAppSelector((state) => state.ui);

  const theme = useTheme();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  if (!user.avatar) {
    return (
      <Button
        iconOnly
        onClick={onClick}
        {...rest}
      >
        <InlineSVG
          svg={userIcon}
          fill={theme.colorsThemed.text.primary}
          width={isMobile ? '20px' : '24px'}
          height={isMobile ? '20px' : '24px'}
        />
      </Button>
    );
  }

  return (
    <SContainer {...rest} radius={radius ?? 'xxxLarge'} onClick={onClick} withClick={withClick ?? false}>
      <Image
        src={user.avatar}
        alt="User avatar"
        width="100%"
        height="100%"
        objectFit="cover"
      />
    </SContainer>
  );
};

export default UserAvatar;

UserAvatar.defaultProps = {
  radius: 'xxxLarge',
  onClick: () => {
  },
  withClick: false,
};

interface ISContainer {
  radius: 'small' | 'medium' | 'large' | 'xxxLarge',
  withClick: boolean,
}

const SContainer = styled.div<ISContainer>`
  width: 36px;
  height: 36px;
  overflow: hidden;
  min-width: 36px;
  min-height: 36px;
  border-radius: ${(props) => props.theme.borderRadius[props.radius]};

  ${(props) => props.withClick && css`cursor: pointer;`}
  ${(props) => props.theme.media.tablet} {
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
  }
`;
