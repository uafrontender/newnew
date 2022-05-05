import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import Link from 'next/link';

import Logo from '../Logo';
import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';
import UserAvatar from '../UserAvatar';
import SearchInput from '../../atoms/search/SearchInput';
import Text from '../../atoms/Text';
import NavigationItem from '../NavigationItem';
import { useGetChats } from '../../../contexts/chatContext';

import { useAppSelector } from '../../../redux-store/store';
// import { WalletContext } from '../../../contexts/walletContext';

import menuIcon from '../../../public/images/svg/icons/outlined/Menu.svg';
import MoreMenuTablet from '../../organisms/MoreMenuTablet';
import ShareMenu from '../../organisms/ShareMenu';
import { useNotifications } from '../../../contexts/notificationsContext';

interface ITablet {}

export const Tablet: React.FC<ITablet> = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { unreadCount } = useGetChats();
  const user = useAppSelector((state) => state.user);
  const { globalSearchActive } = useAppSelector((state) => state.ui);
  const { unreadNotificationCount } = useNotifications();

  // const { walletBalance, isBalanceLoading } = useContext(WalletContext);

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  const handleMenuClick = () => setMoreMenuOpen(!moreMenuOpen);
  const handleShareMenuClick = () => setShareMenuOpen(!shareMenuOpen);

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
                  counter: unreadNotificationCount,
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
            <SItemWithMargin>
              <SNavText variant={3} weight={600} onClick={handleShareMenuClick}>
                Share
              </SNavText>
              <ShareMenu
                absolute
                isVisible={shareMenuOpen}
                handleClose={() => setShareMenuOpen(false)}
              />
            </SItemWithMargin>
            {/* {user.userData?.options?.isCreator && !isBalanceLoading && (
              <SItemWithMargin>
                <NavigationItem
                  item={{
                    url: '/profile/settings',
                    key: 'my-balance-tablet',
                    value: walletBalance?.usdCents
                      ? parseInt((walletBalance.usdCents / 100).toFixed(0)) ?? 0
                      : undefined,
                  }}
                />
              </SItemWithMargin>
            )} */}
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
                  <Link
                    href={
                      !user.userData?.options?.isCreator
                        ? '/creator-onboarding'
                        : '/creation'
                    }
                  >
                    <a>
                      <Button
                        view='primaryGrad'
                        withShadow={!globalSearchActive}
                      >
                        {t('button-create-decision')}
                      </Button>
                    </a>
                  </Link>
                </SItemWithMargin>
                <SItemWithMargin>
                  <Button iconOnly view='quaternary' onClick={handleMenuClick}>
                    <InlineSVG
                      svg={menuIcon}
                      fill={theme.colorsThemed.text.primary}
                      width='24px'
                      height='24px'
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
                  <Link
                    href={
                      !user.userData?.options?.isCreator
                        ? '/creator-onboarding'
                        : '/creation'
                    }
                  >
                    <a>
                      <Button
                        view='primaryGrad'
                        withShadow={!globalSearchActive}
                      >
                        {t('button-create')}
                      </Button>
                    </a>
                  </Link>
                </SItemWithMargin>
                <SItemWithMargin>
                  <Link
                    href={
                      user.userData?.options?.isCreator
                        ? '/profile/my-posts'
                        : '/profile'
                    }
                  >
                    <a>
                      <UserAvatar
                        withClick
                        avatarUrl={user.userData?.avatarUrl}
                      />
                    </a>
                  </Link>
                </SItemWithMargin>
              </>
            )}
          </>
        ) : (
          <>
            <SItemWithMargin>
              <Link href='/sign-up'>
                <a>
                  <Button view='quaternary'>{t('button-login-in')}</Button>
                </a>
              </Link>
            </SItemWithMargin>
            <SItemWithMargin>
              <Link href='/sign-up'>
                <a>
                  <Button
                    withDim
                    withShrink
                    view='primaryGrad'
                    withShadow={!globalSearchActive}
                  >
                    {t('button-sign-up')}
                  </Button>
                </a>
              </Link>
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

const SNavText = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  opacity: 0.5;
  transition: opacity ease 0.5s;
  cursor: pointer;
`;
