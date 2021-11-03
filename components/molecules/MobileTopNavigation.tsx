import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled, { useTheme } from 'styled-components';

import Button from '../atoms/Button';
import InlineSVG from '../atoms/InlineSVG';
import UserAvatar from './UserAvatar';
import SearchInput from '../atoms/SearchInput';

import { useAppSelector } from '../../redux-store/store';

import userIcon from '../../public/images/svg/icons/filled/UnregisteredUser.svg';
import mobileLogo from '../../public/images/svg/mobile-logo.svg';

interface IMobileTopNavigation {
}

export const MobileTopNavigation: React.FC<IMobileTopNavigation> = () => {
  const theme = useTheme();
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  const handleUserClick = () => {
    router.push('/profile');
  };
  const handleSignInClick = () => {
    router.push('/sign-up');
  };

  return (
    <SContainer>
      <Link href="/">
        <a>
          <InlineSVG
            svg={mobileLogo}
            fill={theme.colorsThemed.appIcon}
            width="40px"
            height="40px"
          />
        </a>
      </Link>
      <SRightBlock>
        <SItemWithMargin>
          <SearchInput />
        </SItemWithMargin>
        <SItemWithMargin>
          {user.loggedIn ? (
            <UserAvatar
              user={user}
              onClick={handleUserClick}
            />
          ) : (
            <Button
              iconOnly
              bg={theme.gradients.blueDiagonal}
              onClick={handleSignInClick}
            >
              <InlineSVG
                svg={userIcon}
                fill={theme.colors.baseLight0}
                width="20px"
                height="20px"
              />
            </Button>
          )}
        </SItemWithMargin>
      </SRightBlock>
    </SContainer>
  );
};

export default MobileTopNavigation;

const SContainer = styled.nav`
  display: flex;
  padding: 8px 16px;
  position: relative;
  align-items: center;
  justify-content: space-between;
`;

const SRightBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const SItemWithMargin = styled.div`
  margin-left: 12px;
`;
