import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Logo from '../Logo';
import Button from '../../atoms/Button';
import UserAvatar from '../UserAvatar';
import SearchInput from '../../atoms/SearchInput';
import NavigationItem from '../NavigationItem';

import { useAppSelector } from '../../../redux-store/store';

interface IDesktop {
}

export const Desktop: React.FC<IDesktop> = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  const handleCreateClick = () => {
  };
  const handleDashboardClick = () => {
    router.push('/dashboard');
  };
  const handleUserClick = () => {
    router.push('/profile');
  };
  const handleSignInClick = () => {
    router.push('/sign-up');
  };
  const handleSignUpClick = () => {
    router.push('/sign-up');
  };

  return (
    <SContainer>
      <Logo />
      <SRightBlock>
        {user.loggedIn && (
          <>
            <SItemWithMargin>
              <NavigationItem
                item={{
                  url: '/notifications',
                  key: 'notifications',
                  counter: user.notificationsCount,
                }}
              />
            </SItemWithMargin>
            <SItemWithMargin>
              <NavigationItem
                item={{
                  url: '/direct-messages',
                  key: 'direct-messages',
                  counter: user.directMessagesCount,
                }}
              />
            </SItemWithMargin>
            {user.role === 'creator' ? (
              <SItemWithMargin>
                <NavigationItem
                  item={{
                    url: '/share',
                    key: 'share',
                  }}
                />
              </SItemWithMargin>
            ) : (
              <SItemWithMargin>
                <NavigationItem
                  item={{
                    url: '/my-balance',
                    key: 'my-balance',
                    value: user.walletBalance,
                  }}
                />
              </SItemWithMargin>
            )}
          </>
        )}
        <SItemWithMargin>
          <SearchInput />
        </SItemWithMargin>
        {user.loggedIn ? (
          <>
            {user.role === 'creator' ? (
              <>
                <SItemWithMargin>
                  <Button
                    view="secondary"
                    onClick={handleDashboardClick}
                  >
                    {t('button-dashboard')}
                  </Button>
                </SItemWithMargin>
                <SItemWithMargin>
                  <Button onClick={handleCreateClick}>
                    {t('button-create-decision')}
                  </Button>
                </SItemWithMargin>
                <SItemWithMargin>
                  <UserAvatar
                    withClick
                    user={user}
                    onClick={handleUserClick}
                  />
                </SItemWithMargin>
              </>
            ) : (
              <>
                <SItemWithMargin>
                  <Button onClick={handleCreateClick}>
                    {t('button-create-on-newnew')}
                  </Button>
                </SItemWithMargin>
                <SItemWithMargin>
                  <UserAvatar
                    withClick
                    user={user}
                    onClick={handleUserClick}
                  />
                </SItemWithMargin>
              </>
            )}
          </>
        ) : (
          <>
            <SItemWithMargin>
              <Button
                noShadow
                view="secondary"
                onClick={handleSignInClick}
              >
                {t('button-login-in')}
              </Button>
            </SItemWithMargin>
            <SItemWithMargin>
              <Button onClick={handleSignUpClick}>
                {t('button-sign-up')}
              </Button>
            </SItemWithMargin>
          </>
        )}
      </SRightBlock>
    </SContainer>
  );
};

export default Desktop;

const SContainer = styled.div`
  display: flex;
  padding: 16px 0;
  align-items: center;
  justify-content: space-between;
`;

const SRightBlock = styled.nav`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const SItemWithMargin = styled.div`
  margin-left: 24px;
`;
