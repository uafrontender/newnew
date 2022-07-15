/* eslint-disable no-unused-vars */
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import type { GetServerSidePropsContext, NextPage } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { NextPageWithLayout } from '../_app';
import { getMyPosts } from '../../api/endpoints/user';
// import { TTokenCookie } from '../../api/apiConfigs';
import switchPostType from '../../utils/switchPostType';

import MyProfileLayout from '../../components/templates/MyProfileLayout';
// import useUpdateEffect from '../../utils/hooks/useUpdateEffect';
import { NoContentDescription } from '../../components/atoms/profile/NoContentCommon';
import assets from '../../constants/assets';
import switchPostType from '../../utils/switchPostType';
import { Mixpanel } from '../../utils/mixpanel';

const PostModal = dynamic(
  () => import('../../components/organisms/decision/PostModal')
);
const PostList = dynamic(
  () => import('../../components/organisms/see-more/PostList')
);
const NoContentCard = dynamic(
  () => import('../../components/atoms/profile/NoContentCard')
);

interface IMyProfilePurchases {
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

const MyProfilePurchases: NextPage<IMyProfilePurchases> = ({
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
  // Display post
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [displayedPost, setDisplayedPost] = useState<
    newnewapi.IPost | undefined
  >();

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const { ref: loadingRef, inView } = useInView();
  const { t } = useTranslation('page-Profile');
  const [triedLoading, setTriedLoading] = useState(false);

  const handleOpenPostModal = (post: newnewapi.IPost) => {
    Mixpanel.track('Open Post Modal', {
      _stage: 'Profile Page',
      _postUuid: switchPostType(post)[0].postUuid,
    });
    setDisplayedPost(post);
    setPostModalOpen(true);
  };

  const handleSetDisplayedPost = useCallback((post: newnewapi.IPost) => {
    setDisplayedPost(post);
  }, []);

  const handleClosePostModal = () => {
    Mixpanel.track('Close Post Modal', {
      _stage: 'Profile Page',
    });
    setPostModalOpen(false);
    setDisplayedPost(undefined);
  };

  const loadPosts = useCallback(
    async (token?: string, needCount?: boolean) => {
      if (isLoading) return;
      try {
        setIsLoading(true);
        setTriedLoading(true);
        const payload = new newnewapi.GetRelatedToMePostsRequest({
          relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_PURCHASES,
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

  const handleRemovePostFromFavorites = (postUuid: string) => {
    handleSetFavoritePosts((curr) => {
      const updated = curr.filter(
        (post) => switchPostType(post)[0].postUuid !== postUuid
      );
      return updated;
    });
  };

  const handleAddPostToFavorites = (postToAdd: newnewapi.Post) => {
    handleSetFavoritePosts((curr) => {
      // need for initial load favorites on favorites tab
      if (curr.length === 0) {
        return [];
      }

      const newArr = [...curr];

      const alreadyAdded = curr.findIndex(
        (p) =>
          switchPostType(p)[0].postUuid ===
          switchPostType(postToAdd)[0].postUuid
      );

      if (alreadyAdded !== -1) {
        return newArr;
      }

      const updated = [postToAdd, ...newArr];
      return updated;
    });
  };

  return (
    <div>
      <Head>
        <title>{t('Purchases.meta.title')}</title>
        <meta name='description' content={t('Purchases.meta.description')} />
        <meta property='og:title' content={t('Purchases.meta.title')} />
        <meta
          property='og:description'
          content={t('Purchases.meta.description')}
        />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <SMain>
        <SCardsSection>
          {posts && posts.length > 0 && (
            <PostList
              category=''
              loading={isLoading}
              collection={posts}
              wrapperStyle={{
                left: 0,
              }}
              handlePostClicked={handleOpenPostModal}
              handleRemovePostFromState={handleRemovePostFromFavorites}
              handleAddPostToState={handleAddPostToFavorites}
            />
          )}
          {posts && posts.length === 0 && !isLoading && (
            <NoContentCard>
              <NoContentDescription>
                {t('Purchases.noContent.description')}
              </NoContentDescription>
            </NoContentCard>
          )}
        </SCardsSection>
        <div ref={loadingRef} />
      </SMain>
      {displayedPost && postModalOpen && (
        <PostModal
          isOpen={postModalOpen}
          post={displayedPost}
          handleClose={() => handleClosePostModal()}
          handleOpenAnotherPost={handleSetDisplayedPost}
        />
      )}
    </div>
  );
};

(MyProfilePurchases as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return (
    <MyProfileLayout
      renderedPage='purchases'
      postsCachedMyPurchases={page.props.pagedPosts.posts}
      postsCachedMyPurchasesFilter={newnewapi.Post.Filter.ALL}
      postsCachedMyPurchasesPageToken={page.props.nextPageTokenFromServer}
      postsCachedMyPurchasesCount={page.props.pagedPosts.totalCount}
    >
      {page}
    </MyProfileLayout>
  );
};

export default MyProfilePurchases;

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<any> {
  try {
    const translationContext = await serverSideTranslations(context.locale!!, [
      'common',
      'page-Profile',
      'component-PostCard',
      'modal-Post',
      'modal-PaymentModal',
      'modal-ResponseSuccessModal',
    ]);

    // const { req } = context;
    // // Try to fetch only if actual SSR needed
    // if (!context.req.url?.startsWith('/_next')) {
    //   const payload = new newnewapi.GetRelatedToMePostsRequest({
    //     relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_PURCHASES,
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
    console.log(err);
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
