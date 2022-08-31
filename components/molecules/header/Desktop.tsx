import React, { useCallback, useContext, useState } from 'react';
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
import { RewardContext } from '../../../contexts/rewardContext';
import { useGetChats } from '../../../contexts/chatContext';
import { useNotifications } from '../../../contexts/notificationsContext';
import { useGetSubscriptions } from '../../../contexts/subscriptionsContext';
import { useGetAppConstants } from '../../../contexts/appConstantsContext';
import RewardButton from '../RewardButton';
import { Mixpanel } from '../../../utils/mixpanel';

export const Desktop: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.user);

  const { unreadCount } = useGetChats();
  const { unreadNotificationCount } = useNotifications();
  const { globalSearchActive } = useAppSelector((state) => state.ui);
  // const { walletBalance, isBalanceLoading } = useContext(WalletContext);
  const { rewardBalance, isRewardBalanceLoading } = useContext(RewardContext);
  const { currentSignupRewardAmount } = useGetAppConstants().appConstants;
  const { creatorsImSubscribedTo, mySubscribersTotal } = useGetSubscriptions();

  const [isCopiedUrl, setIsCopiedUrl] = useState(false);

  async function copyPostUrlToClipboard(url: string) {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
    } else {
      document.execCommand('copy', true, url);
    }
  }

  const handlerCopy = useCallback(() => {
    if (window) {
      const url = `${window.location.origin}/${user.userData?.username}`;

      copyPostUrlToClipboard(url)
        .then(() => {
          setIsCopiedUrl(true);
          setTimeout(() => {
            setIsCopiedUrl(false);
          }, 1500);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SContainer>
      <Logo />
      <SRightBlock>
        {user.loggedIn && !globalSearchActive && (
          <>
            {user.userData?.options?.isCreator && (
              <SItemWithMargin style={{ paddingRight: 16 }}>
                <SNavText variant={3} weight={600} onClick={handlerCopy}>
                  {isCopiedUrl ? t('myLink.copied') : t('myLink.copy')}
                </SNavText>
              </SItemWithMargin>
            )}
            {((user.userData?.options?.isOfferingSubscription &&
              mySubscribersTotal > 0) ||
              creatorsImSubscribedTo.length > 0) && (
              <SItemWithMargin>
                <NavigationItem
                  item={{
                    url: '/direct-messages',
                    key: 'directMessages',
                    counter: unreadCount,
                  }}
                />
              </SItemWithMargin>
            )}
            <SItemWithMargin>
              <NavigationItem
                item={{
                  url: '/notifications',
                  key: 'notifications',
                  counter: unreadNotificationCount,
                }}
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
        <SItemWithMargin>
          <SearchInput />
        </SItemWithMargin>
        {user.loggedIn ? (
          <>
            {user.userData?.options?.isCreator ? (
              <>
                <SItemWithMargin>
                  <Link href='/creator/dashboard'>
                    <a>
                      <Button
                        view='quaternary'
                        onClick={() => {
                          Mixpanel.track('Navigation Item Clicked', {
                            _button: 'Dashboard',
                          });
                        }}
                      >
                        {t('button.dashboard')}
                      </Button>
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
                      <Button
                        id='create'
                        withShadow
                        view='primaryGrad'
                        onClick={() => {
                          Mixpanel.track('Navigation Item Clicked', {
                            _button: 'New Post',
                          });
                        }}
                      >
                        {t('button.createDecision')}
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
                        {t('button.createOnNewnew')}
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
            <SItemWithMargin>
              <RewardButton
                balance={
                  rewardBalance ? rewardBalance.usdCents / 100 : undefined
                }
                loading={isRewardBalanceLoading}
              />
            </SItemWithMargin>
          </>
        ) : (
          <>
            <SItemWithMargin>
              <Link href='/sign-up'>
                <a>
                  <Button
                    id='log-in'
                    view='quaternary'
                    onClick={() => {
                      Mixpanel.track('Navigation Item Clicked', {
                        _button: 'Sign in',
                      });
                    }}
                  >
                    {t('button.signIn')}
                  </Button>
                </a>
              </Link>
            </SItemWithMargin>
            <SItemWithMargin>
              <Link href='/sign-up?to=create'>
                <a>
                  <Button
                    withDim
                    withShrink
                    withShadow
                    view='primaryGrad'
                    onClick={() => {
                      Mixpanel.track('Navigation Item Clicked', {
                        _button: 'Create now',
                      });
                    }}
                  >
                    {t('button.createOnNewnew')}
                  </Button>
                </a>
              </Link>
            </SItemWithMargin>
            {currentSignupRewardAmount ? (
              <SItemWithMargin>
                <RewardButton
                  balance={
                    currentSignupRewardAmount.usdCents
                      ? currentSignupRewardAmount.usdCents / 100
                      : undefined
                  }
                  offer
                />
              </SItemWithMargin>
            ) : null}
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
