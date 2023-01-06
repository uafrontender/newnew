/* eslint-disable no-param-reassign */
import React, { ReactElement, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// import { useQueryClient } from 'react-query';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { SUPPORTED_LANGUAGES } from '../../constants/general';
import useMyPosts from '../../utils/hooks/useMyPosts';

import { NextPageWithLayout } from '../_app';
import MyProfileLayout from '../../components/templates/MyProfileLayout';
import NoContentCard from '../../components/atoms/profile/NoContentCard';
import { NoContentDescription } from '../../components/atoms/profile/NoContentCommon';

import assets from '../../constants/assets';

const PostList = dynamic(
  () => import('../../components/organisms/see-more/PostList')
);

interface IMyProfileFavorites {
  postsFilter: newnewapi.Post.Filter;
}

const MyProfileFavorites: NextPage<IMyProfileFavorites> = ({ postsFilter }) => {
  // Loading state
  const { ref: loadingRef, inView } = useInView();
  const { t } = useTranslation('page-Profile');

  // Tried out `queryClient.invalidateQueries()` along with `refetch()`
  // Not sure which fits better
  // The endpoint is seemingly broken (as well as the view-history one) because it returns
  // a lot of duplicate items and in the wrong order
  // const queryClient = useQueryClient();

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
  } = useMyPosts({
    relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_FAVORITES,
    postsFilter,
  });

  const posts = useMemo(
    () => data?.pages.map((page) => page.posts).flat(),
    [data]
  );

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  const handleRemovePostFromState = (postUuid: string) => {
    refetch();
    // queryClient.invalidateQueries([
    //   'private',
    //   'getMyPosts',
    //   newnewapi.GetRelatedToMePostsRequest.Relation.MY_FAVORITES,
    // ]);
  };

  return (
    <div>
      <Head>
        <title>{t('Favorites.meta.title')}</title>
        <meta name='description' content={t('Favorites.meta.description')} />
        <meta property='og:title' content={t('Favorites.meta.title')} />
        <meta
          property='og:description'
          content={t('Favorites.meta.description')}
        />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
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
              handleRemovePostFromState={(uuid: string) =>
                handleRemovePostFromState(uuid)
              }
            />
          )}
          {posts && posts.length === 0 && !isLoading && (
            <NoContentCard>
              <NoContentDescription>
                {t('Favorites.noContent.description')}
              </NoContentDescription>
            </NoContentCard>
          )}
        </SCardsSection>
        {hasNextPage && <div ref={loadingRef} />}
      </SMain>
    </div>
  );
};

(MyProfileFavorites as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return (
    <MyProfileLayout
      renderedPage='favorites'
      postsCachedFavorites={[]}
      postsCachedFavoritesFilter={newnewapi.Post.Filter.ALL}
      postsCachedFavoritesCount={0}
      postsCachedFavoritesPageToken={page.props.nextPageTokenFromServer}
    >
      {page}
    </MyProfileLayout>
  );
};

export default MyProfileFavorites;

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<any> {
  const translationContext = await serverSideTranslations(
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
  );

  return {
    props: {
      ...translationContext,
    },
  };
}

const SMain = styled.main`
  min-height: 60vh;
`;

const SCardsSection = styled.div`
  display: flex;
  flex-wrap: wrap;

  ${(props) => props.theme.media.tablet} {
    margin-right: -32px !important;
  }
`;
