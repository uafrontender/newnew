/* eslint-disable no-unused-vars */
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';

import dynamic from 'next/dynamic';
import { NextPageWithLayout } from '../_app';
import { getMyPosts } from '../../api/endpoints/user';
// import { TTokenCookie } from '../../api/apiConfigs';

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
}

const MyProfileMyPosts: NextPage<IMyProfileMyPosts> = ({
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
          relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_CREATIONS,
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
                {t('MyPosts.noContent.description')}
              </NoContentDescription>
            </NoContentCard>
          )}
        </SCardsSection>
        <div ref={loadingRef} />
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
      postsCachedMyPosts={page.props.pagedPosts.posts}
      postsCachedMyPostsFilter={newnewapi.Post.Filter.ALL}
      postsCachedMyPostsCount={page.props.pagedPosts.totalCount}
      postsCachedMyPostsPageToken={page.props.nextPageTokenFromServer}
    >
      {page}
    </MyProfileLayout>
  );
};

export default MyProfileMyPosts;

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
    //     relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_CREATIONS,
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
