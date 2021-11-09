import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled, { useTheme } from 'styled-components';

import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';
import UserAvatar from '../UserAvatar';
import SearchInput from '../../atoms/SearchInput';

import { useAppSelector } from '../../../redux-store/store';

import userIcon from '../../../public/images/svg/icons/filled/UnregisteredUser.svg';
import mobileLogo from '../../../public/images/svg/mobile-logo.svg';
import tabletLogo from '../../../public/images/svg/tablet-logo.svg';

interface IMobile {
}

export const Mobile: React.FC<IMobile> = () => {
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
          {user.loggedIn ? (
            <InlineSVG
              svg={mobileLogo}
              fill={theme.colorsThemed.text.primary}
              width="40px"
              height="40px"
            />
          ) : (
            <InlineSVG
              svg={tabletLogo}
              fill={theme.colorsThemed.text.primary}
              width="127px"
              height="40px"
            />
          )}
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
                fill={theme.colorsThemed.text.primary}
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

export default Mobile;

const SContainer = styled.div`
  display: flex;
  padding: 8px 0;
  position: relative;
  align-items: center;
  justify-content: space-between;
`;

const SRightBlock = styled.nav`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const SItemWithMargin = styled.div`
  margin-left: 12px;
`;
