/* eslint-disable no-nested-ternary */
import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

import Logo from '../Logo';
import UserAvatar from '../UserAvatar';
import SearchInput from '../../atoms/search/SearchInput';
import { useAppSelector } from '../../../redux-store/store';

export const Mobile = () => {
  const user = useAppSelector((state) => state.user);

  return (
    <SContainer>
      <Logo />
      <SRightBlock>
        {user.loggedIn && user.userData?.options?.isCreator && (
          <SItemWithMargin>
            <SearchInput />
          </SItemWithMargin>
        )}
        <SItemWithMargin>
          <Link
            href={
              user.loggedIn
                ? user.userData?.options?.isCreator
                  ? '/profile/my-posts'
                  : '/profile'
                : '/sign-up'
            }
          >
            <a>
              <UserAvatar withClick avatarUrl={user.userData?.avatarUrl} />
            </a>
          </Link>
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
