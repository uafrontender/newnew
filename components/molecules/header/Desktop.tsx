import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import Logo from '../Logo';
import Button from '../../atoms/Button';
import Text from '../../atoms/Text';
import UserAvatar from '../UserAvatar';
import NavigationItem from '../NavigationItem';

import { useAppSelector } from '../../../redux-store/store';
import { useChatsUnreadMessages } from '../../../contexts/chatsUnreadMessagesContext';
import { useNotifications } from '../../../contexts/notificationsContext';
import { Mixpanel } from '../../../utils/mixpanel';
import { useBundles } from '../../../contexts/bundlesContext';
import VoteIconLight from '../../../public/images/decision/vote-icon-light.png';
import VoteIconDark from '../../../public/images/decision/vote-icon-dark.png';
import StaticSearchInput from '../../atoms/search/StaticSearchInput';
import { useAppState } from '../../../contexts/appStateContext';
import canBecomeCreator from '../../../utils/canBecomeCreator';
import { useGetAppConstants } from '../../../contexts/appConstantsContext';
import ShareMenu from '../../organisms/ShareMenu';

export const Desktop: React.FC = () => {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.user);
  const { userLoggedIn, userIsCreator, resizeMode } = useAppState();
  const theme = useTheme();
  const { appConstants } = useGetAppConstants();

  const isDesktopL = ['laptopL', 'desktop'].includes(resizeMode);

  const { unreadCount } = useChatsUnreadMessages();
  const { unreadNotificationCount } = useNotifications();
  const { bundles, directMessagesAvailable } = useBundles();

  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  const handleOpenShareMenu = () => {
    setShareMenuOpen(true);
  };

  const handleCloseShareMenu = () => {
    setShareMenuOpen(false);
  };

  return (
    <SContainer>
      <Logo isShort={!isDesktopL} />
      <SRightBlock>
        {userLoggedIn && userIsCreator && (
          <SItemWithMargin style={{ paddingRight: isDesktopL ? 16 : 0 }}>
            <SNavText variant={3} weight={600} onClick={handleOpenShareMenu}>
              {t('myLink.shareLink')}
            </SNavText>
            {shareMenuOpen ? (
              <SShareMenu absolute handleClose={handleCloseShareMenu} />
            ) : null}
          </SItemWithMargin>
        )}
        <SItemWithMargin>
          <StaticSearchInput
            width={
              userIsCreator && bundles && bundles.length > 0 && !isDesktopL
                ? '250px'
                : undefined
            }
          />
        </SItemWithMargin>
        {userLoggedIn && (
          <>
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

        {userLoggedIn ? (
          <>
            {userIsCreator && (
              <SItemWithMargin>
                <Link href='/creator/dashboard'>
                  <a>
                    <Button
                      id='dashboard'
                      view='quaternary'
                      onClick={() => {
                        Mixpanel.track('Navigation Item Clicked', {
                          _button: 'Dashboard',
                          _target: '/creator/dashboard',
                        });
                      }}
                    >
                      {t('button.dashboard')}
                    </Button>
                  </a>
                </Link>
              </SItemWithMargin>
            )}
            {bundles && bundles.length > 0 && (
              <SItemWithMargin>
                <Link href='/bundles'>
                  <a>
                    <SButton
                      id='bundles'
                      view='quaternary'
                      onClick={() => {
                        Mixpanel.track('Navigation Item Clicked', {
                          _button: 'Bundles',
                          _target: '/bundles',
                        });
                      }}
                    >
                      <SButtonContent>
                        <SBundleIcon
                          src={
                            theme.name === 'light'
                              ? VoteIconLight.src
                              : VoteIconDark.src
                          }
                        />
                        {t('button.bundles')}
                      </SButtonContent>
                    </SButton>
                  </a>
                </Link>
              </SItemWithMargin>
            )}
            {userIsCreator && (
              <>
                <SItemWithMargin>
                  <Link href='/creation'>
                    <a>
                      <Button
                        id='create'
                        withShadow
                        view='primaryGrad'
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
                  <Link href='/profile/my-posts'>
                    <a>
                      <UserAvatar
                        withClick
                        avatarUrl={user.userData?.avatarUrl}
                        onClick={() => {
                          Mixpanel.track('My Avatar Clicked', {
                            _target: '/profile/my-posts',
                          });
                        }}
                      />
                    </a>
                  </Link>
                </SItemWithMargin>
              </>
            )}
            {!userIsCreator && (
              <>
                {canBecomeCreator(
                  user.userData?.dateOfBirth,
                  appConstants.minCreatorAgeYears
                ) && (
                  <SItemWithMargin>
                    <Link href='/creator-onboarding'>
                      <a>
                        <Button
                          withDim
                          withShadow
                          withShrink
                          view='primaryGrad'
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
                    <a id='profile-link'>
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
                    id='log-in'
                    view='quaternary'
                    onClick={() => {
                      Mixpanel.track('Navigation Item Clicked', {
                        _button: 'Sign in',
                        _target: '/sign-up',
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
                    id='log-in-to-create'
                    withDim
                    withShrink
                    withShadow
                    view='primaryGrad'
                    onClick={() => {
                      Mixpanel.track('Navigation Item Clicked', {
                        _button: 'Create now',
                        _target: '/sign-up?to=create',
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
  margin-left: 12px;
  position: relative;

  ${({ theme }) => theme.media.laptopL} {
    margin-left: 16px;
  }
`;

const SNavText = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  transition: opacity ease 0.5s;
  cursor: pointer;
  white-space: nowrap;
`;

const SButton = styled(Button)`
  padding: 12px 16px;
`;

const SButtonContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const SBundleIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 4px;
`;

const SShareMenu = styled(ShareMenu)`
  right: -2px;
  left: unset;
  top: 30px;
  z-index: 201;

  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.quaternary};
`;
