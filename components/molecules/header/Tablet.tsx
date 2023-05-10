import React, { useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import Link from 'next/link';

import Logo from '../Logo';
import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';
import UserAvatar from '../UserAvatar';
import Text from '../../atoms/Text';
import NavigationItem from '../NavigationItem';
import StaticSearchInput from '../../atoms/search/StaticSearchInput';

import { useChatsUnreadMessages } from '../../../contexts/chatsUnreadMessagesContext';
import { useAppSelector } from '../../../redux-store/store';

import menuIcon from '../../../public/images/svg/icons/outlined/Menu.svg';
import MoreMenuTablet from '../../organisms/MoreMenuTablet';
import { useNotifications } from '../../../contexts/notificationsContext';
import { Mixpanel } from '../../../utils/mixpanel';
import { useBundles } from '../../../contexts/bundlesContext';
import VoteIconLight from '../../../public/images/decision/vote-icon-light.png';
import VoteIconDark from '../../../public/images/decision/vote-icon-dark.png';
import canBecomeCreator from '../../../utils/canBecomeCreator';
import { useGetAppConstants } from '../../../contexts/appConstantsContext';
import { useAppState } from '../../../contexts/appStateContext';

export const Tablet: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { unreadCount } = useChatsUnreadMessages();
  const user = useAppSelector((state) => state.user);
  const { globalSearchActive } = useAppSelector((state) => state.ui);
  const { resizeMode } = useAppState();

  const { unreadNotificationCount } = useNotifications();
  const { bundles, directMessagesAvailable } = useBundles();
  const { appConstants } = useGetAppConstants();

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleMenuClick = () => setMoreMenuOpen(!moreMenuOpen);

  const isLaptop = ['laptop'].includes(resizeMode);

  const searchInputWidth = useMemo(() => {
    if (user.userData?.options?.isCreator && isLaptop) {
      return '290px';
    }

    if (user.userData?.options?.isCreator) {
      return '220px';
    }

    return undefined;
  }, [isLaptop, user.userData?.options?.isCreator]);

  return (
    <SContainer>
      <Logo isShort style={{ flexShrink: 0 }} />
      <SRightBlock>
        {!user.loggedIn && <StaticSearchInput />}
        {user.loggedIn && (
          <>
            {user.userData?.options?.isCreator && (
              <Link href='/creator/dashboard'>
                <a>
                  <SDashboardButton
                    onClick={() => {
                      Mixpanel.track('Navigation Item Clicked', {
                        _button: 'Dashboard',
                        _target: '/creator/dashboard',
                      });
                    }}
                  >
                    <SNavText variant={3} weight={600}>
                      {t('button.dashboard')}
                    </SNavText>
                  </SDashboardButton>
                </a>
              </Link>
            )}
            <SItemWithMargin
              style={{
                position: 'static',
              }}
            >
              <SStaticSearchInput width={searchInputWidth} />
            </SItemWithMargin>
            {bundles && bundles.length > 0 && (
              <SItemWithMargin>
                <Link href='/bundles'>
                  <a>
                    <Button
                      iconOnly
                      view='quaternary'
                      onClick={() => {
                        Mixpanel.track('Navigation Item Clicked', {
                          _button: 'Bundles',
                          _target: '/bundles',
                        });
                      }}
                    >
                      <SIconButtonContent>
                        <SBundleIcon
                          src={
                            theme.name === 'light'
                              ? VoteIconLight.src
                              : VoteIconDark.src
                          }
                        />
                      </SIconButtonContent>
                    </Button>
                  </a>
                </Link>
              </SItemWithMargin>
            )}
            {directMessagesAvailable && (
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
          </>
        )}

        {user.loggedIn ? (
          <>
            {user.userData?.options?.isCreator && (
              <>
                <SItemWithMargin>
                  <Link href='/creation'>
                    <a>
                      <Button
                        view='primaryGrad'
                        withShadow={!globalSearchActive}
                        onClick={() => {
                          Mixpanel.track('Navigation Item Clicked', {
                            _button: 'New Post',
                            _target: '/creation',
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
            )}
            {!user.userData?.options?.isCreator && (
              <>
                {canBecomeCreator(
                  user.userData?.dateOfBirth,
                  appConstants.minCreatorAgeYears
                ) && (
                  <SItemWithMargin>
                    <Link href='/creator-onboarding'>
                      <a>
                        <Button
                          view='primaryGrad'
                          withShadow={!globalSearchActive}
                          onClick={() => {
                            Mixpanel.track('Navigation Item Clicked', {
                              _button: 'Create now',
                              _target: '/creator-onboarding',
                            });
                          }}
                        >
                          {t('button.createOnNewnew')}
                        </Button>
                      </a>
                    </Link>
                  </SItemWithMargin>
                )}
                <SItemWithMargin>
                  <Link href='/profile'>
                    <a>
                      <UserAvatar
                        withClick
                        avatarUrl={user.userData?.avatarUrl}
                        onClick={() => {
                          Mixpanel.track('My Avatar Clicked', {
                            _target: '/profile',
                          });
                        }}
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
                  <Button
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
                    view='primaryGrad'
                    withShadow={!globalSearchActive}
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
  margin-left: 6px;
  position: relative;

  ${({ theme }) => theme.media.laptop} {
    margin-left: 16px;
  }
`;

const SIconButtonContent = styled.div`
  display: flex;
`;

const SBundleIcon = styled.img`
  width: 24px;
  height: 24px;
`;

const SNavText = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  transition: opacity ease 0.5s;
  cursor: pointer;
`;

const SDashboardButton = styled.button`
  padding: 8px 16px;
  background: transparent;
  border: 0;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  &:focus {
    outline: none;
  }
`;

const SStaticSearchInput = styled(StaticSearchInput)``;
