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

import menuIcon from '../../../public/images/svg/icons/outlined/Menu.svg';
import mobileLogo from '../../../public/images/svg/mobile-logo.svg';
import tabletLogo from '../../../public/images/svg/tablet-logo.svg';

interface ITablet {
}

export const Tablet: React.FC<ITablet> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const { globalSearchActive } = useAppSelector((state) => state.ui);

  const handleMenuClick = () => {
  };
  const handleCreateClick = () => {
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
          {user.loggedIn ? (
            <InlineSVG
              svg={mobileLogo}
              fill={theme.colorsThemed.appIcon}
              width="48px"
              height="48px"
            />
          ) : (
            <InlineSVG
              svg={tabletLogo}
              fill={theme.colorsThemed.appIcon}
              width="152px"
              height="48px"
            />
          )}
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
        {!globalSearchActive && (
          <>
            {user.loggedIn ? (
              <>
                {user.role === 'creator' ? (
                  <>
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
                      <Button
                        iconOnly
                        onClick={handleMenuClick}
                      >
                        <InlineSVG
                          svg={menuIcon}
                          fill={theme.colorsThemed.appIcon}
                          width="24px"
                          height="24px"
                        />
                      </Button>
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
                        {t('button-create')}
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
                    bg={theme.colorsThemed.appButtonSecondaryBG}
                    onClick={handleSignInClick}
                    titleColor={theme.colorsThemed.appButtonSecondary}
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
          </>
        )}
      </SRightBlock>
    </SContainer>
  );
};

export default Tablet;

const SContainer = styled.div`
  display: flex;
  padding: 12px 32px;
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
