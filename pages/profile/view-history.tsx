import React, { ReactElement, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
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

interface IMyProfileViewHistory {
  postsFilter: newnewapi.Post.Filter;
}

const MyProfileViewHistory: NextPage<IMyProfileViewHistory> = ({
  postsFilter,
}) => {
  // Loading state
  const { ref: loadingRef, inView } = useInView();
  const { t } = useTranslation('page-Profile');

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useMyPosts({
      relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_VIEW_HISTORY,
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

  return (
    <div>
      <Head>
        <title>{t('ViewingHistory.meta.title')}</title>
        <meta
          name='description'
          content={t('ViewingHistory.meta.description')}
        />
        <meta property='og:title' content={t('ViewingHistory.meta.title')} />
        <meta
          property='og:description'
          content={t('ViewingHistory.meta.description')}
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
            />
          )}
          {posts && posts.length === 0 && !isLoading && (
            <NoContentCard>
              <NoContentDescription>
                {t('ViewingHistory.noContent.description')}
              </NoContentDescription>
            </NoContentCard>
          )}
        </SCardsSection>
        {hasNextPage && <div ref={loadingRef} />}
      </SMain>
    </div>
  );
};

(MyProfileViewHistory as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return (
    <MyProfileLayout
      renderedPage='viewHistory'
      postsCachedViewHistory={[]}
      postsCachedViewHistoryFilter={newnewapi.Post.Filter.ALL}
      postsCachedViewHistoryCount={0}
      postsCachedViewHistoryPageToken={page.props.nextPageTokenFromServer}
    >
      {page}
    </MyProfileLayout>
  );
};

export default MyProfileViewHistory;

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
