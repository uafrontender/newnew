/* eslint-disable no-unused-vars */
import React, { ReactElement, useState } from 'react';
import styled from 'styled-components';
import type { GetServerSideProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';

import { Tab } from '../../../components/molecules/Tabs';
import ProfileLayout from '../../../components/templates/ProfileLayout';
import { NextPageWithLayout } from '../../_app';
import { getUserByUsername } from '../../../api/endpoints/user';
import { fetchUsersPosts } from '../../../api/endpoints/post';

import PostModal from '../../../components/organisms/decision/PostModal';
import CardsSection from '../../../components/organisms/home/CardsSection';

interface IUserPageIndex {
  user: Omit<newnewapi.User, 'toJSON'>;
  pagedPosts?: newnewapi.PagedPostsResponse;
  cachedPosts?: newnewapi.Post[];
}

const UserPageIndex: NextPage<IUserPageIndex> = ({
  user,
  pagedPosts,
  cachedPosts,
}) => {
  // Display post
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [displayedPost, setDisplayedPost] = useState<newnewapi.IPost | undefined>();

  const handleOpenPostModal = (post: newnewapi.IPost) => {
    setDisplayedPost(post);
    setPostModalOpen(true);
  };

  const handleClosePostModal = () => {
    setPostModalOpen(false);
    setDisplayedPost(undefined);
  };

  return (
    <div>
      <main>
        <SCardsSection>
          {cachedPosts && (
            <CardsSection
              title=""
              category=""
              collection={cachedPosts}
              handlePostClicked={handleOpenPostModal}
            />
          )}
        </SCardsSection>
      </main>
      <PostModal
        isOpen={postModalOpen}
        post={displayedPost}
        handleClose={() => handleClosePostModal()}
      />
    </div>
  );
};

(UserPageIndex as NextPageWithLayout).getLayout = function getLayout(page: ReactElement) {
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
      postsCachedCreatorDecisions={page.props.pagedPosts.posts}
      tabs={tabs}
    >
      { page }
    </ProfileLayout>
  );
};

export default UserPageIndex;

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

  // will fetch only for creators
  // if (res.data.options?.isCreator) {
  if (res.data) {
    const fetchUserPostsPayload = new newnewapi.GetTheirPostsRequest({
      userUuid: res.data.uuid,
    });

    const postsResponse = await fetchUsersPosts(fetchUserPostsPayload);

    console.log(postsResponse);

    if (postsResponse.data) {
      return {
        props: {
          user: res.data.toJSON(),
          pagedPosts: postsResponse.data.toJSON(),
          ...translationContext,
        },
      };
    }
  }

  return {
    props: {
      user: res.data.toJSON(),
      ...translationContext,
    },
  };
};

const SCardsSection = styled.div`
  display: flex;
  flex-wrap: wrap;

  gap: 16px;

  ${({ theme }) => theme.media.laptop} {
    gap: 32px;
  }

`;
