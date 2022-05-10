/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import type { GetServerSideProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';

import { NextPageWithLayout } from './_app';
import HomeLayout from '../components/templates/HomeLayout';
import { useAppSelector } from '../redux-store/store';
import {
  fetchPostByUUID,
  fetchForYouPosts,
  fetchCuratedPosts,
  fetchBiggestPosts,
  fetchFeaturedCreatorPosts,
} from '../api/endpoints/post';
import { fetchLiveAuctions } from '../api/endpoints/auction';
import { fetchTopCrowdfundings } from '../api/endpoints/crowdfunding';
import { fetchTopMultipleChoices } from '../api/endpoints/multiple_choice';

import switchPostType from '../utils/switchPostType';
import isBrowser from '../utils/isBrowser';
import assets from '../constants/assets';

const TopSection = dynamic(
  () => import('../components/organisms/home/TopSection')
);
const HeroSection = dynamic(
  () => import('../components/organisms/home/HeroSection')
);
const CardsSection = dynamic(
  () => import('../components/organisms/home/CardsSection')
);
const PostModal = dynamic(
  () => import('../components/organisms/decision/PostModal')
);
const TutorialCard = dynamic(
  () => import('../components/molecules/TutorialCard')
);

interface IHome {
  top10posts: newnewapi.NonPagedPostsResponse;
  postFromQuery?: newnewapi.Post;
}

// No sense to memorize
const Home: NextPage<IHome> = ({ top10posts, postFromQuery }) => {
  const { t } = useTranslation('home');
  const user = useAppSelector((state) => state.user);

  // Posts
  // Top section/Curated posts
  const [topSectionCollection, setTopSectionCollection] = useState<
    newnewapi.Post[]
  >((top10posts?.posts as newnewapi.Post[]) ?? []);
  // For you - authenticated users only
  const [collectionFY, setCollectionFY] = useState<newnewapi.Post[]>([]);
  const [collectionFYInitialLoading, setCollectionFYInitialLoading] =
    useState(false);
  const [collectionFYError, setCollectionFYError] = useState(false);
  // Auctions
  const [collectionAC, setCollectionAC] = useState<newnewapi.Post[]>([]);
  const [collectionACInitialLoading, setCollectionACInitialLoading] =
    useState(false);
  const [collectionACError, setCollectionACError] = useState(false);
  // Multiple choice
  const [collectionMC, setCollectionMC] = useState<newnewapi.Post[]>([]);
  const [collectionMCInitialLoading, setCollectionMCInitialLoading] =
    useState(false);
  const [collectionMCError, setCollectionMCError] = useState(false);
  // Crowdfunding
  const [collectionCF, setCollectionCF] = useState<newnewapi.Post[]>([]);
  const [collectionCFInitialLoading, setCollectionCFInitialLoading] =
    useState(false);
  const [collectionCFError, setCollectionCFError] = useState(false);
  // Biggest of all time
  const [collectionBiggest, setCollectionBiggest] = useState<newnewapi.Post[]>(
    []
  );
  const [collectionBiggestInitialLoading, setCollectionBiggestInitialLoading] =
    useState(false);
  const [collectionBiggestError, setCollectionBiggestError] = useState(false);
  // Creator on the rise
  const [collectionCreator, setCollectionCreator] = useState<newnewapi.Post[]>(
    []
  );
  const [collectionCreatorInitialLoading, setCollectionCreatorInitialLoading] =
    useState(false);
  const [collectionCreatorError, setCollectionCreatorError] = useState(false);

  // Display post
  // const [postModalOpen, setPostModalOpen] = useState(!!postFromQuery);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [displayedPost, setDisplayedPost] = useState<
    newnewapi.IPost | undefined
  >(postFromQuery ?? undefined);

  const handleOpenPostModal = useCallback(
    (post: newnewapi.IPost) => {
      setDisplayedPost(post);
      setPostModalOpen(true);
    },
    [setDisplayedPost, setPostModalOpen]
  );

  const handleSetDisplayedPost = useCallback((post: newnewapi.IPost) => {
    setDisplayedPost(post);
  }, []);

  const handleClosePostModal = useCallback(() => {
    setPostModalOpen(false);
    setDisplayedPost(undefined);
  }, []);

  // Fetch top posts of various types
  // FY posts
  useEffect(() => {
    async function fetchFYPosts() {
      try {
        setCollectionFYInitialLoading(true);

        const fyPayload = new newnewapi.PagedRequest({
          paging: {
            limit: 10,
          },
        });

        const resFY = await fetchForYouPosts(fyPayload);

        if (resFY) {
          setCollectionFY(() => resFY.data?.posts as newnewapi.Post[]);
          setCollectionFYInitialLoading(false);
        } else {
          throw new Error('Request failed');
        }
      } catch (err) {
        setCollectionFYInitialLoading(false);
        setCollectionFYError(true);
      }
    }

    if (user.loggedIn) {
      fetchFYPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live Auctions posts
  useEffect(() => {
    async function fetchAuctions() {
      try {
        setCollectionACInitialLoading(true);

        const liveAuctionsPayload = new newnewapi.PagedAuctionsRequest({
          sorting: newnewapi.PostSorting.MOST_FUNDED_FIRST,
        });

        const resLiveAuctions = await fetchLiveAuctions(liveAuctionsPayload);

        if (resLiveAuctions) {
          setCollectionAC(
            () => resLiveAuctions.data?.auctions as newnewapi.Post[]
          );
          setCollectionACInitialLoading(false);
        } else {
          throw new Error('Request failed');
        }
      } catch (err) {
        setCollectionACInitialLoading(false);
        setCollectionACError(true);
      }
    }

    fetchAuctions();
  }, []);

  // Top Multiple Choices
  useEffect(() => {
    async function fetchMultipleChoices() {
      try {
        setCollectionMCInitialLoading(true);
        const multichoicePayload = new newnewapi.PagedMultipleChoicesRequest({
          sorting: newnewapi.PostSorting.MOST_FUNDED_FIRST,
        });

        const resMultichoices = await fetchTopMultipleChoices(
          multichoicePayload
        );

        if (resMultichoices) {
          setCollectionMC(
            () => resMultichoices.data?.multipleChoices as newnewapi.Post[]
          );
          setCollectionMCInitialLoading(false);
        } else {
          throw new Error('Request failed');
        }
      } catch (err) {
        setCollectionMCInitialLoading(false);
        setCollectionMCError(true);
      }
    }

    fetchMultipleChoices();
  }, []);

  // Top Crowdfunding
  useEffect(() => {
    async function fetchCrowdfundings() {
      try {
        setCollectionCFInitialLoading(true);
        const cfPayload = new newnewapi.PagedCrowdfundingsRequest({
          sorting: newnewapi.PostSorting.MOST_FUNDED_FIRST,
        });

        const resCF = await fetchTopCrowdfundings(cfPayload);

        if (resCF) {
          setCollectionCF(() => resCF.data?.crowdfundings as newnewapi.Post[]);
          setCollectionCFInitialLoading(false);
        } else {
          throw new Error('Request failed');
        }
      } catch (err) {
        setCollectionCFInitialLoading(false);
        setCollectionCFError(true);
      }
    }

    fetchCrowdfundings();
  }, []);

  // Biggest of all time
  useEffect(() => {
    async function fetchBiggest() {
      try {
        setCollectionBiggestInitialLoading(true);
        const biggestPayload = new newnewapi.PagedRequest({});

        const resBiggest = await fetchBiggestPosts(biggestPayload);

        if (resBiggest) {
          setCollectionBiggest(
            () => resBiggest.data?.posts as newnewapi.Post[]
          );
          setCollectionBiggestInitialLoading(false);
        } else {
          throw new Error('Request failed');
        }
      } catch (err) {
        setCollectionBiggestInitialLoading(false);
        setCollectionBiggestError(true);
      }
    }

    fetchBiggest();
  }, []);

  // Creator on the rise
  useEffect(() => {
    async function fetchCreatorOnRise() {
      try {
        setCollectionCreatorInitialLoading(true);
        const creatorOnRisePayload = new newnewapi.EmptyRequest({});

        const resCreatorOnRisePayload = await fetchFeaturedCreatorPosts(
          creatorOnRisePayload
        );

        if (resCreatorOnRisePayload) {
          setCollectionCreator(
            () => resCreatorOnRisePayload.data?.posts as newnewapi.Post[]
          );
          setCollectionCreatorInitialLoading(false);
        } else {
          throw new Error('Request failed');
        }
      } catch (err) {
        setCollectionCreatorInitialLoading(false);
        setCollectionCreatorError(true);
      }
    }

    fetchCreatorOnRise();
  }, []);

  return (
    <>
      <Head>
        <title>{t('home.meta.title')}</title>
      </Head>
      {!user.loggedIn && <HeroSection />}
      {topSectionCollection.length > 0 && (
        <TopSection
          collection={topSectionCollection}
          handlePostClicked={handleOpenPostModal}
        />
      )}
      {user.loggedIn && !collectionFYError && (
        <CardsSection
          title={t('for-you-block-title')}
          category='for-you'
          collection={collectionFY}
          loading={collectionFYInitialLoading}
          handlePostClicked={handleOpenPostModal}
        />
      )}
      {!collectionACError && (
        <CardsSection
          title={t('ac-block-title')}
          category='ac'
          collection={collectionAC}
          loading={collectionACInitialLoading}
          handlePostClicked={handleOpenPostModal}
          tutorialCard={
            !user.loggedIn ? (
              <TutorialCard
                image={assets.creation.AcAnimated}
                title={t('ac-block-tutorial-card.title')}
                caption={t('ac-block-tutorial-card.caption')}
                imageStyle={{
                  position: 'relative',
                  left: '10%',
                }}
              />
            ) : undefined
          }
        />
      )}
      {!collectionMCError && (
        <CardsSection
          title={t('mc-block-title')}
          category='mc'
          collection={collectionMC}
          loading={collectionMCInitialLoading}
          handlePostClicked={handleOpenPostModal}
          tutorialCard={
            !user.loggedIn ? (
              <TutorialCard
                image={assets.creation.McAnimated}
                title={t('mc-block-tutorial-card.title')}
                caption={t('mc-block-tutorial-card.caption')}
              />
            ) : undefined
          }
        />
      )}
      {!collectionCFError && (
        <CardsSection
          title={t('cf-block-title')}
          category='cf'
          collection={collectionCF}
          loading={collectionCFInitialLoading}
          handlePostClicked={handleOpenPostModal}
          tutorialCard={
            !user.loggedIn ? (
              <TutorialCard
                image={assets.creation.CfAnimated}
                title={t('cf-block-tutorial-card.title')}
                caption={t('cf-block-tutorial-card.caption')}
                imageStyle={{
                  position: 'relative',
                  left: '5%',
                }}
              />
            ) : undefined
          }
        />
      )}
      {!collectionBiggestError &&
      collectionBiggestInitialLoading &&
      collectionBiggest?.length > 0 ? (
        <CardsSection
          title={t('biggest-block-title')}
          category='biggest'
          collection={collectionBiggest}
          loading={collectionBiggestInitialLoading}
          handlePostClicked={handleOpenPostModal}
        />
      ) : null}
      {!collectionCreatorInitialLoading && collectionCreator?.length > 0 ? (
        <CardsSection
          user={{
            avatarUrl: switchPostType(collectionCreator[0])[0].creator
              ?.avatarUrl!!,
            username: switchPostType(collectionCreator[0])[0].creator
              ?.username!!,
          }}
          type='creator'
          category={`/${
            switchPostType(collectionCreator[0])[0].creator?.username as string
          }`}
          collection={collectionCreator}
          handlePostClicked={handleOpenPostModal}
        />
      ) : null}
      {displayedPost && (
        <PostModal
          isOpen={postModalOpen}
          post={displayedPost}
          manualCurrLocation={isBrowser() ? window.location.pathname : ''}
          handleClose={handleClosePostModal}
          handleOpenAnotherPost={handleSetDisplayedPost}
        />
      )}
    </>
  );
};

(Home as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { post } = context.query;

  // console.log(context.query['?session_id']);

  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'home',
    'decision',
    'payment-modal',
    'chat',
  ]);

  const top10payload = new newnewapi.EmptyRequest({});

  const resTop10 = await fetchCuratedPosts(top10payload);

  if (post || !Array.isArray(post)) {
    const getPostPayload = new newnewapi.GetPostRequest({
      postUuid: post as string,
    });

    const res = await fetchPostByUUID(getPostPayload);

    // NB! Need to tackle toJSON() method

    if (res.data && !res.error) {
      return {
        props: {
          ...(resTop10.data
            ? {
                top10posts: resTop10.data.toJSON(),
              }
            : {}),
          postFromQuery: res.data.toJSON(),
          ...translationContext,
        },
      };
    }
  }

  return {
    props: {
      ...(resTop10.data
        ? {
            top10posts: resTop10.data.toJSON(),
          }
        : {}),
      ...translationContext,
    },
  };
};
