import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import Logo from '../Logo';
import Button from '../../atoms/Button';
import Text from '../../atoms/Text';
import UserAvatar from '../UserAvatar';
import SearchInput from '../../atoms/search/SearchInput';
import NavigationItem from '../NavigationItem';

import { useAppSelector } from '../../../redux-store/store';
// import { WalletContext } from '../../../contexts/walletContext';
import { useGetChats } from '../../../contexts/chatContext';
import ShareMenu from '../../organisms/ShareMenu';
import { useNotifications } from '../../../contexts/notificationsContext';

export const Desktop: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.user);
  const { globalSearchActive } = useAppSelector((state) => state.ui);

  const { unreadCount } = useGetChats();
  const { unreadNotificationCount } = useNotifications();
  // const { walletBalance, isBalanceLoading } = useContext(WalletContext);

  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  const handleShareMenuClick = () => setShareMenuOpen(!shareMenuOpen);

  return (
    <SContainer>
      <Logo />
      <SRightBlock>
        {user.loggedIn && !globalSearchActive && (
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
                    key: 'my-balance',
                    value:
                      walletBalance && walletBalance?.usdCents !== undefined
                        ? parseInt((walletBalance.usdCents / 100).toFixed(0)) ??
                          0
                        : undefined,
                  }}
                />
              </SItemWithMargin>
            )} */}
          </>
        )}
        {user.loggedIn && (
          <SItemWithMargin>
            <SearchInput />
          </SItemWithMargin>
        )}
        {user.loggedIn ? (
          <>
            {user.userData?.options?.isCreator ? (
              <>
                <SItemWithMargin>
                  <Link href='/creator/dashboard'>
                    <a>
                      <Button view='quaternary'>{t('button-dashboard')}</Button>
                    </a>
                  </Link>
                </SItemWithMargin>
                <SItemWithMargin>
                  <Link
                    href={
                      !user.userData?.options?.isCreator
                        ? '/creator-onboarding'
                        : '/creation'
                    }
                  >
                    <a>
                      <Button withShadow view='primaryGrad'>
                        {t('button-create-decision')}
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
                      <Button withDim withShadow withShrink view='primaryGrad'>
                        {t('button-create-on-newnew')}
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
                  <Button withDim withShrink withShadow view='primaryGrad'>
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
});

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
  margin-left: 16px;
  position: relative;
`;

const SNavText = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  opacity: 0.5;
  transition: opacity ease 0.5s;
  cursor: pointer;
`;
