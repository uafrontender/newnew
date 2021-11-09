import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';
import UserAvatar from '../UserAvatar';
import SearchInput from '../../atoms/SearchInput';
import NavigationItem from '../NavigationItem';

import { useAppSelector } from '../../../redux-store/store';

import tabletLogo from '../../../public/images/svg/tablet-logo.svg';

interface IDesktop {
}

export const Desktop: React.FC<IDesktop> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
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
      <Link href="/">
        <a>
          <InlineSVG
            svg={tabletLogo}
            fill={theme.colorsThemed.text.primary}
            width="152px"
            height="32px"
          />
        </a>
      </Link>
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
                    bg={theme.colorsThemed.grayscale.background2}
                    onClick={handleDashboardClick}
                    titleColor={theme.colorsThemed.text.primary}
                  >
                    {t('button-dashboard')}
                  </Button>
                </SItemWithMargin>
                <SItemWithMargin>
                  <Button
                    bs={theme.shadows.mediumBlue}
                    bg={theme.gradients.blueDiagonal}
                    onClick={handleCreateClick}
                  >
                    {t('button-create-decision')}
                  </Button>
                </SItemWithMargin>
                <SItemWithMargin>
                  <UserAvatar
                    user={user}
                    onClick={handleUserClick}
                  />
                </SItemWithMargin>
              </>
            ) : (
              <>
                <SItemWithMargin>
                  <Button
                    bs={theme.shadows.mediumBlue}
                    bg={theme.gradients.blueDiagonal}
                    onClick={handleCreateClick}
                  >
                    {t('button-create-on-newnew')}
                  </Button>
                </SItemWithMargin>
                <SItemWithMargin>
                  <UserAvatar
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
                bg={theme.colorsThemed.grayscale.background2}
                onClick={handleSignInClick}
                titleColor={theme.colorsThemed.text.primary}
              >
                {t('button-login-in')}
              </Button>
            </SItemWithMargin>
            <SItemWithMargin>
              <Button
                bs={theme.shadows.mediumBlue}
                bg={theme.gradients.blueDiagonal}
                onClick={handleSignUpClick}
              >
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

  a {
    text-decoration: none;
  }
`;
