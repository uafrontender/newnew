import React, { useCallback, useContext, useState } from 'react';
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
import { useNotifications } from '../../../contexts/notificationsContext';
import { useGetSubscriptions } from '../../../contexts/subscriptionsContext';
import RewardButton from '../RewardButton';
import { RewardContext } from '../../../contexts/rewardContext';
import { useGetAppConstants } from '../../../contexts/appConstantsContext';
import { Mixpanel } from '../../../utils/mixpanel';

interface ITablet {}

export const Tablet: React.FC<ITablet> = React.memo(() => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { unreadCount } = useGetChats();
  const user = useAppSelector((state) => state.user);
  const { globalSearchActive } = useAppSelector((state) => state.ui);
  const { unreadNotificationCount } = useNotifications();
  const { creatorsImSubscribedTo, mySubscribersTotal } = useGetSubscriptions();

  // const { walletBalance, isBalanceLoading } = useContext(WalletContext);
  const { rewardBalance } = useContext(RewardContext);
  const { currentSignupRewardAmount } = useGetAppConstants().appConstants;

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleMenuClick = () => setMoreMenuOpen(!moreMenuOpen);

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
        {user.loggedIn && (
          <>
            {user.userData?.options?.isOfferingSubscription && (
              <SItemWithMargin>
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
        <SItemWithMargin
          style={{
            position: 'static',
          }}
        >
          <SearchInput />
        </SItemWithMargin>
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
                        onClick={() => {
                          Mixpanel.track('Navigation Item Clicked ', {
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
                  rewardBalance?.usdCents
                    ? rewardBalance.usdCents / 100 || 0
                    : 0
                }
              />
            </SItemWithMargin>
          </>
        ) : (
          <>
            <SItemWithMargin>
              <Link href='/sign-up?to=log-in'>
                <a>
                  <Button view='quaternary'>{t('button.loginIn')}</Button>
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
                    {t('button.signUp')}
                  </Button>
                </a>
              </Link>
            </SItemWithMargin>
            {currentSignupRewardAmount ? (
              <SItemWithMargin>
                <RewardButton balance={currentSignupRewardAmount} offer />
              </SItemWithMargin>
            ) : null}
          </>
        )}
      </SRightBlock>
    </SContainer>
  );
});

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
