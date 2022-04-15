import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Logo from '../Logo';
import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';
import UserAvatar from '../UserAvatar';
import SearchInput from '../../atoms/search/SearchInput';
import NavigationItem from '../NavigationItem';
import { useGetChats } from '../../../contexts/chatContext';

import { useAppSelector } from '../../../redux-store/store';
import { WalletContext } from '../../../contexts/walletContext';

import menuIcon from '../../../public/images/svg/icons/outlined/Menu.svg';
import MoreMenuTablet from '../../organisms/MoreMenuTablet';

interface ITablet {}

export const Tablet: React.FC<ITablet> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { unreadCount } = useGetChats();
  const user = useAppSelector((state) => state.user);
  const { globalSearchActive } = useAppSelector((state) => state.ui);

  const { walletBalance, isBalanceLoading } = useContext(WalletContext);

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleMenuClick = () => setMoreMenuOpen(!moreMenuOpen);

  const handleCreateClick = () => {
    if (!user.userData?.options?.isCreator) {
      router.push('/creator-onboarding-stage-1');
    } else {
      router.push('/creation');
    }
  };
  const handleUserClick = () => {
    router.push(
      user.userData?.options?.isCreator ? '/profile/my-posts' : '/profile'
    );
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
            {user.loggedIn && (
              <SItemWithMargin>
                <NavigationItem
                  item={{
                    url: '/direct-messages',
                    key: 'direct-messages',
                    counter: unreadCount,
                  }}
                />
              </SItemWithMargin>
            )}
            {user.userData?.options?.isCreator ? (
              <>
                <SItemWithMargin>
                  <NavigationItem
                    item={{
                      url: '/share',
                      key: 'share',
                    }}
                  />
                </SItemWithMargin>
              </>
            ) : (
              <SItemWithMargin>
                <NavigationItem
                  item={{
                    url: '/my-balance',
                    key: 'my-balance',
                    value:
                      !isBalanceLoading && walletBalance?.usdCents
                        ? parseInt((walletBalance.usdCents / 100).toFixed(0)) ??
                          undefined
                        : undefined,
                  }}
                />
              </SItemWithMargin>
            )}
          </>
        )}
        {user.loggedIn && user.userData?.options?.isCreator && (
          <SItemWithMargin
            style={{
              position: 'static',
            }}
          >
            <SearchInput />
          </SItemWithMargin>
        )}
        {user.loggedIn ? (
          <>
            {user.userData?.options?.isCreator ? (
              <>
                <SItemWithMargin>
                  <Button
                    view="primaryGrad"
                    onClick={handleCreateClick}
                    withShadow={!globalSearchActive}
                  >
                    {t('button-create-decision')}
                  </Button>
                </SItemWithMargin>
                <SItemWithMargin>
                  <Button iconOnly view="quaternary" onClick={handleMenuClick}>
                    <InlineSVG
                      svg={menuIcon}
                      fill={theme.colorsThemed.text.primary}
                      width="24px"
                      height="24px"
                    />
                  </Button>
                  <MoreMenuTablet
                    isVisible={moreMenuOpen}
                    handleClose={() => setMoreMenuOpen(false)}
                  />
                </SItemWithMargin>
              </>
            ) : (
              <>
                <SItemWithMargin>
                  <Button
                    view="primaryGrad"
                    onClick={handleCreateClick}
                    withShadow={!globalSearchActive}
                  >
                    {t('button-create')}
                  </Button>
                </SItemWithMargin>
                <SItemWithMargin>
                  <UserAvatar
                    withClick
                    avatarUrl={user.userData?.avatarUrl}
                    onClick={handleUserClick}
                  />
                </SItemWithMargin>
              </>
            )}
          </>
        ) : (
          <>
            <SItemWithMargin>
              <Button view="quaternary" onClick={handleSignInClick}>
                {t('button-login-in')}
              </Button>
            </SItemWithMargin>
            <SItemWithMargin>
              <Button
                withDim
                withShrink
                view="primaryGrad"
                onClick={handleSignUpClick}
                withShadow={!globalSearchActive}
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
  margin-left: 16px;

  position: relative;
`;
