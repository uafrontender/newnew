/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  ReactElement, useCallback, useEffect, useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import Router, { useRouter } from 'next/router';
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
import { CardSkeletonList } from '../molecules/CardSkeleton';

// Icons
import ShareIconFilled from '../../public/images/svg/icons/filled/Share.svg';
import FavouritesIconFilled from '../../public/images/svg/icons/filled/Favourites.svg';
import MoreIconFilled from '../../public/images/svg/icons/filled/More.svg';

interface IProfileLayout {
  user: Omit<newnewapi.User, 'toJSON'>;
  tabs: Tab[];
  postsCachedCreatorDecisions?: newnewapi.Post[];
  postsCachedActivity?: newnewapi.Post[];
}

const ProfileLayout: React.FunctionComponent<IProfileLayout> = ({
  user,
  tabs,
  postsCachedCreatorDecisions,
  postsCachedActivity,
  children,
}) => {
  const [routeChangeLoading, setRouteChangeLoading] = useState(false);

  // Cached posts
  const [
    creatorsDecisions, setCreatorsDecisions,
  ] = useState(postsCachedCreatorDecisions ?? []);
  const [
    activityDecisions, setActivityDecisions,
  ] = useState(postsCachedActivity ?? []);

  const { t } = useTranslation('profile');
  const theme = useTheme();

  const { resizeMode } = useAppSelector((state) => state.ui);
  const currentUser = useAppSelector((state) => state.user);
  const router = useRouter();

  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  // Add new posts to cached ones
  const addNewPostsCreatorsDecisions = useCallback((newPosts: newnewapi.Post[]) => {
    setCreatorsDecisions((curr) => [...curr, ...newPosts]);
  }, [setCreatorsDecisions]);

  const addNewPostsAcitvity = useCallback((newPosts: newnewapi.Post[]) => {
    setActivityDecisions((curr) => [...curr, ...newPosts]);
  }, [setActivityDecisions]);

  // TODO: Handle clicking "Send message" -> sign in | subscribe | DMs
  const handleClickSendMessage = useCallback(() => {
    if (!currentUser.loggedIn) {
      router.push('/sign-up?reason=subscribe');
    }
  }, [currentUser, router]);

  // Redirect to /profile page if the page is of current user's own
  useEffect(() => {
    if (currentUser.loggedIn
      && currentUser.userData?.userUuid?.toString() === user.uuid.toString()) {
      router.push('/profile');
    }
  }, [currentUser.loggedIn, currentUser.userData?.userUuid, router, user.uuid]);

  // Skeletons for surfing the tabs
  useEffect(() => {
    const start = (url: string) => {
      if (url.includes(user.username)) {
        setRouteChangeLoading(true);
      }
    };
    const end = () => {
      setRouteChangeLoading(false);
    };
    Router.events.on('routeChangeStart', start);
    Router.events.on('routeChangeComplete', end);
    Router.events.on('routeChangeError', end);
    return () => {
      Router.events.off('routeChangeStart', start);
      Router.events.off('routeChangeComplete', end);
      Router.events.off('routeChangeError', end);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            view="transparent"
            iconOnly
            onClick={() => {
            }}
          >
            <InlineSvg
              svg={FavouritesIconFilled}
              fill={theme.colorsThemed.text.primary}
              width={isMobileOrTablet ? '20px' : '24px'}
              height={isMobileOrTablet ? '20px' : '24px'}
            />
            {t('ProfileLayout.buttons.favorites')}
          </SFavoritesButton>
          <SMoreButton
            view="transparent"
            iconOnly
            onClick={() => {
            }}
          >
            <InlineSvg
              svg={MoreIconFilled}
              fill={theme.colorsThemed.text.primary}
              width={isMobileOrTablet ? '20px' : '24px'}
              height={isMobileOrTablet ? '20px' : '24px'}
            />
            {t('ProfileLayout.buttons.more')}
          </SMoreButton>
          <ProfileImage
            src={user.avatarUrl ?? ''}
          />
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <SUsername
              variant={4}
            >
              {user.nickname}
            </SUsername>
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
                onClick={() => {
                }}
              >
                <SUsernameButtonText>
                  @
                  {/* Temp! */}
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
                onClick={() => {
                }}
              >
                <InlineSvg
                  svg={ShareIconFilled}
                  fill={theme.colorsThemed.text.primary}
                  width="20px"
                  height="20px"
                />
              </Button>
            </SShareDiv>
            {user.options?.isCreator
              ? (
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
            {user.bio ? (
              <SBioText
                variant={3}
              >
                {user.bio}
              </SBioText>
            ) : null}
          </div>
          {/* Temp, all creactors for now */}
          {/* {user.options?.isCreator && !user.options?.isPrivate */}
          {user
            ? (
              <ProfileTabs
                pageType="othersProfile"
                tabs={tabs}
              />
            ) : null}
        </SProfileLayout>
        {/* {children} */}
        {!routeChangeLoading
          ? (
            React.cloneElement(
              children as ReactElement,
              {
                ...(creatorsDecisions ? { cachedCreatorsPosts: creatorsDecisions } : {}),
                ...(activityDecisions ? { cachedActivityPosts: activityDecisions } : {}),
                handleAddNewPostsCreatorsDecisions: addNewPostsCreatorsDecisions,
                handleAddNewPostsActivity: addNewPostsAcitvity,
              },
            )
          ) : (
            <CardSkeletonList
              count={8}
              wrapperStyle={{
                left: 0,
              }}
            />
          )}
      </SGeneral>
    </ErrorBoundary>
  );
};

ProfileLayout.defaultProps = {
  postsCachedCreatorDecisions: undefined,
  postsCachedActivity: undefined,
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
