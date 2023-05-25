/* eslint-disable no-nested-ternary */
import React, { ReactElement, useEffect, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import { useInView } from 'react-intersection-observer';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';

import ProfileLayout from '../../components/templates/ProfileLayout';
import { NextPageWithLayout } from '../_app';
import { getUserByUsername } from '../../api/endpoints/user';
import useUserPosts from '../../utils/hooks/useUserPosts';
import { useAppSelector } from '../../redux-store/store';

import PostList from '../../components/organisms/see-more/PostList';
import Text from '../../components/atoms/Text';
import InlineSvg from '../../components/atoms/InlineSVG';
import LockIcon from '../../public/images/svg/icons/filled/Lock.svg';
import NoContentCard from '../../components/atoms/profile/NoContentCard';
import { NoContentDescription } from '../../components/atoms/profile/NoContentCommon';
// import { SUPPORTED_LANGUAGES } from '../../constants/general';
import getDisplayname from '../../utils/getDisplayname';
import assets from '../../constants/assets';

interface IUserPageActivity {
  user: newnewapi.IUser;
  postsFilter: newnewapi.Post.Filter;
}

const UserPageActivity: NextPage<IUserPageActivity> = ({
  user,
  postsFilter,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Profile');
  const { loggedIn } = useAppSelector((state) => state.user);

  const isActivityPrivate = useMemo(
    () => !!user?.options?.isActivityPrivate,
    [user?.options?.isActivityPrivate]
  );

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useUserPosts(
      {
        userUuid: user.uuid as string,
        loggedInUser: loggedIn,
        relation: newnewapi.GetUserPostsRequest.Relation.THEY_PURCHASED,
        postsFilter,
      },
      {
        enabled: !isActivityPrivate,
      }
    );

  const posts = useMemo(
    () => data?.pages.map((page) => page.posts).flat(),
    [data]
  );

  // Loading state
  const { ref: loadingRef, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  const bioWithTrailingDot = useMemo(() => {
    if (!user.bio || user.bio?.length === 0) {
      return '';
    }

    if (user.bio[user.bio.length - 1] === '.') {
      return user.bio;
    }

    return user.bio.concat('.');
  }, [user.bio]);

  return (
    <>
      <Head>
        <title>
          {t('Activity.meta.title', {
            displayname: getDisplayname(user),
            username: user.username,
          })}
        </title>
        <meta
          name='description'
          content={t('Activity.meta.description', {
            bio: bioWithTrailingDot,
          })}
        />
        <meta
          property='og:title'
          content={t('Activity.meta.title', {
            displayname: getDisplayname(user),
            username: user.username,
          })}
        />
        <meta
          property='og:description'
          content={t('Activity.meta.description', {
            bio: bioWithTrailingDot,
          })}
        />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <div>
        {isActivityPrivate ? (
          <SMain>
            <SAccountPrivate>
              <SPrivateLock>
                <InlineSvg
                  svg={LockIcon}
                  width='24px'
                  height='24px'
                  fill={theme.colorsThemed.text.secondary}
                />
              </SPrivateLock>
              <SAccountPrivateText variant={1}>
                {t('accountPrivate', {
                  username: getDisplayname(user),
                })}
              </SAccountPrivateText>
            </SAccountPrivate>
          </SMain>
        ) : (
          <SMain>
            <SCardsSection>
              {posts && (
                <PostList
                  category=''
                  loading={isLoading || isFetchingNextPage}
                  collection={posts}
                  wrapperStyle={{
                    left: 0,
                  }}
                />
              )}
              {posts && posts.length === 0 && !isLoading && (
                <NoContentCard>
                  <NoContentDescription>
                    {t('Activity.noContent.description')}
                  </NoContentDescription>
                </NoContentCard>
              )}
            </SCardsSection>
            {hasNextPage && <div ref={loadingRef} />}
          </SMain>
        )}
      </div>
    </>
  );
};

(UserPageActivity as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return (
    <ProfileLayout key={page.props.user.uuid} user={page.props.user}>
      {page}
    </ProfileLayout>
  );
};

export default UserPageActivity;

export const getServerSideProps: GetServerSideProps<
  Partial<IUserPageActivity>
> = async (context) => {
  context.res.setHeader(
    'Cache-Control',
    'public, s-maxage=15, stale-while-revalidate=20, stale-if-error=5'
  );
  try {
    const { username } = context.query;
    /* const translationContext = await serverSideTranslations(
      context.locale!!,
      [
        'common',
        'page-Profile',
        'component-PostCard',
        'page-Post',
        'modal-PaymentModal',
        'modal-ResponseSuccessModal',
      ],
      null,
      SUPPORTED_LANGUAGES
    ); */

    if (!username || Array.isArray(username)) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    const getUserRequestPayload = new newnewapi.GetUserRequest({
      username,
    });

    const res = await getUserByUsername(getUserRequestPayload);

    if (!res?.data || res.error) {
      return {
        redirect: {
          destination: '/404',
          permanent: false,
        },
      };
    }

    // NOTE: activity is temporarily disabled
    return {
      redirect: {
        destination: `/${username}`,
        permanent: false,
      },
    };

    /* return {
      props: {
        user: res.data.toJSON(),
        ...translationContext,
      },
    }; */
  } catch (err) {
    return {
      redirect: {
        destination: '/404',
        permanent: false,
      },
    };
  }
};

const SMain = styled.main`
  min-height: 60vh;
`;

const SCardsSection = styled.section`
  display: flex;
  flex-wrap: wrap;

  ${(props) => props.theme.media.tablet} {
    margin-right: -32px !important;
  }
`;

// Account private
const SAccountPrivate = styled.div``;

const SPrivateLock = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 48px;
  height: 48px;

  margin-bottom: 8px;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  border-radius: 50%;

  margin-left: auto !important;
  margin-right: auto !important;
`;

const SAccountPrivateText = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
  text-align: center;
`;
