/* eslint-disable no-unsafe-optional-chaining */
import React, { ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../redux-store/store';

import Text from '../atoms/Text';
import Button from '../atoms/Button';
import General from './General';
import { Tab } from '../molecules/Tabs';
import Headline from '../atoms/Headline';
import InlineSvg from '../atoms/InlineSVG';
import ProfileTabs from '../molecules/profile/ProfileTabs';
import ProfileImage from '../molecules/profile/ProfileImage';
import ErrorBoundary from '../organisms/ErrorBoundary';
import ProfileBackground from '../molecules/profile/ProfileBackground';

// Icons
import ShareIconFilled from '../../public/images/svg/icons/filled/Share.svg';
import FavouritesIconFilled from '../../public/images/svg/icons/filled/Favourites.svg';
import MoreIconFilled from '../../public/images/svg/icons/filled/More.svg';
import { getSubscriptionStatus } from '../../api/endpoints/subscription';
import { FollowingsContext } from '../../contexts/followingContext';
import { markUser } from '../../api/endpoints/user';

type TPageType = 'creatorsDecisions' | 'activity' | 'activityHidden';

interface IProfileLayout {
  user: Omit<newnewapi.User, 'toJSON'>;
  renderedPage: TPageType;
  postsCachedCreatorDecisions?: newnewapi.Post[];
  postsCachedCreatorDecisionsFilter?: newnewapi.Post.Filter;
  postsCachedCreatorDecisionsPageToken?: string | null | undefined;
  postsCachedCreatorDecisionsCount?: number;
  postsCachedActivity?: newnewapi.Post[];
  postsCachedActivityFilter?: newnewapi.Post.Filter;
  postsCachedActivityPageToken?: string | null | undefined;
  postsCachedActivityCount?: number;
}

const ProfileLayout: React.FunctionComponent<IProfileLayout> = ({
  user,
  renderedPage,
  postsCachedCreatorDecisions,
  postsCachedCreatorDecisionsFilter,
  postsCachedCreatorDecisionsPageToken,
  postsCachedCreatorDecisionsCount,
  postsCachedActivity,
  postsCachedActivityFilter,
  postsCachedActivityPageToken,
  postsCachedActivityCount,
  children,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation('profile');

  const currentUser = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  const { followingsIds, addId, removeId } = useContext(FollowingsContext);

  const tabs: Tab[] = useMemo(() => {
    if (user.options?.isCreator) {
      // if (true) {
      return [
        {
          nameToken: 'userInitial',
          url: `/${user.username}`,
        },
        {
          nameToken: 'activity',
          url: `/${user.username}/activity`,
        },
      ];
    }
    return [];
  }, [user]);

  // Posts
  const [creatorsDecisions, setCreatorsDecisions] = useState(postsCachedCreatorDecisions ?? []);
  const [creatorsDecisionsFilter, setCreatorsDecisionsFilter] = useState(
    postsCachedCreatorDecisionsFilter ?? newnewapi.Post.Filter.ALL
  );
  const [creatorsDecisionsToken, setCreatorsDecisionsPageToken] = useState(postsCachedCreatorDecisionsPageToken);
  const [creatorsDecisionsCount, setCreatorsDecisionsCount] = useState(postsCachedCreatorDecisionsCount);

  const [activityDecisions, setActivityDecisions] = useState(postsCachedActivity ?? []);
  const [activityDecisionsFilter, setActivityDecisionsFilter] = useState(
    postsCachedActivityFilter ?? newnewapi.Post.Filter.ALL
  );
  const [activityDecisionsToken, setActivityDecisionsPageToken] = useState(postsCachedActivityPageToken);
  const [activityDecisionsCount, setActivityDecisionsCount] = useState(postsCachedActivityCount);

  const handleSetPostsCreatorsDecisions: React.Dispatch<React.SetStateAction<newnewapi.Post[]>> = useCallback(
    setCreatorsDecisions,
    [setCreatorsDecisions]
  );

  const handleSetActivityDecisions: React.Dispatch<React.SetStateAction<newnewapi.Post[]>> = useCallback(
    setActivityDecisions,
    [setActivityDecisions]
  );

  const handleUpdateFilter = useCallback(
    (value: newnewapi.Post.Filter) => {
      switch (renderedPage) {
        case 'activity': {
          setActivityDecisionsFilter(value);
          break;
        }
        case 'activityHidden': {
          setActivityDecisionsFilter(value);
          break;
        }
        case 'creatorsDecisions': {
          setCreatorsDecisionsFilter(value);
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
        case 'activity': {
          setActivityDecisionsPageToken(value);
          break;
        }
        case 'activityHidden': {
          setActivityDecisionsPageToken(value);
          break;
        }
        case 'creatorsDecisions': {
          setCreatorsDecisionsPageToken(value);
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
        case 'activity': {
          setActivityDecisionsCount(value);
          break;
        }
        case 'activityHidden': {
          setActivityDecisionsCount(value);
          break;
        }
        case 'creatorsDecisions': {
          setCreatorsDecisionsCount(value);
          break;
        }
        default: {
          break;
        }
      }
    },
    [renderedPage]
  );

  // TODO: Handle clicking "Send message" -> sign in | subscribe | DMs
  const handleClickSendMessage = useCallback(async () => {
    try {
      const getStatusPayload = new newnewapi.SubscriptionStatusRequest({
        creatorUuid: user.uuid,
      });

      const res = await getSubscriptionStatus(getStatusPayload);

      console.log(res.data);

      if (res.data?.status?.notSubscribed || res.data?.status?.activeCancelsAt) {
        router.push(`/${user.username}/subscribe`);
      } else if (res.data?.status?.activeRenewsAt) {
        console.log('Subscribed! Redirect to chat will be here');
        router.push(`/direct-messages?user=${user.uuid}`);
      }
    } catch (err) {
      console.error(err);
    }
  }, [router, user]);

  const renderChildren = () => {
    let postsForPage = {};
    let postsForPageFilter;
    let pageToken;
    let handleSetPosts;
    let totalCount;

    switch (renderedPage) {
      case 'creatorsDecisions': {
        postsForPage = creatorsDecisions;
        postsForPageFilter = creatorsDecisionsFilter;
        pageToken = creatorsDecisionsToken;
        totalCount = creatorsDecisionsCount;
        handleSetPosts = handleSetPostsCreatorsDecisions;
        break;
      }
      case 'activity': {
        postsForPage = activityDecisions;
        postsForPageFilter = activityDecisionsFilter;
        pageToken = activityDecisionsToken;
        totalCount = activityDecisionsCount;
        handleSetPosts = handleSetActivityDecisions;
        break;
      }
      case 'activityHidden': {
        postsForPage = [];
        postsForPageFilter = activityDecisionsFilter;
        pageToken = undefined;
        totalCount = 0;
        handleSetPosts = handleSetActivityDecisions;
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
    });
  };

  const handleToggleFollowingCreator = async () => {
    try {
      if (!currentUser.loggedIn) {
        router.push('/sign-up?reason=follow-creator');
      }

      const payload = new newnewapi.MarkUserRequest({
        userUuid: user.uuid,
        markAs: followingsIds.includes(user.uuid as string)
          ? newnewapi.MarkUserRequest.MarkAs.NOT_FOLLOWED
          : newnewapi.MarkUserRequest.MarkAs.FOLLOWED,
      });

      console.log(payload);

      const res = await markUser(payload);

      if (res.error) throw new Error(res.error?.message ?? 'Request failed');

      if (followingsIds.includes(user.uuid as string)) {
        removeId(user.uuid as string);
      } else {
        addId(user.uuid as string);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Try to pre-fetch the content
  useEffect(() => {
    router.prefetch('/sign-up?reason=follow-creator');
    router.prefetch(`/${user.username}/subscribe`);
    router.prefetch(`/${user.username}/activity`);
    router.prefetch(`/${user.username}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect to /profile page if the page is of current user's own
  useEffect(() => {
    if (currentUser.loggedIn && currentUser.userData?.userUuid?.toString() === user.uuid.toString()) {
      router.push('/profile');
    }
  }, [currentUser.loggedIn, currentUser.userData?.userUuid, router, user.uuid]);

  useEffect(() => {
    const handlerHistory = () => {
      console.log('Popstate')

      const postId = new URL(window?.location?.href).searchParams.get('post');

      if (postId && window?.history?.state?.fromPost) {
        // router.back();
        // window.history.back()
        router.push(`/?post=${postId}`);
      }
    }

    window?.addEventListener('popstate', handlerHistory);

    return () => {
      window?.removeEventListener('popstate', handlerHistory);
    }
  }, [router]);

  return (
    <ErrorBoundary>
      <SGeneral>
        <SProfileLayout>
          <ProfileBackground
            // Temp
            pictureURL={user.coverUrl ?? '../public/images/mock/profile-bg.png'}
          />
          {/* Favorites and more options buttons */}
          <SFavoritesButton
            view={followingsIds.includes(user.uuid as string) ? 'primaryGrad' : 'transparent'}
            iconOnly
            onClick={() => handleToggleFollowingCreator()}
          >
            <InlineSvg
              svg={FavouritesIconFilled}
              fill={theme.colorsThemed.text.primary}
              width={isMobileOrTablet ? '20px' : '24px'}
              height={isMobileOrTablet ? '20px' : '24px'}
            />
            {t('ProfileLayout.buttons.favorites')}
          </SFavoritesButton>
          <SMoreButton view="transparent" iconOnly onClick={() => {}}>
            <InlineSvg
              svg={MoreIconFilled}
              fill={theme.colorsThemed.text.primary}
              width={isMobileOrTablet ? '20px' : '24px'}
              height={isMobileOrTablet ? '20px' : '24px'}
            />
            {t('ProfileLayout.buttons.more')}
          </SMoreButton>
          <ProfileImage src={user.avatarUrl ?? ''} />
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <SUsername variant={4}>{user.nickname}</SUsername>
            <SShareDiv>
              <Button
                view="tertiary"
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
                  {user.username && user.username.length > 12
                    ? `${user.username.substring(0, 6)}...${user.username.substring(user.username.length - 3)}`
                    : user.username}
                </SUsernameButtonText>
              </Button>
              <Button
                view="tertiary"
                iconOnly
                style={{
                  padding: '8px',
                }}
                onClick={() => {}}
              >
                <InlineSvg svg={ShareIconFilled} fill={theme.colorsThemed.text.primary} width="20px" height="20px" />
              </Button>
            </SShareDiv>
            {user.options?.isCreator ? (
              <Button
                withShadow
                view="primaryGrad"
                style={{
                  marginBottom: '16px',
                }}
                onClick={handleClickSendMessage}
              >
                {t('ProfileLayout.buttons.sendMessage')}
              </Button>
            ) : null}
            {user.bio ? <SBioText variant={3}>{user.bio}</SBioText> : null}
          </div>
          {/* Temp, all creactors for now */}
          {/* {user.options?.isCreator && !user.options?.isPrivate */}
          {tabs.length > 0 ? <ProfileTabs pageType="othersProfile" tabs={tabs} /> : null}
        </SProfileLayout>
        {renderChildren()}
      </SGeneral>
    </ErrorBoundary>
  );
};

ProfileLayout.defaultProps = {
  postsCachedCreatorDecisions: undefined,
  postsCachedCreatorDecisionsFilter: undefined,
  postsCachedCreatorDecisionsPageToken: undefined,
  postsCachedCreatorDecisionsCount: undefined,
  postsCachedActivity: undefined,
  postsCachedActivityFilter: undefined,
  postsCachedActivityPageToken: undefined,
  postsCachedActivityCount: undefined,
};

export default ProfileLayout;

const SGeneral = styled(General)`
  position: relative;

  header {
    z-index: 6;
  }

  @media (max-width: 768px) {
    main {
      div:first-child {
        padding-left: 0;
        padding-right: 0;

        div:first-child {
          margin-left: 0;
          margin-right: 0;
        }
      }
    }
  }
`;

const SUsername = styled(Headline)`
  text-align: center;

  margin-bottom: 12px;
`;

const SShareDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  gap: 12px;

  margin-bottom: 16px;
`;

const SUsernameButtonText = styled(Text)`
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SBioText = styled(Text)`
  text-align: center;
  overflow-wrap: break-word;

  padding-left: 16px;
  padding-right: 16px;
  margin-bottom: 54px;

  max-width: 480px;

  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SFavoritesButton = styled(Button)`
  position: absolute;
  top: 164px;
  right: 4px;

  /* background: none; */

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  span {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  ${(props) => props.theme.media.tablet} {
    top: 204px;
    right: calc(4px + 56px);
  }

  ${(props) => props.theme.media.laptop} {
    top: 244px;
  }
`;

const SMoreButton = styled(Button)`
  position: absolute;
  top: 164px;
  left: 4px;

  background: none;

  color: ${({ theme }) => theme.colorsThemed.text.primary};

  span {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  ${(props) => props.theme.media.tablet} {
    top: 204px;
    left: initial;
    right: 4px;
  }

  ${(props) => props.theme.media.laptop} {
    top: 244px;
  }
`;

const SProfileLayout = styled.div`
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
