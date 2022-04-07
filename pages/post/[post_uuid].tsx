/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable no-nested-ternary */
import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import { useAppSelector } from '../../redux-store/store';
import { fetchCuratedPosts, fetchPostByUUID } from '../../api/endpoints/post';

import { NextPageWithLayout } from '../_app';
import HomeLayout from '../../components/templates/HomeLayout';
import PostModal from '../../components/organisms/decision/PostModal';
import TopSection from '../../components/organisms/home/TopSection';
import HeroSection from '../../components/organisms/home/HeroSection';
import switchPostType from '../../utils/switchPostType';

interface IPostPage {
  top10posts: newnewapi.NonPagedPostsResponse;
  postUuid: string;
  post: newnewapi.Post;
}

const PostPage: NextPage<IPostPage> = ({
  top10posts,
  postUuid,
  post,
}) => {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  const [postParsed, typeOfPost] = useMemo(() => (
    post ? switchPostType(post) : [undefined, undefined]
  ), [post]);

  // Posts
  // Top section/Curated posts
  const [topSectionCollection, setTopSectionCollection] = useState<newnewapi.Post[]>(
    (top10posts?.posts as newnewapi.Post[]) ?? []
  );

  // Display post
  const [postModalOpen, setPostModalOpen] = useState(!!post);
  const [displayedPost, setDisplayedPost] = useState<newnewapi.IPost | undefined>(post ?? undefined);

  const handleOpenPostModal = (postToOpen: newnewapi.IPost) => {
    setDisplayedPost(postToOpen);
    setPostModalOpen(true);
  };

  const handleSetDisplayedPost = (postToOpen: newnewapi.IPost) => {
    setDisplayedPost(postToOpen);
  };

  const handleClosePostModal = () => {
    setPostModalOpen(false);
    setDisplayedPost(undefined);

    router.push('/');
  };

  useEffect(() => {
    router.prefetch('/');
  }, [router]);

  return (
    <>
      <Head>
        <title>
          {postParsed?.title}
        </title>
        <meta property="og:title" content={postParsed?.title} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_APP_URL}/post/${postUuid}`} />
        <meta property="og:image" content={postParsed?.announcement?.thumbnailImageUrl ?? ''} />
      </Head>
      {!user.loggedIn && <HeroSection />}
      {topSectionCollection.length > 0 && (
        <TopSection collection={topSectionCollection} handlePostClicked={handleOpenPostModal} />
      )}
      {post && (
        <PostModal
          isOpen
          post={displayedPost}
          manualCurrLocation="/"
          handleClose={() => handleClosePostModal()}
          handleOpenAnotherPost={handleSetDisplayedPost}
        />
      )}
    </>
  );
};
export default PostPage;

(PostPage as NextPageWithLayout).getLayout = (page: ReactElement) => <HomeLayout>{page}</HomeLayout>;

export const getServerSideProps:GetServerSideProps = async (context) => {
  const { post_uuid } = context.query;
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'profile', 'decision', 'home', 'payment-modal'],
  );

  if (!post_uuid || Array.isArray(post_uuid)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const getPostPayload = new newnewapi.GetPostRequest({
    postUuid: post_uuid,
  });

  const res = await fetchPostByUUID(getPostPayload);

  if (!res.data || res.error) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const top10payload = new newnewapi.EmptyRequest({});

  const resTop10 = await fetchCuratedPosts(top10payload);

  return {
    props: {
      ...(resTop10.data
      ? {
          top10posts: resTop10.data.toJSON(),
        }
      : {}),
      postUuid: post_uuid,
      post: res.data.toJSON(),
      ...translationContext,
    },
  };
};
