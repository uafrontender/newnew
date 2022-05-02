import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Logo from '../Logo';
import Button from '../../atoms/Button';
import Text from '../../atoms/Text';
import UserAvatar from '../UserAvatar';
import SearchInput from '../../atoms/search/SearchInput';
import NavigationItem from '../NavigationItem';

import { useAppSelector } from '../../../redux-store/store';
import { WalletContext } from '../../../contexts/walletContext';
import { useGetChats } from '../../../contexts/chatContext';
import ShareMenu from '../../organisms/ShareMenu';

interface IDesktop {}

export const Desktop: React.FC<IDesktop> = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const { globalSearchActive } = useAppSelector((state) => state.ui);

  const { unreadCount } = useGetChats();
  const { walletBalance, isBalanceLoading } = useContext(WalletContext);

  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  const handleShareMenuClick = () => setShareMenuOpen(!shareMenuOpen);

  const handleCreateClick = () => {
    if (!user.userData?.options?.isCreator) {
      router.push('/creator-onboarding');
    } else {
      router.push('/creation');
    }
  };
  const handleDashboardClick = () => {
    router.push('/creator/dashboard');
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
        {user.loggedIn && !globalSearchActive && (
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
            {user.userData?.options?.isCreator && !isBalanceLoading && (
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
            )}
          </>
        )}
        {user.loggedIn && user.userData?.options?.isCreator && (
          <SItemWithMargin>
            <SearchInput />
          </SItemWithMargin>
        )}
        {user.loggedIn ? (
          <>
            {user.userData?.options?.isCreator ? (
              <>
                <SItemWithMargin>
                  <Button view='quaternary' onClick={handleDashboardClick}>
                    {t('button-dashboard')}
                  </Button>
                </SItemWithMargin>
                <SItemWithMargin>
                  <Button
                    withShadow
                    view='primaryGrad'
                    onClick={handleCreateClick}
                  >
                    {t('button-create-decision')}
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
            ) : (
              <>
                <SItemWithMargin>
                  <Button
                    withDim
                    withShadow
                    withShrink
                    view='primaryGrad'
                    onClick={handleCreateClick}
                  >
                    {t('button-create-on-newnew')}
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
              <Button view='quaternary' onClick={handleSignInClick}>
                {t('button-login-in')}
              </Button>
            </SItemWithMargin>
            <SItemWithMargin>
              <Button
                withDim
                withShrink
                withShadow
                view='primaryGrad'
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
  margin-left: 16px;
  position: relative;
`;

const SNavText = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  opacity: 0.5;
  transition: opacity ease 0.5s;
  cursor: pointer;
`;
