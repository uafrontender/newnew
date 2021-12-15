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
import {
  fetchBiggestPosts, fetchCuratedPosts, fetchFeaturedCreatorPosts, fetchPostByUUID,
} from '../api/endpoints/post';
import { fetchLiveAuctions } from '../api/endpoints/auction';

import { NextPageWithLayout } from './_app';

import testUser1 from '../public/images/mock/test_user_1.jpg';
import { fetchTopMultipleChoices } from '../api/endpoints/multiple_choice';
import { fetchTopCrowdfundings } from '../api/endpoints/crowdfunding';
import switchPostType from '../utils/switchPostType';

interface IHome {
  top10posts: newnewapi.NonPagedPostsResponse,
  postFromQuery?: newnewapi.Post,
}

const Home: NextPage<IHome> = ({
  top10posts,
  postFromQuery,
}) => {
  const { t } = useTranslation('home');
  const user = useAppSelector((state) => state.user);

  // Posts
  // Top section/Curated posts
  const [
    topSectionCollection, setTopSectionCollection,
  ] = useState<newnewapi.Post[]>(top10posts.posts as newnewapi.Post[]);
  // Auctions
  const [collectionAC, setCollectionAC] = useState<newnewapi.Post[]>([]);
  const [collectionACInitialLoading, setCollectionACInitialLoading] = useState(false);
  const [collectionACLoading, setCollectionACLoading] = useState(false);
  // Multiple choice
  const [collectionMC, setCollectionMC] = useState<newnewapi.Post[]>([]);
  const [collectionMCInitialLoading, setCollectionMCInitialLoading] = useState(false);
  const [collectionMCLoading, setCollectionMCLoading] = useState(false);
  // Crowdfunding
  const [collectionCF, setCollectionCF] = useState<newnewapi.Post[]>([]);
  const [collectionCFInitialLoading, setCollectionCFInitialLoading] = useState(false);
  const [collectionCFLoading, setCollectionCFLoading] = useState(false);
  // Biggest of all time
  const [collectionBiggest, setCollectionBiggest] = useState<newnewapi.Post[]>([]);
  const [collectionBiggestInitialLoading, setCollectionBiggestInitialLoading] = useState(false);
  const [collectionBiggestLoading, setCollectionBiggestLoading] = useState(false);
  // Creator on the rise
  const [collectionCreator, setCollectionCreator] = useState<newnewapi.Post[]>([]);
  const [collectionCreatorInitialLoading, setCollectionCreatorInitialLoading] = useState(false);
  const [collectionCreatorLoading, setCollectionCreatorLoading] = useState(false);

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
    async function fetchPostsInitial() {
      try {
        setCollectionACInitialLoading(true);
        setCollectionMCInitialLoading(true);
        setCollectionCFInitialLoading(true);
        setCollectionBiggestInitialLoading(true);
        setCollectionCreatorInitialLoading(true);

        const liveAuctionsPayload = new newnewapi.PagedRequest({});

        const resLiveAuctions = await fetchLiveAuctions(liveAuctionsPayload);

        if (resLiveAuctions) {
          setCollectionAC(() => resLiveAuctions.data?.posts as newnewapi.Post[]);
          setCollectionACInitialLoading(false);
        } else {
          throw new Error('Request failed');
        }

        const multichoicePayload = new newnewapi.PagedRequest({});

        const resMultichoices = await fetchTopMultipleChoices(multichoicePayload);

        if (resMultichoices) {
          setCollectionMC(() => resMultichoices.data?.multipleChoices as newnewapi.Post[]);
          setCollectionMCInitialLoading(false);
        } else {
          throw new Error('Request failed');
        }

        const cfPayload = new newnewapi.PagedRequest({});

        const resCF = await fetchTopCrowdfundings(cfPayload);

        if (resCF) {
          setCollectionCF(() => resCF.data?.crowdfundings as newnewapi.Post[]);
          setCollectionCFInitialLoading(false);
        } else {
          throw new Error('Request failed');
        }

        const biggestPayload = new newnewapi.PagedRequest({});

        const resBiggest = await fetchBiggestPosts(biggestPayload);

        if (resBiggest) {
          setCollectionBiggest(() => resBiggest.data?.posts as newnewapi.Post[]);
          setCollectionBiggestInitialLoading(false);
        } else {
          throw new Error('Request failed');
        }

        const creatorOnRisePayload = new newnewapi.EmptyRequest({});

        const resCreatorOnRisePayload = await fetchFeaturedCreatorPosts(creatorOnRisePayload);

        if (resCreatorOnRisePayload) {
          setCollectionCreator(() => resCreatorOnRisePayload.data?.posts as newnewapi.Post[]);
          setCollectionCreatorInitialLoading(false);
        } else {
          throw new Error('Request failed');
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchPostsInitial();
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
        loading={collectionACInitialLoading}
        handlePostClicked={handleOpenPostModal}
      />
      <CardsSection
        title={t('mc-block-title')}
        category="mc"
        collection={collectionMC}
        loading={collectionMCInitialLoading}
        handlePostClicked={handleOpenPostModal}
      />
      <CardsSection
        title={t('cf-block-title')}
        category="cf"
        collection={collectionCF}
        loading={collectionCFInitialLoading}
        handlePostClicked={handleOpenPostModal}
      />
      <CardsSection
        title={t('biggest-block-title')}
        category="biggest"
        collection={collectionBiggest}
        loading={collectionBiggestInitialLoading}
        handlePostClicked={handleOpenPostModal}
      />
      {!collectionCreatorInitialLoading && collectionCreator.length > 0 ? (
        <CardsSection
          user={{
            avatarUrl: switchPostType(collectionCreator[0])[0].creator?.avatarUrl!!,
            username: switchPostType(collectionCreator[0])[0].creator?.username!!,
          }}
          type="creator"
          category={`u/${switchPostType(collectionCreator[0])[0].creator?.username as string}`}
          collection={collectionCreator}
          handlePostClicked={handleOpenPostModal}
        />
      ) : null}
      {displayedPost && (
        <PostModal
          isOpen={postModalOpen}
          post={displayedPost}
          handleClose={() => handleClosePostModal()}
        />
      )}
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

  const top10payload = new newnewapi.EmptyRequest({});

  const resTop10 = await fetchCuratedPosts(top10payload);

  if (!resTop10.data?.posts || resTop10.error) {
    throw new Error('Request failed');
  }

  if (post || !Array.isArray(post)) {
    const getPostPayload = new newnewapi.GetPostRequest({
      postUuid: post as string,
    });

    const res = await fetchPostByUUID(getPostPayload);

    if (res.data && !res.error) {
      return {
        props: {
          top10posts: resTop10.data.toJSON(),
          postFromQuery: res.data.toJSON(),
          ...translationContext,
        },
      };
    }
  }

  return {
    props: {
      top10posts: resTop10.data.toJSON(),
      ...translationContext,
    },
  };
};
