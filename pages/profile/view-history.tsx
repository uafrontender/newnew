/* eslint-disable no-unused-vars */
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { NextPageWithLayout } from '../_app';
import { getMyPosts } from '../../api/endpoints/user';
// import { TTokenCookie } from '../../api/apiConfigs';

import MyProfileLayout from '../../components/templates/MyProfileLayout';
// import useUpdateEffect from '../../utils/hooks/useUpdateEffect';
import NoContentCard from '../../components/atoms/profile/NoContentCard';
import { NoContentDescription } from '../../components/atoms/profile/NoContentCommon';
import assets from '../../constants/assets';
import { SUPPORTED_LANGUAGES } from '../../constants/general';

const PostList = dynamic(
  () => import('../../components/organisms/see-more/PostList')
);

interface IMyProfileViewHistory {
  user: Omit<newnewapi.User, 'toJSON'>;
  pagedPosts?: newnewapi.PagedPostsResponse;
  posts?: newnewapi.Post[];
  postsFilter: newnewapi.Post.Filter;
  nextPageTokenFromServer?: string;
  pageToken: string | null | undefined;
  totalCount: number;
  handleUpdatePageToken: (value: string | null | undefined) => void;
  handleUpdateCount: (value: number) => void;
  handleUpdateFilter: (value: newnewapi.Post.Filter) => void;
  handleSetPosts: React.Dispatch<React.SetStateAction<newnewapi.Post[]>>;
  handleSetFavoritePosts: React.Dispatch<
    React.SetStateAction<newnewapi.Post[]>
  >;
}

const MyProfileViewHistory: NextPage<IMyProfileViewHistory> = ({
  user,
  pagedPosts,
  nextPageTokenFromServer,
  posts,
  postsFilter,
  pageToken,
  totalCount,
  handleUpdatePageToken,
  handleUpdateCount,
  handleUpdateFilter,
  handleSetPosts,
  handleSetFavoritePosts,
}) => {
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const { ref: loadingRef, inView } = useInView();
  const { t } = useTranslation('page-Profile');
  const [triedLoading, setTriedLoading] = useState(false);

  // TODO: filters and other parameters
  const loadPosts = useCallback(
    async (token?: string, needCount?: boolean) => {
      if (isLoading) return;
      try {
        setIsLoading(true);
        setTriedLoading(true);
        const payload = new newnewapi.GetRelatedToMePostsRequest({
          relation:
            newnewapi.GetRelatedToMePostsRequest.Relation.MY_VIEW_HISTORY,
          filter: postsFilter,
          paging: {
            ...(token ? { pageToken: token } : {}),
          },
          ...(needCount
            ? {
                needTotalCount: true,
              }
            : {}),
        });
        const postsResponse = await getMyPosts(payload);

        if (postsResponse.data && postsResponse.data.posts) {
          handleSetPosts((curr) => [
            ...curr,
            ...(postsResponse.data?.posts as newnewapi.Post[]),
          ]);
          handleUpdatePageToken(postsResponse.data.paging?.nextPageToken);

          if (postsResponse.data.totalCount) {
            handleUpdateCount(postsResponse.data.totalCount);
          } else if (needCount) {
            handleUpdateCount(0);
          }
        }
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        console.error(err);
      }
    },
    [
      handleSetPosts,
      handleUpdatePageToken,
      handleUpdateCount,
      postsFilter,
      isLoading,
    ]
  );

  useEffect(() => {
    if (inView && !isLoading) {
      if (pageToken) {
        loadPosts(pageToken);
      } else if (!triedLoading && !pageToken && posts?.length === 0) {
        loadPosts(undefined, true);
      }
    } else if (!triedLoading && posts?.length === 0) {
      loadPosts(undefined, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pageToken, isLoading, triedLoading, posts?.length]);

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
              loading={isLoading}
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
        <div ref={loadingRef} />
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
      postsCachedViewHistory={page.props.pagedPosts.posts}
      postsCachedViewHistoryFilter={newnewapi.Post.Filter.ALL}
      postsCachedViewHistoryPageToken={page.props.nextPageTokenFromServer}
      postsCachedViewHistoryCount={page.props.pagedPosts.totalCount}
    >
      {page}
    </MyProfileLayout>
  );
};

export default MyProfileViewHistory;

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<any> {
  try {
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

    // const { req } = context;
    // // Try to fetch only if actual SSR needed
    // if (!context.req.url?.startsWith('/_next')) {
    //   const payload = new newnewapi.GetRelatedToMePostsRequest({
    //     relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_VIEW_HISTORY,
    //     filter: newnewapi.Post.Filter.ALL,
    //     needTotalCount: true,
    //   });
    //   const res = await getMyPosts(
    //     payload,
    //     {
    //       accessToken: req.cookies?.accessToken,
    //       refreshToken: req.cookies?.refreshToken,
    //     },
    //     (tokens: TTokenCookie[]) => {
    //       const parsedTokens = tokens.map((t) => `${t.name}=${t.value}; ${t.expires ? `expires=${t.expires}; ` : ''} ${t.maxAge ? `max-age=${t.maxAge}; ` : ''}`);
    //       context.res.setHeader(
    //         'set-cookie',
    //         parsedTokens,
    //       );
    //     },
    //   );

    //   if (res.data) {
    //     return {
    //       props: {
    //         pagedPosts: res.data.toJSON(),
    //         ...(res.data.paging?.nextPageToken ? {
    //           nextPageTokenFromServer: res.data.paging?.nextPageToken,
    //         } : {}),
    //         ...translationContext,
    //       },
    //     };
    //   }
    // }

    return {
      props: {
        pagedPosts: {},
        ...translationContext,
      },
    };
  } catch (err) {
    return {
      props: {
        error: {
          message: (err as Error).message,
          statusCode: 400,
        },
      },
    };
  }
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
