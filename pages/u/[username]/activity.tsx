/* eslint-disable no-unused-vars */
import React, {
  ReactElement, useCallback, useEffect, useState,
} from 'react';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import type { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';

import { Tab } from '../../../components/molecules/Tabs';
import ProfileLayout from '../../../components/templates/ProfileLayout';
import { NextPageWithLayout } from '../../_app';
import { getUserByUsername } from '../../../api/endpoints/user';
import { fetchUsersPosts } from '../../../api/endpoints/post';

import PostModal from '../../../components/organisms/decision/PostModal';
import List from '../../../components/organisms/search/List';

interface IUserPageActivity {
  user: Omit<newnewapi.User, 'toJSON'>;
  pagedPosts?: newnewapi.PagedPostsResponse;
  cachedActivityPosts?: newnewapi.Post[];
  nextPageTokenFromServer?: string;
  handleAddNewPostsActivity: (newPosts: newnewapi.Post[]) => void;
}

const UserPageActivity: NextPage<IUserPageActivity> = ({
  user,
  pagedPosts,
  cachedActivityPosts,
  nextPageTokenFromServer,
  handleAddNewPostsActivity,
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
      const fetchUserPostsPayload = new newnewapi.GetUserPostsRequest({
        userUuid: user.uuid,
        filter: newnewapi.Post.Filter.ALL,
        // NB! TODO
        relation: newnewapi.GetUserPostsRequest.Relation.UNKNOWN_RELATION,
        paging: {
          ...(pageToken ? { pageToken } : {}),
        },
      });
      const postsResponse = await fetchUsersPosts(fetchUserPostsPayload);

      console.log(postsResponse);

      if (postsResponse.data && postsResponse.data.posts) {
        handleAddNewPostsActivity(postsResponse.data?.posts as newnewapi.Post[]);
        setPagingToken(postsResponse.data.paging?.nextPageToken);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error(err);
    }
  }, [
    handleAddNewPostsActivity, user.uuid,
    isLoading,
  ]);

  useEffect(() => {
    if (inView && !isLoading) {
      if (pagingToken) {
        // loadPostsDebounced(pagingToken);
        loadPosts(pagingToken);
      } else if (!pagingToken && cachedActivityPosts?.length === 0) {
        // loadPostsDebounced();
        loadPosts();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, pagingToken, isLoading]);

  return (
    <div>
      <main>
        <SCardsSection>
          {cachedActivityPosts && (
            <List
              category=""
              loading={isLoading}
              collection={cachedActivityPosts}
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

(UserPageActivity as NextPageWithLayout).getLayout = function getLayout(page: ReactElement) {
  const tabs: Tab[] = [
    {
      nameToken: 'userInitial',
      url: `/u/${page.props.user.username}`,
    },
    {
      nameToken: 'activity',
      url: `/u/${page.props.user.username}/activity`,
    },
  ];

  return (
    <ProfileLayout
      user={page.props.user}
      postsCachedActivity={page.props.pagedPosts.posts}
      tabs={tabs}
    >
      { page }
    </ProfileLayout>
  );
};

export default UserPageActivity;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username } = context.query;
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'profile', 'home', 'decision'],
  );

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

  if (!res.data || res.error) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // will fetch only for users with open activity history
  if (!res.data.options?.isActivityPrivate && !context.req.url?.startsWith('/_next')) {
  // if (res.data && !context.req.url?.startsWith('/_next')) {
    const fetchUserPostsPayload = new newnewapi.GetUserPostsRequest({
      userUuid: res.data.uuid,
      filter: newnewapi.Post.Filter.ALL,
      // NB! TODO
      relation: newnewapi.GetUserPostsRequest.Relation.UNKNOWN_RELATION,
      paging: {
        limit: 10,
      },
    });

    const postsResponse = await fetchUsersPosts(fetchUserPostsPayload);

    if (postsResponse.data) {
      console.log(postsResponse);
      return {
        props: {
          user: res.data.toJSON(),
          pagedPosts: postsResponse.data.toJSON(),
          ...(postsResponse.data.paging?.nextPageToken ? {
            nextPageTokenFromServer: postsResponse.data.paging?.nextPageToken,
          } : {}),
          ...translationContext,
        },
      };
    }
  }

  return {
    props: {
      user: res.data.toJSON(),
      pagedPosts: {},
      ...translationContext,
    },
  };
};

const SCardsSection = styled.div`
  display: flex;
  flex-wrap: wrap;

  margin-right: -16px !important;

  ${(props) => props.theme.media.tablet} {
    margin-right: -32px !important;
  }

`;
