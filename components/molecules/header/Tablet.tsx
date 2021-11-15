import React from 'react';
import { scroller } from 'react-scroll';
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

import { SCROLL_TO_TOP } from '../../../constants/timings';

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
      {user.loggedIn ? (
        <InlineSVG
          clickable
          svg={mobileLogo}
          fill={theme.colorsThemed.text.primary}
          width="48px"
          height="48px"
          onClick={handleLogoClick}
        />
      ) : (
        <InlineSVG
          clickable
          svg={tabletLogo}
          fill={theme.colorsThemed.text.primary}
          width="152px"
          height="48px"
          onClick={handleLogoClick}
        />
      )}
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
                        onClick={handleCreateClick}
                      >
                        {t('button-create-decision')}
                      </Button>
                    </SItemWithMargin>
                    <SItemWithMargin>
                      <Button
                        iconOnly
                        size="lg"
                        onClick={handleMenuClick}
                      >
                        <InlineSVG
                          svg={menuIcon}
                          fill={theme.colorsThemed.text.primary}
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
                        onClick={handleCreateClick}
                      >
                        {t('button-create')}
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
                    view="secondary"
                    onClick={handleSignInClick}
                  >
                    {t('button-login-in')}
                  </Button>
                </SItemWithMargin>
                <SItemWithMargin>
                  <Button
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
  padding: 12px 0;
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
