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

import MyProfileLayout from '../../components/templates/MyProfileLayout';
import PostModal from '../../components/organisms/decision/PostModal';
import List from '../../components/organisms/search/List';
import useUpdateEffect from '../../utils/hooks/useUpdateEffect';
import PostsFilterSection from '../../components/molecules/profile/PostsFilterSection';

interface IMyProfileSubscriptions {
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

const MyProfileSubscriptions: NextPage<IMyProfileSubscriptions> = ({
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
  const [displayedPost, setDisplayedPost] = useState<newnewapi.IPost | undefined>();

  // Loading state
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
    token?: string,
    needCount?: boolean,
  ) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      setTriedLoading(true);
      const payload = new newnewapi.GetRelatedToMePostsRequest({
        relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_SUBSCRIPTIONS,
        filter: postsFilter,
        paging: {
          ...(token ? { pageToken: token } : {}),
        },
        ...(needCount ? {
          needTotalCount: true,
        } : {}),
      });
      const postsResponse = await getMyPosts(
        payload,
      );

      if (postsResponse.data && postsResponse.data.posts) {
        handleSetPosts((curr) => [...curr, ...postsResponse.data?.posts as newnewapi.Post[]]);
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
  }, [
    handleSetPosts,
    handleUpdatePageToken,
    handleUpdateCount,
    postsFilter,
    isLoading,
  ]);

  useEffect(() => {
    if (inView && !isLoading) {
      if (pageToken) {
        loadPosts(pageToken);
      } else if (!triedLoading && !pageToken && posts?.length === 0) {
        loadPosts(undefined, true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pageToken, isLoading, triedLoading]);

  useUpdateEffect(() => {
    handleUpdatePageToken('');
    handleSetPosts([]);
    loadPosts(undefined, true);
  }, [postsFilter]);

  return (
    <div>
      <SMain>
        <PostsFilterSection
          numDecisions={totalCount}
          isLoading={isLoading}
          postsFilter={postsFilter}
          handleUpdateFilter={handleUpdateFilter}
        />
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
      </SMain>
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

(MyProfileSubscriptions as NextPageWithLayout).getLayout = function getLayout(page: ReactElement) {
  return (
    <MyProfileLayout
      renderedPage="subscriptions"
      postsCachedSubscriptions={page.props.pagedPosts.posts}
      postsCachedSubscriptionsFilter={newnewapi.Post.Filter.ALL}
      postsCachedSubscriptionsPageToken={page.props.nextPageTokenFromServer}
      postsCachedSubscriptionsCount={page.props.pagedPosts.totalCount}
    >
      { page }
    </MyProfileLayout>
  );
};

export default MyProfileSubscriptions;

export async function getServerSideProps(
  context: GetServerSidePropsContext,
): Promise<any> {
  try {
    const translationContext = await serverSideTranslations(
      context.locale!!,
      ['common', 'profile', 'home', 'decision', 'payment-modal'],
    );

    const { req } = context;
    // Try to fetch only if actual SSR needed
    if (!context.req.url?.startsWith('/_next')) {
      const payload = new newnewapi.GetRelatedToMePostsRequest({
        relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_SUBSCRIPTIONS,
        filter: newnewapi.Post.Filter.ALL,
        needTotalCount: true,
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
