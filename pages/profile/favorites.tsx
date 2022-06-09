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
import switchPostType from '../../utils/switchPostType';
import assets from '../../constants/assets';

const PostModal = dynamic(
  () => import('../../components/organisms/decision/PostModal')
);
const PostList = dynamic(
  () => import('../../components/organisms/see-more/PostList')
);

interface IMyProfileFavorites {
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

const MyProfileFavorites: NextPage<IMyProfileFavorites> = ({
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
  // Display post
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [displayedPost, setDisplayedPost] =
    useState<newnewapi.IPost | undefined>();

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const { ref: loadingRef, inView } = useInView();
  const { t } = useTranslation('profile');
  const [triedLoading, setTriedLoading] = useState(false);

  const handleOpenPostModal = (post: newnewapi.IPost) => {
    setDisplayedPost(post);
    setPostModalOpen(true);
  };

  const handleSetDisplayedPost = useCallback((post: newnewapi.IPost) => {
    setDisplayedPost(post);
  }, []);

  const handleClosePostModal = () => {
    setPostModalOpen(false);
    setDisplayedPost(undefined);
  };

  const handleRemovePostFromState = (postUuid: string) => {
    handleSetPosts((curr) => {
      const updated = curr.filter(
        (post) => switchPostType(post)[0].postUuid !== postUuid
      );
      return updated;
    });
  };

  const handleAddPostToState = (postToAdd: newnewapi.Post) => {
    handleSetPosts((curr) => {
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

  // TODO: filters and other parameters
  const loadPosts = useCallback(
    async (token?: string, needCount?: boolean) => {
      if (isLoading) return;
      try {
        setIsLoading(true);
        setTriedLoading(true);
        const payload = new newnewapi.GetRelatedToMePostsRequest({
          relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_FAVORITES,
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
              loading={isLoading}
              collection={posts}
              wrapperStyle={{
                left: 0,
              }}
              handlePostClicked={handleOpenPostModal}
              handleRemovePostFromState={(uuid: string) =>
                handleRemovePostFromState(uuid)
              }
            />
          )}
          {posts && posts.length === 0 && !isLoading && (
            <NoContentCard>
              <NoContentDescription>
                {t('Favorites.no-content.description')}
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
          handleRemovePostFromState={() =>
            handleRemovePostFromState(switchPostType(displayedPost)[0].postUuid)
          }
          handleAddPostToState={() =>
            handleAddPostToState(displayedPost as newnewapi.Post)
          }
        />
      )}
    </div>
  );
};

(MyProfileFavorites as NextPageWithLayout).getLayout = function getLayout(
  page: ReactElement
) {
  return (
    <MyProfileLayout
      renderedPage='favorites'
      postsCachedFavorites={page.props.pagedPosts.posts}
      postsCachedFavoritesFilter={newnewapi.Post.Filter.ALL}
      postsCachedFavoritesPageToken={page.props.nextPageTokenFromServer}
      postsCachedFavoritesCount={page.props.pagedPosts.totalCount}
    >
      {page}
    </MyProfileLayout>
  );
};

export default MyProfileFavorites;

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<any> {
  try {
    const translationContext = await serverSideTranslations(context.locale!!, [
      'common',
      'profile',
      'home',
      'decision',
      'payment-modal',
    ]);

    // const { req } = context;
    // // Try to fetch only if actual SSR needed
    // if (!context.req.url?.startsWith('/_next')) {
    //   const payload = new newnewapi.GetRelatedToMePostsRequest({
    //     relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_FAVORITES,
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
