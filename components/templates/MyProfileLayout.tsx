import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';
import { useUpdateEffect } from 'react-use';

import { useAppSelector } from '../../redux-store/store';

import Text from '../atoms/Text';
import Modal from '../organisms/Modal';
import Button from '../atoms/Button';
import General from './General';
import { Tab } from '../molecules/Tabs';
import Headline from '../atoms/Headline';
import InlineSvg from '../atoms/InlineSVG';
import ProfileTabs from '../molecules/profile/ProfileTabs';
import ProfileImage from '../molecules/profile/ProfileImage';
import BackButton from '../molecules/profile/BackButton';
import ProfileBackground from '../molecules/profile/ProfileBackground';
import EditProfileMenu, { TEditingStage } from '../organisms/EditProfileMenu';

// Icons
import EditIcon from '../../public/images/svg/icons/filled/Edit.svg';
import SettingsIcon from '../../public/images/svg/icons/filled/Settings.svg';
import ShareIconFilled from '../../public/images/svg/icons/filled/Share.svg';

import isBrowser from '../../utils/isBrowser';
import useSynchronizedHistory from '../../utils/hooks/useSynchronizedHistory';
import getGenderPronouns, {
  isGenderPronounsDefined,
} from '../../utils/genderPronouns';
import VerificationCheckmark from '../../public/images/svg/icons/filled/Verification.svg';

type TPageType =
  | 'activelyBidding'
  | 'purchases'
  | 'viewHistory'
  | 'myposts'
  | 'favorites';

interface IMyProfileLayout {
  renderedPage: TPageType;
  postsCachedActivelyBiddingOn?: newnewapi.Post[];
  postsCachedActivelyBiddingOnFilter?: newnewapi.Post.Filter;
  postsCachedActivelyBiddingPageToken?: string | null | undefined;
  postsCachedActivelyBiddingCount?: number;
  postsCachedMyPurchases?: newnewapi.Post[];
  postsCachedMyPurchasesFilter?: newnewapi.Post.Filter;
  postsCachedMyPurchasesPageToken?: string | null | undefined;
  postsCachedMyPurchasesCount?: number;
  postsCachedViewHistory?: newnewapi.Post[];
  postsCachedViewHistoryFilter?: newnewapi.Post.Filter;
  postsCachedViewHistoryPageToken?: string | null | undefined;
  postsCachedViewHistoryCount?: number;
  postsCachedFavorites?: newnewapi.Post[];
  postsCachedFavoritesFilter?: newnewapi.Post.Filter;
  postsCachedFavoritesPageToken?: string | null | undefined;
  postsCachedFavoritesCount?: number;
  postsCachedMyPosts?: newnewapi.Post[];
  postsCachedMyPostsFilter?: newnewapi.Post.Filter;
  postsCachedMyPostsCount?: number;
  postsCachedMyPostsPageToken?: string | null | undefined;
  children: React.ReactNode;
}

const MyProfileLayout: React.FunctionComponent<IMyProfileLayout> = ({
  renderedPage,
  postsCachedActivelyBiddingOn,
  postsCachedActivelyBiddingOnFilter,
  postsCachedActivelyBiddingCount,
  postsCachedMyPurchases,
  postsCachedMyPurchasesFilter,
  postsCachedMyPurchasesCount,
  postsCachedViewHistory,
  postsCachedViewHistoryFilter,
  postsCachedViewHistoryCount,
  postsCachedFavorites,
  postsCachedFavoritesFilter,
  postsCachedFavoritesCount,
  postsCachedMyPosts,
  postsCachedMyPostsFilter,
  postsCachedMyPostsCount,
  postsCachedActivelyBiddingPageToken,
  postsCachedMyPurchasesPageToken,
  postsCachedViewHistoryPageToken,
  postsCachedFavoritesPageToken,
  postsCachedMyPostsPageToken,
  children,
}) => {
  const { t } = useTranslation('page-Profile');
  const theme = useTheme();
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const router = useRouter();
  const { syncedHistoryPushState, syncedHistoryReplaceState } =
    useSynchronizedHistory();

  const tabs: Tab[] = useMemo(
    () => [
      ...(user.userData?.options?.isCreator
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
    [user.userData?.options?.isCreator]
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

  async function copyPostUrlToClipboard(url: string) {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(url);
    } else {
      document.execCommand('copy', true, url);
    }
  }

  const handleCopyLink = useCallback(() => {
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
  }, [user.userData?.username]);

  // Cached posts
  const [postsActivelyBiddingOn, setPostsActivelyBiddingOn] = useState(
    postsCachedActivelyBiddingOn ?? []
  );
  const [postsActivelyBiddingOnFilter, setPostsActivelyBiddingOnFilter] =
    useState(postsCachedActivelyBiddingOnFilter ?? newnewapi.Post.Filter.ALL);
  const [activelyBiddingPageToken, setActivelyBiddingPageToken] = useState(
    postsCachedActivelyBiddingPageToken
  );
  const [activelyBiddingCount, setActivelyBiddingCount] = useState(
    postsCachedActivelyBiddingCount
  );

  const [postsMyPurchases, setPostsMyPurchases] = useState(
    postsCachedMyPurchases ?? []
  );
  const [postsMyPurchasesFilter, setPostsMyPurchasesFilter] = useState(
    postsCachedMyPurchasesFilter ?? newnewapi.Post.Filter.ALL
  );
  const [myPurchasesPageToken, setMyPurchasesPageToken] = useState(
    postsCachedMyPurchasesPageToken
  );
  const [myPurchasesCount, setMyPurchasesCount] = useState(
    postsCachedMyPurchasesCount
  );

  const [postsViewHistory, setPostsViewHistory] = useState(
    postsCachedViewHistory ?? []
  );
  const [postsViewHistoryFilter, setPostsViewHistoryFilter] = useState(
    postsCachedViewHistoryFilter ?? newnewapi.Post.Filter.ALL
  );
  const [viewHistoryPageToken, setViewHistoryPageToken] = useState(
    postsCachedViewHistoryPageToken
  );
  const [viewHistoryCount, setViewHistoryCount] = useState(
    postsCachedViewHistoryCount
  );
  const [postsFavorites, setPostsFavorites] = useState(
    postsCachedFavorites ?? []
  );
  const [postsFavoritesFilter, setPostsFavoritesFilter] = useState(
    postsCachedFavoritesFilter ?? newnewapi.Post.Filter.ALL
  );
  const [favoritesPageToken, setFavoritesPageToken] = useState(
    postsCachedFavoritesPageToken
  );
  const [postsFavoritesCount, setFavoritesCount] = useState(
    postsCachedFavoritesCount
  );

  const [postsMyPosts, setPostsMyPosts] = useState(postsCachedMyPosts ?? []);
  const [postsMyPostsFilter, setPostsMyPostsFilter] = useState(
    postsCachedMyPostsFilter ?? newnewapi.Post.Filter.ALL
  );
  const [myPostsPageToken, setMyPostsPageToken] = useState(
    postsCachedMyPostsPageToken
  );
  const [postsMyPostsCount, setMyPostsCount] = useState(
    postsCachedMyPostsCount
  );

  // UpdateCachedPosts
  const handleSetPostsActivelyBiddingOn: React.Dispatch<
    React.SetStateAction<newnewapi.Post[]>
  > = useCallback(setPostsActivelyBiddingOn, [setPostsActivelyBiddingOn]);

  const handleSetPostsMyPurchases: React.Dispatch<
    React.SetStateAction<newnewapi.Post[]>
  > = useCallback(setPostsMyPurchases, [setPostsMyPurchases]);

  const handleSetPostsViewHistory: React.Dispatch<
    React.SetStateAction<newnewapi.Post[]>
  > = useCallback(setPostsViewHistory, [setPostsViewHistory]);

  const handleSetPostsFavorites: React.Dispatch<
    React.SetStateAction<newnewapi.Post[]>
  > = useCallback(setPostsFavorites, [setPostsFavorites]);

  const handleSetPostsMyPosts: React.Dispatch<
    React.SetStateAction<newnewapi.Post[]>
  > = useCallback(setPostsMyPosts, [setPostsMyPosts]);

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

  const handleUpdatePageToken = useCallback(
    (value: string | null | undefined) => {
      switch (renderedPage) {
        case 'activelyBidding': {
          setActivelyBiddingPageToken(value);
          break;
        }
        case 'purchases': {
          setMyPurchasesPageToken(value);
          break;
        }
        case 'viewHistory': {
          setViewHistoryPageToken(value);
          break;
        }
        case 'favorites': {
          setFavoritesPageToken(value);
          break;
        }
        case 'myposts': {
          setMyPostsPageToken(value);
          break;
        }
        default: {
          break;
        }
      }
    },
    [renderedPage]
  );

  const handleUpdateCount = useCallback(
    (value: number) => {
      switch (renderedPage) {
        case 'activelyBidding': {
          setActivelyBiddingCount(value);
          break;
        }
        case 'purchases': {
          setMyPurchasesCount(value);
          break;
        }
        case 'viewHistory': {
          setViewHistoryCount(value);
          break;
        }
        case 'favorites': {
          setFavoritesCount(value);
          break;
        }
        case 'myposts': {
          setMyPostsCount(value);
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
    let postsForPage = {};
    let postsForPageFilter;
    let pageToken;
    let handleSetPosts;
    let totalCount;
    let handleSetFavoritePosts;

    switch (renderedPage) {
      case 'activelyBidding': {
        postsForPage = postsActivelyBiddingOn;
        postsForPageFilter = postsActivelyBiddingOnFilter;
        pageToken = activelyBiddingPageToken;
        totalCount = activelyBiddingCount;
        handleSetPosts = handleSetPostsActivelyBiddingOn;
        handleSetFavoritePosts = handleSetPostsFavorites;
        break;
      }
      case 'purchases': {
        postsForPage = postsMyPurchases;
        postsForPageFilter = postsMyPurchasesFilter;
        pageToken = myPurchasesPageToken;
        totalCount = myPurchasesCount;
        handleSetPosts = handleSetPostsMyPurchases;
        handleSetFavoritePosts = handleSetPostsFavorites;
        break;
      }
      case 'viewHistory': {
        postsForPage = postsViewHistory;
        postsForPageFilter = postsViewHistoryFilter;
        pageToken = viewHistoryPageToken;
        totalCount = viewHistoryCount;
        handleSetPosts = handleSetPostsViewHistory;
        handleSetFavoritePosts = handleSetPostsFavorites;
        break;
      }
      case 'favorites': {
        postsForPage = postsFavorites;
        postsForPageFilter = postsFavoritesFilter;
        pageToken = favoritesPageToken;
        totalCount = postsFavoritesCount;
        handleSetPosts = handleSetPostsFavorites;
        break;
      }
      case 'myposts': {
        postsForPage = postsMyPosts;
        postsForPageFilter = postsMyPostsFilter;
        pageToken = myPostsPageToken;
        totalCount = postsMyPostsCount;
        handleSetPosts = handleSetPostsMyPosts;
        break;
      }
      default: {
        break;
      }
    }

    return React.cloneElement(children as ReactElement, {
      ...(postsForPage ? { posts: postsForPage } : {}),
      ...(postsForPageFilter ? { postsFilter: postsForPageFilter } : {}),
      pageToken,
      totalCount,
      handleSetPosts,
      handleUpdatePageToken,
      handleUpdateCount,
      handleUpdateFilter,
      handleSetFavoritePosts,
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

  const handleCloseEditProfileMenu = useCallback(
    (preventGoBack = false) => {
      if (isBrowser() && !preventGoBack) {
        window.history.back();
      }
      setIsEditProfileMenuOpen(false);
    },
    [setIsEditProfileMenuOpen]
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
    const result = window.confirm(t('editProfileMenu.confirmationWindow'));
    if (result) {
      handleCloseEditProfileMenu();
    }
  }, [wasModified, handleCloseEditProfileMenu, t]);

  // Redirect to / if user is not logged in
  useUpdateEffect(() => {
    // Redirect only after the persist data is pulled
    if (!user.loggedIn && user._persist?.rehydrated) {
      router.push('/');
    }
  }, [router, user]);

  // useEffect(() => {
  //   const start = (url: string) => {
  //     console.log(url);
  //     setRouteChangeLoading(true);
  //   };
  //   const end = (url: string) => {
  //     console.log(url);
  //     setRouteChangeLoading(false);
  //   };
  //   Router.events.on('routeChangeStart', start);
  //   Router.events.on('routeChangeComplete', end);
  //   Router.events.on('routeChangeError', end);
  //   return () => {
  //     Router.events.off('routeChangeStart', start);
  //     Router.events.off('routeChangeComplete', end);
  //     Router.events.off('routeChangeError', end);
  //   };
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // Try to pre-fetch the content
  useEffect(() => {
    router.prefetch('/profile/settings');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SGeneral restrictMaxWidth>
      <SMyProfileLayout>
        <ProfileBackground
          // Temp
          pictureURL={
            user?.userData?.coverUrl ?? '../public/images/mock/profile-bg.png'
          }
        >
          <SButton
            view='transparent'
            withShrink
            withDim
            iconOnly={isMobileOrTablet}
            onClick={() => handleOpenEditProfileMenu()}
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
            onClick={() => router.push('/profile/settings')}
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
        <SBackButton
          onClick={() => {
            router.back();
          }}
        />
        {/* NB! Temp */}
        {user.userData?.avatarUrl && (
          <ProfileImage src={user.userData?.avatarUrl} />
        )}
        <SUserData>
          <SUsernameWrapper>
            <SUsername variant={4}>
              {user.userData?.nickname}
              {user.userData?.options?.isVerified && (
                <SInlineSVG
                  svg={VerificationCheckmark}
                  width='32px'
                  height='32px'
                  fill='none'
                />
              )}
            </SUsername>
            {isGenderPronounsDefined(user.userData?.genderPronouns) && (
              <SGenderPronouns variant={2}>
                {t(
                  `genderPronouns.${
                    getGenderPronouns(user.userData?.genderPronouns!!).name
                  }`
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
                {user.userData?.username && user.userData?.username.length > 12
                  ? `${user.userData?.username.substring(
                      0,
                      6
                    )}...${user.userData?.username.substring(
                      (user.userData?.username.length || 0) - 3
                    )}`
                  : user.userData?.username}
              </SUsernameButtonText>
            </SUsernameButton>
            <SShareButton
              view='tertiary'
              iconOnly
              withDim
              withShrink
              style={{
                padding: '8px',
              }}
              onClick={() => handleCopyLink()}
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
          {user.userData?.bio ? (
            <SBioText variant={3}>{user.userData?.bio}</SBioText>
          ) : null}
        </SUserData>
        <ProfileTabs pageType='myProfile' tabs={tabs} />
        {/* Edit Profile modal menu */}
        <Modal
          show={isEditProfileMenuOpen}
          overlaydim
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
  postsCachedActivelyBiddingOn: undefined,
  postsCachedActivelyBiddingOnFilter: undefined,
  postsCachedActivelyBiddingCount: undefined,
  postsCachedMyPurchases: undefined,
  postsCachedMyPurchasesFilter: undefined,
  postsCachedMyPurchasesCount: undefined,
  postsCachedViewHistory: undefined,
  postsCachedViewHistoryFilter: undefined,
  postsCachedViewHistoryCount: undefined,
  postsCachedFavorites: undefined,
  postsCachedFavoritesFilter: undefined,
  postsCachedFavoritesCount: undefined,
  postsCachedActivelyBiddingPageToken: undefined,
  postsCachedMyPurchasesPageToken: undefined,
  postsCachedViewHistoryPageToken: undefined,
  postsCachedFavoritesPageToken: undefined,
  postsCachedMyPosts: undefined,
  postsCachedMyPostsFilter: undefined,
  postsCachedMyPostsCount: undefined,
  postsCachedMyPostsPageToken: undefined,
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

// TODO: standardize.
const SButton = styled(Button)`
  background: ${(props) =>
    props.theme.name === 'light'
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(11, 10, 19, 0.2)'};
`;

const SBackButton = styled(BackButton)`
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

const SShareButton = styled(Button)`
  span {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }
`;

const SBioText = styled(Text)`
  text-align: center;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  word-break: break-all;

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

const SInlineSVG = styled(InlineSvg)`
  margin-left: 4px;
`;
