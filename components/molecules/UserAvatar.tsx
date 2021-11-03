import React from 'react';
import Image from 'next/image';
import styled, { useTheme } from 'styled-components';

import Button from '../atoms/Button';
import InlineSVG from '../atoms/InlineSVG';

import userIcon from '../../public/images/svg/icons/filled/UnregisteredUser.svg';
import { useAppSelector } from '../../redux-store/store';

interface IUserAvatar {
  user: {
    avatar?: string,
  },
  onClick: () => any,
}

export const UserAvatar: React.FC<IUserAvatar> = (props) => {
  const {
    user,
    onClick,
  } = props;
  const { resizeMode } = useAppSelector((state) => state.ui);

  const theme = useTheme();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  if (!user.avatar) {
    return (
      <Button
        iconOnly
        onClick={onClick}
      >
        <InlineSVG
          svg={userIcon}
          fill={theme.colorsThemed.appIcon}
          width={isMobile ? '20px' : '24px'}
          height={isMobile ? '20px' : '24px'}
        />
      </Button>
    );
  }

  return (
    <SContainer onClick={onClick}>
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

const SContainer = styled.div`
  width: 36px;
  height: 36px;
  cursor: pointer;
  overflow: hidden;
  border-radius: 24px;

  ${({ theme }) => theme.media.tablet} {
    width: 48px;
    height: 48px;
  }
`;
