import React from 'react';
import styled from 'styled-components';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';

import Logo from '../Logo';
import UserAvatar from '../UserAvatar';
import SearchInput from '../../atoms/SearchInput';

import { useAppSelector } from '../../../redux-store/store';

import { SCROLL_TO_TOP } from '../../../constants/timings';

interface IMobile {
}

export const Mobile: React.FC<IMobile> = () => {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  const handleUserClick = () => {
    if (user.loggedIn) {
      router.push('/profile');
    } else {
      router.push('/sign-up');
    }
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
          <UserAvatar
            withClick
            avatarUrl={user.userData?.avatarUrl}
            onClick={handleUserClick}
          />
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
