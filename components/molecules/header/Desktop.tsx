import React, { useCallback, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import Logo from '../Logo';
import Button from '../../atoms/Button';
import Text from '../../atoms/Text';
import UserAvatar from '../UserAvatar';
import NavigationItem from '../NavigationItem';

import { useAppSelector } from '../../../redux-store/store';
import { useGetChats } from '../../../contexts/chatContext';
import { useNotifications } from '../../../contexts/notificationsContext';
import { Mixpanel } from '../../../utils/mixpanel';
import { useBundles } from '../../../contexts/bundlesContext';
import VoteIconLight from '../../../public/images/decision/vote-icon-light.png';
import VoteIconDark from '../../../public/images/decision/vote-icon-dark.png';
import StaticSearchInput from '../../atoms/search/StaticSearchInput';
import { useAppState } from '../../../contexts/appStateContext';
import canBecomeCreator from '../../../utils/canBecomeCreator';
import { useGetAppConstants } from '../../../contexts/appConstantsContext';

export const Desktop: React.FC = () => {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppState();
  const theme = useTheme();
  const { appConstants } = useGetAppConstants();

  const isDesktopL = ['laptopL', 'desktop'].includes(resizeMode);

  const { unreadCount } = useGetChats();
  const { unreadNotificationCount } = useNotifications();
  const { bundles, directMessagesAvailable } = useBundles();

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

      Mixpanel.track('Copy My Link', {
        _stage: 'Header',
      });

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
  }, [user.userData?.username]);

  return (
    <SContainer>
      <Logo isShort={!isDesktopL} />
      <SRightBlock>
        {user.loggedIn && user.userData?.options?.isCreator && (
          <SItemWithMargin style={{ paddingRight: isDesktopL ? 16 : 0 }}>
            <SNavText variant={3} weight={600} onClick={handlerCopy}>
              {isCopiedUrl ? t('myLink.copied') : t('myLink.copy')}
            </SNavText>
          </SItemWithMargin>
        )}
        <SItemWithMargin>
          <StaticSearchInput
            width={
              user.userData?.options?.isCreator &&
              bundles &&
              bundles.length > 0 &&
              !isDesktopL
                ? '250px'
                : undefined
            }
          />
        </SItemWithMargin>
        {user.loggedIn && (
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

        {user.loggedIn ? (
          <>
            {user.userData?.options?.isCreator && (
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
            {user.userData?.options?.isCreator && (
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
