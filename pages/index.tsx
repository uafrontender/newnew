/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  ReactElement, useEffect, useState,
} from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps, NextPage } from 'next';
import { newnewapi } from 'newnew-api';

import HomeLayout from '../components/templates/HomeLayout';
import TopSection from '../components/organisms/home/TopSection';
import HeroSection from '../components/organisms/home/HeroSection';
import CardsSection from '../components/organisms/home/CardsSection';
import PostModal from '../components/organisms/decision/PostModal';

import { useAppSelector } from '../redux-store/store';
import { fetchPostByUUID } from '../api/endpoints/post';
import { fetchLiveAuctions } from '../api/endpoints/auction';

import { NextPageWithLayout } from './_app';

import testUser1 from '../public/images/mock/test_user_1.jpg';

interface IHome {
  postFromQuery?: newnewapi.Post,
}

const Home: NextPage<IHome> = ({
  postFromQuery,
}) => {
  const { t } = useTranslation('home');
  const user = useAppSelector((state) => state.user);

  // Posts
  const [topSectionCollection, setTopSectionCollection] = useState<newnewapi.Post[]>([]);
  const [collectionAC, setCollectionAC] = useState<newnewapi.Post[]>([]);
  const [collectionMC, setCollectionMC] = useState<newnewapi.Post[]>([]);
  const [collectionCF, setCollectionCF] = useState<newnewapi.Post[]>([]);
  const [collectionBiggest, setCollectionBiggest] = useState<newnewapi.Post[]>([]);
  const [collectionCreator, setCollectionCreator] = useState<newnewapi.Post[]>([]);

  // Display post
  const [postModalOpen, setPostModalOpen] = useState(!!postFromQuery);
  const [displayedPost, setDisplayedPost] = useState<
  newnewapi.IPost | undefined>(postFromQuery ?? undefined);

  const handleOpenPostModal = (post: newnewapi.IPost) => {
    setDisplayedPost(post);
    setPostModalOpen(true);
  };

  const handleClosePostModal = () => {
    setPostModalOpen(false);
    setDisplayedPost(undefined);
  };

  useEffect(() => {
    async function fetchPosts() {
      try {
        const liveAuctionsPayload = new newnewapi.PagedRequest({

        });

        const resLiveAuctions = await fetchLiveAuctions(liveAuctionsPayload);

        console.log(resLiveAuctions.data?.posts);

        if (resLiveAuctions) {
          setCollectionAC(() => resLiveAuctions.data?.posts as newnewapi.Post[]);
        } else {
          throw new Error('Request failed');
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchPosts();
  }, []);

  return (
    <>
      <Head>
        <title>
          {t('home.meta.title')}
        </title>
      </Head>
      {!user.loggedIn && <HeroSection />}
      <TopSection
        collection={topSectionCollection}
        handlePostClicked={handleOpenPostModal}
      />
      {user.loggedIn && (
        <CardsSection
          title={t('for-you-block-title')}
          category="for-you"
          collection={collectionBiggest}
          handlePostClicked={handleOpenPostModal}
        />
      )}
      <CardsSection
        title={t('ac-block-title')}
        category="ac"
        collection={collectionAC}
        handlePostClicked={handleOpenPostModal}
      />
      <CardsSection
        title={t('mc-block-title')}
        category="mc"
        collection={collectionMC}
        handlePostClicked={handleOpenPostModal}
      />
      <CardsSection
        title={t('cf-block-title')}
        category="cf"
        collection={collectionCF}
        handlePostClicked={handleOpenPostModal}
      />
      <CardsSection
        title={t('biggest-block-title')}
        category="biggest"
        collection={collectionBiggest}
        handlePostClicked={handleOpenPostModal}
      />
      <CardsSection
        user={{
          avatar: testUser1,
          username: 'bellapoarch',
        }}
        type="creator"
        category="bellapoarch"
        collection={collectionCreator}
        handlePostClicked={handleOpenPostModal}
      />
      <PostModal
        isOpen={postModalOpen}
        post={displayedPost}
        handleClose={() => handleClosePostModal()}
      />
    </>
  );
};

(Home as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <HomeLayout>
    {page}
  </HomeLayout>
);

export default Home;

export const getServerSideProps:GetServerSideProps = async (context) => {
  const { post } = context.query;

  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'home', 'decision'],
  );

  if (post || !Array.isArray(post)) {
    const getPostPayload = new newnewapi.GetPostRequest({
      postUuid: post as string,
    });

    const res = await fetchPostByUUID(getPostPayload);

    if (res.data && !res.error) {
      return {
        props: {
          postFromQuery: res.data.toJSON(),
          ...translationContext,
        },
      };
    }
  }

  return {
    props: {
      ...translationContext,
    },
  };
};
