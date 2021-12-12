import React from 'react';
import Image from 'next/image';
import styled, { css, useTheme } from 'styled-components';

import Button from '../atoms/Button';
import InlineSVG from '../atoms/InlineSVG';

import { useAppSelector } from '../../redux-store/store';

import userIcon from '../../public/images/svg/icons/filled/UnregisteredUser.svg';

interface IUserAvatar {
  user: {
    userData?: {
      avatarUrl?: string,
    }
  },
  onClick?: () => any,
  withClick?: boolean,
}

export const UserAvatar: React.FC<IUserAvatar> = (props) => {
  const {
    user,
    onClick,
    withClick,
    ...rest
  } = props;
  const { resizeMode } = useAppSelector((state) => state.ui);

  const theme = useTheme();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  if (!user.userData?.avatarUrl) {
    return (
      <SButton
        iconOnly
        view="quaternary"
        onClick={onClick}
        {...rest}
      >
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
    <SContainer
      {...rest}
      onClick={onClick}
      withClick={withClick ?? false}
    >
      <Image
        src={user.userData.avatarUrl}
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
  withClick: false,
  onClick: () => {
  },
};

interface ISContainer {
  withClick: boolean,
}

const SContainer = styled.div<ISContainer>`
  width: 36px;
  height: 36px;
  overflow: hidden;
  min-width: 36px;
  min-height: 36px;
  border-radius: 18px;

  ${(props) => props.withClick && css`cursor: pointer;`}
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
