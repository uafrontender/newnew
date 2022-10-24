/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useEffect, useState } from 'react';
import Head from 'next/head';
import type { GetServerSideProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { useTheme } from 'styled-components';

import { NextPageWithLayout } from './_app';
import HomeLayout from '../components/templates/HomeLayout';
import { useAppSelector } from '../redux-store/store';
import {
  fetchForYouPosts,
  fetchCuratedPosts,
  fetchBiggestPosts,
  fetchFeaturedCreatorPosts,
} from '../api/endpoints/post';
import { fetchLiveAuctions } from '../api/endpoints/auction';
// import { fetchTopCrowdfundings } from '../api/endpoints/crowdfunding';
import { fetchTopMultipleChoices } from '../api/endpoints/multiple_choice';

import switchPostType from '../utils/switchPostType';
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
const TutorialCard = dynamic(
  () => import('../components/molecules/TutorialCard')
);

interface IHome {
  top10posts: newnewapi.NonPagedPostsResponse;
  assumeLoggedIn?: boolean;
}

// No sense to memorize
const Home: NextPage<IHome> = ({ top10posts, assumeLoggedIn }) => {
  const { t } = useTranslation('page-Home');
  const theme = useTheme();
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
    useState(true);
  const [collectionACError, setCollectionACError] = useState(false);
  // Multiple choice
  const [collectionMC, setCollectionMC] = useState<newnewapi.Post[]>([]);
  const [collectionMCInitialLoading, setCollectionMCInitialLoading] =
    useState(true);
  const [collectionMCError, setCollectionMCError] = useState(false);
  // Crowdfunding
  // const [collectionCF, setCollectionCF] = useState<newnewapi.Post[]>([]);
  // const [collectionCFInitialLoading, setCollectionCFInitialLoading] =
  //   useState(true);
  // const [collectionCFError, setCollectionCFError] = useState(false);
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

    return () => {};
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
  // useEffect(() => {
  //   async function fetchCrowdfundings() {
  //     try {
  //       setCollectionCFInitialLoading(true);
  //       const cfPayload = new newnewapi.PagedCrowdfundingsRequest({
  //         sorting: newnewapi.PostSorting.MOST_FUNDED_FIRST,
  //       });
  //
  //       const resCF = await fetchTopCrowdfundings(cfPayload);
  //
  //       if (resCF) {
  //         setCollectionCF(() => resCF.data?.crowdfundings as newnewapi.Post[]);
  //         setCollectionCFInitialLoading(false);
  //       } else {
  //         throw new Error('Request failed');
  //       }
  //     } catch (err) {
  //       setCollectionCFInitialLoading(false);
  //       setCollectionCFError(true);
  //     }
  //   }
  //
  //   fetchCrowdfundings();
  // }, []);

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
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
        <meta property='og:title' content={t('meta.title')} />
        <meta property='og:description' content={t('meta.description')} />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      {(!user.loggedIn || !assumeLoggedIn) && <HeroSection />}
      {topSectionCollection?.length > 0 && (
        <TopSection collection={topSectionCollection} />
      )}
      {user.loggedIn &&
        !collectionFYError &&
        (collectionFYInitialLoading || collectionFY?.length > 0) && (
          <CardsSection
            title={t('cardsSection.title.for-you')}
            category='for-you'
            collection={collectionFY}
            loading={collectionFYInitialLoading}
          />
        )}
      {!collectionMCError && (
        <CardsSection
          title={t('cardsSection.title.mc')}
          category='mc'
          collection={collectionMC}
          loading={collectionMCInitialLoading}
          tutorialCard={
            !collectionMCInitialLoading &&
            (!user.loggedIn ||
              !assumeLoggedIn ||
              collectionMC?.length === 0) ? (
              <TutorialCard
                image={
                  theme.name === 'light'
                    ? assets.creation.lightMcAnimated
                    : assets.creation.darkMcAnimated
                }
                title={t('tutorial.mc.title')}
                caption={t('tutorial.mc.caption')}
              />
            ) : undefined
          }
        />
      )}
      {!collectionACError && (
        <CardsSection
          title={t('cardsSection.title.ac')}
          category='ac'
          collection={collectionAC}
          loading={collectionACInitialLoading}
          tutorialCard={
            !collectionACInitialLoading &&
            (!user.loggedIn ||
              !assumeLoggedIn ||
              collectionAC?.length === 0) ? (
              <TutorialCard
                image={
                  theme.name === 'light'
                    ? assets.creation.lightAcAnimated
                    : assets.creation.darkAcAnimated
                }
                title={t('tutorial.ac.title')}
                caption={t('tutorial.ac.caption')}
                imageStyle={{
                  position: 'relative',
                  left: '10%',
                  bottom: '6px',
                }}
              />
            ) : undefined
          }
        />
      )}
      {/* !collectionCFError && (
        <CardsSection
          title={t('cardsSection.title.cf')}
          category='cf'
          collection={collectionCF}
          loading={collectionCFInitialLoading}
          handlePostClicked={handleOpenPostModal}
          tutorialCard={
            !collectionCFInitialLoading &&
            (!user.loggedIn ||
              !assumeLoggedIn ||
              collectionCF?.length === 0) ? (
              <TutorialCard
                image={
                  theme.name === 'light'
                    ? assets.creation.lightCfAnimated
                    : assets.creation.darkCfAnimated
                }
                title={t('tutorial.cf.title')}
                caption={t('tutorial.cf.caption')}
                imageStyle={{
                  position: 'relative',
                  left: '5%',
                }}
              />
            ) : undefined
          }
        />
        ) */}
      {!collectionBiggestError &&
      collectionBiggestInitialLoading &&
      collectionBiggest?.length > 0 ? (
        <CardsSection
          title={t('cardsSection.title.biggest')}
          category='biggest'
          collection={collectionBiggest}
          loading={collectionBiggestInitialLoading}
        />
      ) : null}
      {!collectionCreatorInitialLoading && collectionCreator?.length > 0 ? (
        <CardsSection
          user={{
            avatarUrl:
              switchPostType(collectionCreator[0])[0].creator?.avatarUrl ?? '',
            username: switchPostType(collectionCreator[0])[0].creator
              ?.username!!,
          }}
          type='creator'
          category={`/${
            switchPostType(collectionCreator[0])[0].creator?.username as string
          }`}
          collection={collectionCreator}
        />
      ) : null}
    </>
  );
};

(Home as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const accessToken = req.cookies?.accessToken;

  const assumeLoggedIn = !!accessToken && !Array.isArray(accessToken);

  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'page-Home',
    'component-PostCard',
    'modal-Post',
    'modal-PaymentModal',
    'modal-ResponseSuccessModal',
    'page-Chat',
  ]);

  const top10payload = new newnewapi.EmptyRequest({});

  const resTop10 = await fetchCuratedPosts(top10payload);

  return {
    props: {
      ...(resTop10.data
        ? {
            top10posts: resTop10.data.toJSON(),
          }
        : {}),
      assumeLoggedIn,
      ...translationContext,
    },
  };
};
