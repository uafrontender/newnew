/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable no-nested-ternary */
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { newnewapi } from 'newnew-api';

import { useAppDispatch, useAppSelector } from '../../redux-store/store';
import { fetchCuratedPosts, fetchPostByUUID } from '../../api/endpoints/post';

import { NextPageWithLayout } from '../_app';
import HomeLayout from '../../components/templates/HomeLayout';
import switchPostType from '../../utils/switchPostType';
import { toggleMutedMode } from '../../redux-store/slices/uiStateSlice';
import isBrowser from '../../utils/isBrowser';

const PostModal = dynamic(
  () => import('../../components/organisms/decision/PostModal')
);

const TopSection = dynamic(
  () => import('../../components/organisms/home/TopSection')
);

const HeroSection = dynamic(
  () => import('../../components/organisms/home/HeroSection')
);

interface IPostPage {
  top10posts: newnewapi.NonPagedPostsResponse;
  postUuid: string;
  post: newnewapi.Post;
}

const PostPage: NextPage<IPostPage> = ({ top10posts, postUuid, post }) => {
  const router = useRouter();
  const { t } = useTranslation('decision');
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const { mutedMode, resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  const [postParsed, typeOfPost] = useMemo(
    () => (post ? switchPostType(post) : [undefined, undefined]),
    [post]
  );

  // Posts
  // Top section/Curated posts
  const [topSectionCollection, setTopSectionCollection] = useState<
    newnewapi.Post[]
  >((top10posts?.posts as newnewapi.Post[]) ?? []);

  // Display post
  const [postModalOpen, setPostModalOpen] = useState(!!post);
  const [displayedPost, setDisplayedPost] = useState<
    newnewapi.IPost | undefined
  >(post ?? undefined);

  const handleOpenPostModal = (postToOpen: newnewapi.IPost) => {
    setDisplayedPost(postToOpen);
    setPostModalOpen(true);
  };

  const handleSetDisplayedPost = useCallback((postToOpen: newnewapi.IPost) => {
    setDisplayedPost(postToOpen);
  }, []);

  const handleClosePostModal = () => {
    setPostModalOpen(false);
    setDisplayedPost(undefined);

    if (isBrowser()) {
      const { idx } = window.history.state;
      if (idx < 2) {
        router?.replace('/');
      }
    }
  };

  useEffect(() => {
    router.prefetch('/');
  }, [router]);

  useEffect(() => {
    // if (isSafari() && !mutedMode) {
    if (!mutedMode) {
      dispatch(toggleMutedMode(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isMobile && !postModalOpen) {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postModalOpen, isMobile]);

  return (
    <>
      <Head>
        <title>{t(`meta.${typeOfPost}.title`)}</title>
        <meta
          name='description'
          content={t(`meta.${typeOfPost}.description`)}
        />
        <meta property='og:title' content={postParsed?.title} />
        <meta
          property='og:url'
          content={`${process.env.NEXT_PUBLIC_APP_URL}/post/${postUuid}`}
        />
        <meta
          property='og:image'
          content={postParsed?.announcement?.thumbnailImageUrl ?? ''}
        />
      </Head>
      {!user.loggedIn && <HeroSection />}
      {!isMobile && topSectionCollection.length > 0 && (
        <TopSection
          collection={topSectionCollection}
          handlePostClicked={handleOpenPostModal}
        />
      )}
      {post && (
        <PostModal
          isOpen
          post={displayedPost}
          // Required to avoid wierd cases when navigating back to the post using browser back button
          manualCurrLocation='forced_redirect_to_home'
          handleClose={() => handleClosePostModal()}
          handleOpenAnotherPost={handleSetDisplayedPost}
        />
      )}
    </>
  );
};
export default PostPage;

(PostPage as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { post_uuid } = context.query;
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'profile',
    'decision',
    'component-PostCard',
    'payment-modal',
    'chat',
  ]);

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
