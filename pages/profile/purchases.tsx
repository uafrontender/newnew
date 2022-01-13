/* eslint-disable no-unused-vars */
import React, {
  ReactElement, useCallback, useEffect, useState,
} from 'react';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';

import { NextPageWithLayout } from '../_app';
import { getMyPosts } from '../../api/endpoints/user';
import { TTokenCookie } from '../../api/apiConfigs';

import { Tab } from '../../components/molecules/Tabs';
import MyProfileLayout from '../../components/templates/MyProfileLayout';
import PostModal from '../../components/organisms/decision/PostModal';
import List from '../../components/organisms/search/List';

// Temp
const tabs: Tab[] = [
  {
    nameToken: 'activelyBidding',
    url: '/profile',
  },
  {
    nameToken: 'purchases',
    url: '/profile/purchases',
  },
  {
    nameToken: 'viewHistory',
    url: '/profile/view-history',
  },
  {
    nameToken: 'subscriptions',
    url: '/profile/subscriptions',
  },
  {
    nameToken: 'favorites',
    url: '/profile/favorites',
  },
];

interface IMyProfilePurchases {
  user: Omit<newnewapi.User, 'toJSON'>;
  pagedPosts?: newnewapi.PagedPostsResponse;
  posts?: newnewapi.Post[];
  postsForPageFilter: newnewapi.Post.Filter;
  nextPageTokenFromServer?: string;
  handleSetPosts: React.Dispatch<React.SetStateAction<newnewapi.Post[]>>;
}

const MyProfilePurchases: NextPage<IMyProfilePurchases> = ({
  user,
  pagedPosts,
  posts,
  postsForPageFilter,
  nextPageTokenFromServer,
  handleSetPosts,
}) => {
  // Display post
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [displayedPost, setDisplayedPost] = useState<newnewapi.IPost | undefined>();

  // Loading state
  const [pagingToken, setPagingToken] = useState<string | null | undefined>(nextPageTokenFromServer ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const {
    ref: loadingRef,
    inView,
  } = useInView();
  const [triedLoading, setTriedLoading] = useState(false);

  const handleOpenPostModal = (post: newnewapi.IPost) => {
    setDisplayedPost(post);
    setPostModalOpen(true);
  };

  const handleSetDisplayedPost = (post: newnewapi.IPost) => {
    setDisplayedPost(post);
  };

  const handleClosePostModal = () => {
    setPostModalOpen(false);
    setDisplayedPost(undefined);
  };

  // TODO: filters and other parameters
  const loadPosts = useCallback(async (
    pageToken?: string,
  ) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      setTriedLoading(true);
      const payload = new newnewapi.GetRelatedToMePostsRequest({
        relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_PURCHASES,
        filter: postsForPageFilter,
        paging: {
          ...(pageToken ? { pageToken } : {}),
        },
      });
      const postsResponse = await getMyPosts(
        payload,
      );

      console.log(postsResponse);

      if (postsResponse.data && postsResponse.data.posts) {
        handleSetPosts((curr) => [...curr, ...postsResponse.data?.posts as newnewapi.Post[]]);
        setPagingToken(postsResponse.data.paging?.nextPageToken);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    }
  }, [
    handleSetPosts,
    postsForPageFilter,
    isLoading,
  ]);

  useEffect(() => {
    if (inView && !isLoading) {
      if (pagingToken) {
        // loadPostsDebounced(pagingToken);
        loadPosts(pagingToken);
      } else if (!triedLoading && !pagingToken && posts?.length === 0) {
        // loadPostsDebounced();
        loadPosts();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pagingToken, isLoading, triedLoading]);

  return (
    <div>
      <main>
        <SCardsSection>
          {posts && (
            <List
              category=""
              loading={isLoading}
              collection={posts}
              wrapperStyle={{
                left: 0,
              }}
              handlePostClicked={handleOpenPostModal}
            />
          )}
        </SCardsSection>
        <div
          ref={loadingRef}
        />
      </main>
      {displayedPost && (
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

(MyProfilePurchases as NextPageWithLayout).getLayout = function getLayout(page: ReactElement) {
  return (
    <MyProfileLayout
      tabs={tabs}
      renderedPage="purchases"
      postsCachedMyPurchases={page.props.pagedPosts.posts}
      postsCachedMyPurchasesFilter={newnewapi.Post.Filter.ALL}
    >
      { page }
    </MyProfileLayout>
  );
};

export default MyProfilePurchases;

export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<any> {
  try {
    const translationContext = await serverSideTranslations(
      context.locale!!,
      ['common', 'profile', 'home', 'decision'],
    );

    const { req } = context;
    // Try to fetch only if actual SSR needed
    if (!context.req.url?.startsWith('/_next')) {
      const payload = new newnewapi.GetRelatedToMePostsRequest({
        relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_PURCHASES,
        filter: newnewapi.Post.Filter.ALL,
      });
      const res = await getMyPosts(
        payload,
        {
          accessToken: req.cookies?.accessToken,
          refreshToken: req.cookies?.refreshToken,
        },
        (tokens: TTokenCookie[]) => {
          const parsedTokens = tokens.map((t) => `${t.name}=${t.value}; ${t.expires ? `expires=${t.expires}; ` : ''} ${t.maxAge ? `max-age=${t.maxAge}; ` : ''}`);
          context.res.setHeader(
            'set-cookie',
            parsedTokens,
          );
        },
      );

      console.log(res);

      if (res.data) {
        return {
          props: {
            pagedPosts: res.data.toJSON(),
            ...(res.data.paging?.nextPageToken ? {
              nextPageTokenFromServer: res.data.paging?.nextPageToken,
            } : {}),
            ...translationContext,
          },
        };
      }
    }

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

const SCardsSection = styled.div`
  display: flex;
  flex-wrap: wrap;

  margin-right: -16px !important;

  ${(props) => props.theme.media.tablet} {
    margin-right: -32px !important;
  }

`;
