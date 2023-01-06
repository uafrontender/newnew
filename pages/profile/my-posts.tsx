import React, { ReactElement, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useInfiniteQuery } from 'react-query';

import dynamic from 'next/dynamic';
import { NextPageWithLayout } from '../_app';
import { getMyPosts } from '../../api/endpoints/user';

import MyProfileLayout from '../../components/templates/MyProfileLayout';
import { NoContentDescription } from '../../components/atoms/profile/NoContentCommon';
import assets from '../../constants/assets';
import { SUPPORTED_LANGUAGES } from '../../constants/general';

const PostList = dynamic(
  () => import('../../components/organisms/see-more/PostList')
);
const NoContentCard = dynamic(
  () => import('../../components/atoms/profile/NoContentCard')
);

interface IMyProfileMyPosts {
  postsFilter: newnewapi.Post.Filter;
}

const MyProfileMyPosts: NextPage<IMyProfileMyPosts> = ({ postsFilter }) => {
  // Loading state
  const { ref: loadingRef, inView } = useInView();
  const { t } = useTranslation('page-Profile');

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(
      [
        'private',
        'getMyPosts',
        newnewapi.GetRelatedToMePostsRequest.Relation.MY_PURCHASES,
      ],
      async ({ pageParam }) => {
        const payload = new newnewapi.GetRelatedToMePostsRequest({
          relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_CREATIONS,
          filter: postsFilter,
          paging: {
            pageToken: pageParam,
          },
          needTotalCount: true,
        });

        const postsResponse = await getMyPosts(payload);

        if (!postsResponse.data || postsResponse.error) {
          throw new Error('Request failed');
        }

        return {
          posts: postsResponse?.data?.posts || [],
          paging: postsResponse?.data?.paging,
        };
      },
      {
        getNextPageParam: (lastPage) => lastPage?.paging?.nextPageToken,
        onError: (error) => {
          console.error(error);
        },
      }
    );

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
        <title>{t('MyPosts.meta.title')}</title>
        <meta name='description' content={t('MyPosts.meta.description')} />
        <meta property='og:title' content={t('MyPosts.meta.title')} />
        <meta
          property='og:description'
          content={t('MyPosts.meta.description')}
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
                {t('MyPosts.noContent.description')}
              </NoContentDescription>
            </NoContentCard>
          )}
        </SCardsSection>
        {hasNextPage && <div ref={loadingRef} />}
      </SMain>
    </div>
  );
};

(MyProfileMyPosts as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return (
    <MyProfileLayout
      renderedPage='myposts'
      postsCachedMyPosts={[]}
      postsCachedMyPostsFilter={newnewapi.Post.Filter.ALL}
      postsCachedMyPostsCount={0}
      postsCachedMyPostsPageToken={page.props.nextPageTokenFromServer}
    >
      {page}
    </MyProfileLayout>
  );
};

export default MyProfileMyPosts;

export async function getStaticProps(context: {
  locale: string;
}): Promise<any> {
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
