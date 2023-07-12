import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import Router from 'next/router';
import { newnewapi } from 'newnew-api';
import { useUpdateEffect } from 'react-use';

import { useUserData } from '../../contexts/userDataContext';

import Text from '../atoms/Text';
import Modal from '../organisms/Modal';
import Button from '../atoms/Button';
import General from './General';
import { Tab } from '../molecules/Tabs';
import Headline from '../atoms/Headline';
import InlineSvg from '../atoms/InlineSVG';
import ProfileTabs from '../molecules/profile/ProfileTabs';
import ProfileImage from '../molecules/profile/ProfileImage';
import ProfileBackground from '../molecules/profile/ProfileBackground';
import EditProfileMenu, { TEditingStage } from '../organisms/EditProfileMenu';

// Icons
import EditIcon from '../../public/images/svg/icons/filled/Edit.svg';
import SettingsIcon from '../../public/images/svg/icons/filled/Settings.svg';
import ShareIconFilled from '../../public/images/svg/icons/filled/Share.svg';
import BackButtonIcon from '../../public/images/svg/icons/filled/Back.svg';
import mockProfileBg from '../../public/images/mock/profile-bg.png';

import isBrowser from '../../utils/isBrowser';
import useSynchronizedHistory from '../../utils/hooks/useSynchronizedHistory';
import getGenderPronouns, {
  isGenderPronounsDefined,
} from '../../utils/genderPronouns';
import copyToClipboard from '../../utils/copyToClipboard';
import { Mixpanel } from '../../utils/mixpanel';
import { useAppState } from '../../contexts/appStateContext';
import DisplayName from '../atoms/DisplayName';
import { getMySpending as getMySpendingLimitLeft } from '../../api/endpoints/payments';
import { SocketContext } from '../../contexts/socketContext';
import useGoBackOrRedirect from '../../utils/useGoBackOrRedirect';

type TPageType =
  | 'activelyBidding'
  | 'purchases'
  | 'viewHistory'
  | 'myposts'
  | 'favorites';

interface IMyProfileLayout {
  renderedPage: TPageType;
  postsCachedActivelyBiddingOnFilter?: newnewapi.Post.Filter;
  postsCachedMyPurchasesFilter?: newnewapi.Post.Filter;
  postsCachedViewHistoryFilter?: newnewapi.Post.Filter;
  postsCachedFavoritesFilter?: newnewapi.Post.Filter;
  postsCachedMyPostsFilter?: newnewapi.Post.Filter;
  children: React.ReactNode;
}

const MyProfileLayout: React.FunctionComponent<IMyProfileLayout> = ({
  renderedPage,
  postsCachedActivelyBiddingOnFilter,
  postsCachedMyPurchasesFilter,
  postsCachedViewHistoryFilter,
  postsCachedFavoritesFilter,
  postsCachedMyPostsFilter,
  children,
}) => {
  const { t } = useTranslation('page-Profile');
  const theme = useTheme();
  const { userData } = useUserData();
  const { userLoggedIn, userIsCreator, resizeMode } = useAppState();
  const { socketConnection } = useContext(SocketContext);
  const { goBackOrRedirect } = useGoBackOrRedirect();
  const { syncedHistoryPushState, syncedHistoryReplaceState } =
    useSynchronizedHistory();

  const tabs: Tab[] = useMemo(
    () => [
      ...(userIsCreator
        ? [
            {
              nameToken: 'myposts',
              url: '/profile/my-posts',
            },
          ]
        : []),
      {
        nameToken: 'activelyBidding',
        url: '/profile',
      },
      {
        nameToken: 'purchases',
        url: '/profile/purchases',
      },
      {
        nameToken: 'viewHistory',
        url: '/profile/view-history',
      },
      {
        nameToken: 'favorites',
        url: '/profile/favorites',
      },
    ],
    [userIsCreator]
  );

  // Show skeleton on route change
  // const [routeChangeLoading, setRouteChangeLoading] = useState(false);

  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  // Share
  const [isCopiedUrl, setIsCopiedUrl] = useState(false);

  const handleCopyLink = useCallback(() => {
    if (window) {
      // TODO: What if data is not loaded yet
      const url = `${window.location.origin}/${userData?.username}`;

      copyToClipboard(url)
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
  }, [userData?.username]);

  // Filter
  const [postsActivelyBiddingOnFilter, setPostsActivelyBiddingOnFilter] =
    useState(postsCachedActivelyBiddingOnFilter ?? newnewapi.Post.Filter.ALL);

  const [postsMyPurchasesFilter, setPostsMyPurchasesFilter] = useState(
    postsCachedMyPurchasesFilter ?? newnewapi.Post.Filter.ALL
  );

  const [postsViewHistoryFilter, setPostsViewHistoryFilter] = useState(
    postsCachedViewHistoryFilter ?? newnewapi.Post.Filter.ALL
  );

  const [postsFavoritesFilter, setPostsFavoritesFilter] = useState(
    postsCachedFavoritesFilter ?? newnewapi.Post.Filter.ALL
  );

  const [postsMyPostsFilter, setPostsMyPostsFilter] = useState(
    postsCachedMyPostsFilter ?? newnewapi.Post.Filter.ALL
  );

  const handleUpdateFilter = useCallback(
    (value: newnewapi.Post.Filter) => {
      switch (renderedPage) {
        case 'activelyBidding': {
          setPostsActivelyBiddingOnFilter(value);
          break;
        }
        case 'purchases': {
          setPostsMyPurchasesFilter(value);
          break;
        }
        case 'viewHistory': {
          setPostsViewHistoryFilter(value);
          break;
        }
        case 'favorites': {
          setPostsFavoritesFilter(value);
          break;
        }
        case 'myposts': {
          setPostsMyPostsFilter(value);
          break;
        }
        default: {
          break;
        }
      }
    },
    [renderedPage]
  );

  const renderChildren = () => {
    let postsForPageFilter;

    switch (renderedPage) {
      case 'activelyBidding': {
        postsForPageFilter = postsActivelyBiddingOnFilter;
        break;
      }
      case 'purchases': {
        postsForPageFilter = postsMyPurchasesFilter;
        break;
      }
      case 'viewHistory': {
        postsForPageFilter = postsViewHistoryFilter;
        break;
      }
      case 'favorites': {
        postsForPageFilter = postsFavoritesFilter;
        break;
      }
      case 'myposts': {
        postsForPageFilter = postsMyPostsFilter;
        break;
      }
      default: {
        break;
      }
    }

    return React.cloneElement(children as ReactElement, {
      ...(postsForPageFilter ? { postsFilter: postsForPageFilter } : {}),
      handleUpdateFilter,
    });
  };

  // Edit Profile menu
  const [isEditProfileMenuOpen, setIsEditProfileMenuOpen] = useState(false);
  const [editingStage, setEditingStage] =
    useState<TEditingStage>('edit-general');
  const [wasModified, setWasModified] = useState(true);

  const handleSetWasModified = useCallback(
    (newState: boolean) => {
      setWasModified(newState);
    },
    [setWasModified]
  );

  const handleSettingsClicked = useCallback(() => {
    Router.push('/profile/settings');
  }, []);

  const handleCloseEditProfileMenu = useCallback(
    (preventGoBack = false) => {
      if (isBrowser() && !preventGoBack) {
        goBackOrRedirect('/');
      }
      setIsEditProfileMenuOpen(false);
    },
    [goBackOrRedirect, setIsEditProfileMenuOpen]
  );

  const handleOpenEditProfileMenu = () => {
    // Allow closing with browser back button
    if (isBrowser()) {
      syncedHistoryPushState(
        {
          stage: 'edit-general',
        },
        window.location.href
      );
    }
    setEditingStage('edit-general');
    setIsEditProfileMenuOpen(true);
  };

  const handleSetStageToEditingCoverPicture = () => {
    if (isBrowser()) {
      syncedHistoryPushState(
        {
          stage: 'edit-profile-cover',
        },
        window.location.href
      );
    }
    setEditingStage('edit-profile-cover');
  };

  const handleSetStageToEditingProfilePicture = () => {
    if (isBrowser()) {
      syncedHistoryPushState(
        {
          stage: 'edit-profile-picture',
        },
        window.location.href
      );
    }
    setEditingStage('edit-profile-picture');
  };

  const handleSetStageToEditingGeneral = () => {
    if (isBrowser()) {
      syncedHistoryReplaceState(
        {
          stage: 'edit-general',
        },
        window.location.href
      );
    }
    setEditingStage('edit-general');
  };

  const handleClosePreventDiscarding = useCallback(() => {
    if (!wasModified) {
      handleCloseEditProfileMenu();
      return;
    }

    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(t('editProfileMenu.confirmationWindow'));
    if (confirmed) {
      handleCloseEditProfileMenu();
    }
  }, [wasModified, handleCloseEditProfileMenu, t]);

  // Redirect to / if user is not logged in
  useUpdateEffect(() => {
    if (!userLoggedIn) {
      Router.replace('/');
    }
  }, [userLoggedIn]);

  // Try to pre-fetch the content
  useEffect(() => {
    Router.prefetch('/profile/settings');
  }, []);

  // Spending limit

  const [myLimitLeftInCents, setMyLimitLeftInCents] = useState<
    number | undefined
  >();

  useEffect(() => {
    if (userData?.options?.isWhiteListed) {
      (async () => {
        try {
          const payload = new newnewapi.GetMySpendingRequest();

          const res = await getMySpendingLimitLeft(payload);

          if (!res.data?.totalSpending?.usdCents || res.error) {
            throw new Error(res.error?.message ?? 'Request failed');
          }

          setMyLimitLeftInCents(res.data.totalSpending.usdCents);
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [userData?.options?.isWhiteListed]);

  // Test WS events, had a bug with the event data coming from finalized transactions only
  useEffect(() => {
    const handleMySpendingChanged = async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.MySpendingChanged.decode(arr);
      if (
        decoded?.totalSpending?.usdCents === undefined ||
        decoded.totalSpending.usdCents === null
      ) {
        return;
      }

      setMyLimitLeftInCents(decoded.totalSpending.usdCents);
    };

    if (socketConnection && userLoggedIn) {
      socketConnection?.on('MySpendingChanged', handleMySpendingChanged);
    }

    return () => {
      if (socketConnection && socketConnection?.connected && userLoggedIn) {
        socketConnection?.off('MySpendingChanged', handleMySpendingChanged);
      }
    };
  }, [socketConnection, userLoggedIn]);

  const myLimitLeftFormatted = useMemo(() => {
    if (myLimitLeftInCents === undefined) {
      return undefined;
    }

    if (myLimitLeftInCents < 0) {
      return 0;
    }

    const myLimitLeftInDollars = Math.floor(myLimitLeftInCents / 100);

    if (myLimitLeftInDollars < 10000) {
      return Math.floor(myLimitLeftInDollars / 1000);
    }

    return Math.floor(myLimitLeftInDollars / 10000) * 10;
  }, [myLimitLeftInCents]);

  return (
    <SGeneral restrictMaxWidth>
      <SMyProfileLayout>
        <ProfileBackground
          // Temp
          pictureURL={userData?.coverUrl ?? mockProfileBg.src}
        >
          <SButton
            view='transparent'
            withShrink
            withDim
            iconOnly={isMobileOrTablet}
            onClick={() => handleOpenEditProfileMenu()}
            onClickCapture={() => {
              Mixpanel.track('Click Edit Profile Button', {
                _stage: 'MyProfile',
                _component: 'MyProfileLayout',
              });
            }}
          >
            <InlineSvg
              svg={EditIcon}
              width={isMobileOrTablet ? '16px' : '24px'}
              height={isMobileOrTablet ? '16px' : '24px'}
            />
            {isMobileOrTablet ? null : t('profileLayout.headerButtons.edit')}
          </SButton>
          <SButton
            id='settings-button'
            view='transparent'
            withDim
            withShrink
            iconOnly={isMobileOrTablet}
            onClick={handleSettingsClicked}
            onClickCapture={() => {
              Mixpanel.track('Click Settings Button', {
                _stage: 'MyProfile',
                _component: 'MyProfileLayout',
              });
            }}
          >
            <InlineSvg
              svg={SettingsIcon}
              width={isMobileOrTablet ? '16px' : '24px'}
              height={isMobileOrTablet ? '16px' : '24px'}
            />
            {isMobileOrTablet
              ? null
              : t('profileLayout.headerButtons.settings')}
          </SButton>
        </ProfileBackground>
        <SButtonBack
          view='transparent'
          withDim
          withShrink
          iconOnly
          onClick={() => {
            goBackOrRedirect('/');
          }}
          onClickCapture={() => {
            Mixpanel.track('Click Back Button', {
              _stage: 'MyProfile',
              _component: 'MyProfileLayout',
            });
          }}
        >
          <InlineSvg svg={BackButtonIcon} width='24px' height='24px' />
        </SButtonBack>
        <ProfileImage src={userData?.avatarUrl} />
        <SUserData>
          <SUsernameWrapper>
            <SUsername variant={4}>
              <DisplayName user={userData} />
            </SUsername>
            {isGenderPronounsDefined(userData?.genderPronouns) && (
              <SGenderPronouns variant={2}>
                {t(
                  `genderPronouns.${
                    getGenderPronouns(userData?.genderPronouns!!).name
                  }` as any
                )}
              </SGenderPronouns>
            )}
          </SUsernameWrapper>
          <SShareDiv>
            <SUsernameButton
              view='tertiary'
              iconOnly
              style={{
                paddingTop: '8px',
                paddingBottom: '8px',
                paddingLeft: '16px',
                paddingRight: '16px',
              }}
              onClick={() => {}}
            >
              <SUsernameButtonText>
                @{/* Temp! */}
                {userData?.username && userData?.username.length > 12
                  ? `${userData?.username.substring(
                      0,
                      6
                    )}...${userData?.username.substring(
                      (userData?.username.length || 0) - 3
                    )}`
                  : userData?.username}
              </SUsernameButtonText>
            </SUsernameButton>
            <SShareButton
              view='tertiary'
              iconOnly
              withDim
              withShrink
              active={isCopiedUrl}
              onClick={() => handleCopyLink()}
              onClickCapture={() => {
                Mixpanel.track('Copy Own Link', {
                  _stage: 'MyProfile',
                  _component: 'MyProfileLayout',
                });
              }}
            >
              {isCopiedUrl ? (
                t('profileLayout.buttons.copied')
              ) : (
                <InlineSvg
                  svg={ShareIconFilled}
                  fill={theme.colorsThemed.text.primary}
                  width='20px'
                  height='20px'
                />
              )}
            </SShareButton>
          </SShareDiv>
          {userData?.bio ? (
            <SBioText variant={3}>{userData?.bio}</SBioText>
          ) : null}
        </SUserData>
        <ProfileTabs pageType='myProfile' tabs={tabs} />
        {myLimitLeftFormatted !== undefined && (
          <SSpending>{myLimitLeftFormatted}</SSpending>
        )}
        {/* Edit Profile modal menu */}
        <Modal
          show={isEditProfileMenuOpen}
          transitionspeed={isMobileOrTablet ? 0.15 : 0}
          onClose={handleClosePreventDiscarding}
        >
          {isEditProfileMenuOpen ? (
            <EditProfileMenu
              stage={editingStage}
              wasModified={wasModified}
              handleClose={handleCloseEditProfileMenu}
              handleSetWasModified={handleSetWasModified}
              handleClosePreventDiscarding={handleClosePreventDiscarding}
              handleSetStageToEditingProfilePicture={
                handleSetStageToEditingProfilePicture
              }
              handleSetStageToEditingCoverPicture={
                handleSetStageToEditingCoverPicture
              }
              handleSetStageToEditingGeneral={handleSetStageToEditingGeneral}
            />
          ) : null}
        </Modal>
      </SMyProfileLayout>
      {renderChildren()}
      {/* {!routeChangeLoading
          ? renderChildren() : (
            <CardSkeletonList
              count={8}
              wrapperStyle={{
                left: 0,
              }}
            />
          )} */}
    </SGeneral>
  );
};

MyProfileLayout.defaultProps = {
  postsCachedActivelyBiddingOnFilter: undefined,
  postsCachedMyPurchasesFilter: undefined,
  postsCachedViewHistoryFilter: undefined,
  postsCachedFavoritesFilter: undefined,
  postsCachedMyPostsFilter: undefined,
};

export default MyProfileLayout;

const SGeneral = styled(General)`
  position: relative;

  header {
    z-index: 6;
  }

  @media (max-width: 768px) {
    main {
      > div:first-child {
        padding-left: 0;
        padding-right: 0;

        > div:first-child {
          padding-left: 0;
          padding-right: 0;

          > div:first-child {
            padding-left: 0;
            padding-right: 0;
          }
        }
      }
    }
  }
`;

const SButton = styled(Button)`
  background: rgba(11, 10, 19, 0.1);
`;

const SButtonBack = styled(SButton)`
  position: absolute;
  top: 16px;
  left: 16px;

  ${(props) => props.theme.media.laptop} {
    top: 24px;
    left: 24px;
  }
`;

const SUserData = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  /* alignitems: center; */
`;

const SUsernameWrapper = styled.div`
  margin-left: 16px;
  margin-right: 16px;
  margin-bottom: 12px;
`;

const SUsername = styled(Headline)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SGenderPronouns = styled(Text)`
  text-align: center;
  font-weight: 400;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SShareDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  gap: 12px;

  margin-bottom: 16px;
`;

const SUsernameButton = styled(Button)`
  cursor: default;

  &:active:enabled,
  &:hover:enabled,
  &:focus:enabled {
    background: ${({ theme }) => theme.colorsThemed.background.primary};
  }
`;

const SUsernameButtonText = styled(Text)`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SShareButton = styled(Button)<{ active: boolean }>`
  padding: 8px;
  span {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }

  &:focus:enabled {
    background: ${(props) =>
      props.active
        ? undefined
        : props.theme.colorsThemed.button.background.tertiary};
  }
`;

const SBioText = styled(Text)`
  text-align: center;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  word-break: break-word;

  user-select: unset;

  padding-left: 16px;
  padding-right: 16px;
  margin: 0 auto 54px;

  max-width: 480px;
  width: 100%;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SMyProfileLayout = styled.div`
  position: relative;
  overflow: hidden;

  margin-top: -28px;
  margin-bottom: 24px;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  ${(props) => props.theme.media.tablet} {
    margin-top: -8px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  ${(props) => props.theme.media.laptop} {
    margin-top: -16px;
  }
`;

const SSpending = styled.div`
  position: absolute;
  bottom: 12px;
  right: 12px;
  color: transparent;
  cursor: default;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;

  :hover {
    opacity: 0.7;
    color: ${({ theme }) => (theme.name === 'light' ? '#D5DAE3;' : '#323444')};
  }
`;
