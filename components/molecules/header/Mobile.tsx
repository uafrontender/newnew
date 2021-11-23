import React, { useEffect, useState } from 'react';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import styled, { useTheme } from 'styled-components';

import Logo from '../Logo';
import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';
import UserAvatar from '../UserAvatar';
import SearchInput from '../../atoms/SearchInput';

import { useAppSelector } from '../../../redux-store/store';

import userIcon from '../../../public/images/svg/icons/filled/UnregisteredUser.svg';

import { SCROLL_TO_TOP } from '../../../constants/timings';

interface IMobile {
}

export const Mobile: React.FC<IMobile> = () => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  const handleUserClick = () => {
    router.push('/profile');
  };
  const handleSignInClick = () => {
    router.push('/sign-up');
  };
  const handleLogoClick = () => {
    if (router.pathname === '/') {
      scroller.scrollTo('top-reload', {
        smooth: 'easeInOutQuart',
        duration: SCROLL_TO_TOP,
        containerId: 'generalScrollContainer',
      });
    } else {
      router.push('/', '/');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLoading(!loading);
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <SContainer>
      <LogoHolder onClick={handleLogoClick}>
        <Logo />
      </LogoHolder>
      <SRightBlock>
        <SItemWithMargin>
          <SearchInput />
        </SItemWithMargin>
        <SItemWithMargin>
          {user.loggedIn ? (
            <UserAvatar
              withClick
              user={user}
              onClick={handleUserClick}
            />
          ) : (
            <SButton
              iconOnly
              noHover
              noRipple
              view="secondary"
              onClick={handleSignInClick}
            >
              <InlineSVG
                svg={userIcon}
                fill={theme.colorsThemed.text.primary}
                width="20px"
                height="20px"
              />
            </SButton>
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
  margin-left: 16px;

  ${(props) => props.theme.media.tablet} {
    margin-left: 24px;
  }

  ${(props) => props.theme.media.laptop} {
    margin-left: 16px;
  }
`;

const LogoHolder = styled.div`
  cursor: pointer;
`;

const SButton = styled(Button)`
  border-radius: 12px;
`;
