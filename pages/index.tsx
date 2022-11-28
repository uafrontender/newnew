/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import type { GetServerSideProps, NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import styled, { useTheme } from 'styled-components';

import { NextPageWithLayout } from './_app';
import HomeLayout from '../components/templates/HomeLayout';
import FaqSection from '../components/organisms/home/FaqSection';
import PostTypeSection from '../components/organisms/home/PostTypeSection';
import BecomeCreatorSection from '../components/organisms/home/BecomeCreatorSection';
import Text from '../components/atoms/Text';

import { SUPPORTED_LANGUAGES } from '../constants/general';

import { useAppSelector } from '../redux-store/store';
import {
  fetchPostByUUID,
  fetchForYouPosts,
  fetchCuratedPosts,
  fetchBiggestPosts,
} from '../api/endpoints/post';
import { fetchLiveAuctions } from '../api/endpoints/auction';
// import { fetchTopCrowdfundings } from '../api/endpoints/crowdfunding';
import { fetchTopMultipleChoices } from '../api/endpoints/multiple_choice';
import switchPostType from '../utils/switchPostType';
import assets from '../constants/assets';
import { Mixpanel } from '../utils/mixpanel';
import YourPostsSection from '../components/organisms/home/YourPostsSection';
import Headline from '../components/atoms/Headline';
import { TStaticPost } from '../components/molecules/home/StaticPostCard';
import { getMyPosts } from '../api/endpoints/user';
import usePagination, {
  PaginatedResponse,
  Paging,
} from '../utils/hooks/usePagination';

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
  staticSuperpolls: TStaticPost[];
  staticBids: TStaticPost[];
}

// No sense to memorize
const Home: NextPage<IHome> = ({
  top10posts,
  staticBids,
  staticSuperpolls,
  assumeLoggedIn,
}) => {
  const { t } = useTranslation('page-Home');
  const theme = useTheme();
  const user = useAppSelector((state) => state.user);

  // Posts
  // Top section/Curated posts
  // const [topSectionCollection, setTopSectionCollection] = useState<
  //   newnewapi.Post[]
  // >((top10posts?.posts as newnewapi.Post[]) ?? []);
  // For you - authenticated users only
  // const [collectionFY, setCollectionFY] = useState<newnewapi.Post[]>([]);
  // const [collectionFYInitialLoading, setCollectionFYInitialLoading] =
  //   useState(false);
  // const [collectionFYError, setCollectionFYError] = useState(false);
  // Auctions
  // const [collectionAC, setCollectionAC] = useState<newnewapi.Post[]>([]);
  // const [collectionACInitialLoading, setCollectionACInitialLoading] =
  //   useState(true);
  // const [, setCollectionACError] = useState(false);
  // Multiple choice
  // const [collectionMC, setCollectionMC] = useState<newnewapi.Post[]>([]);
  // const [collectionMCInitialLoading, setCollectionMCInitialLoading] =
  // useState(true);
  // const [, setCollectionMCError] = useState(false);
  // Crowdfunding
  // const [collectionCF, setCollectionCF] = useState<newnewapi.Post[]>([]);
  // const [collectionCFInitialLoading, setCollectionCFInitialLoading] =
  //   useState(true);
  // const [collectionCFError, setCollectionCFError] = useState(false);
  // Biggest of all time
  // const [collectionBiggest, setCollectionBiggest] = useState<newnewapi.Post[]>(
  //   []
  // );
  // const [collectionBiggestInitialLoading, setCollectionBiggestInitialLoading] =
  //   useState(false);
  // const [collectionBiggestError, setCollectionBiggestError] = useState(false);

  // Recent activity
  // const [collectionRA, setCollectionRA] = useState<newnewapi.Post[]>([]);
  // const [collectionRAInitialLoading, setCollectionRAInitialLoading] =
  //   useState(false);
  // const [collectionRAError, setCollectionRAError] = useState(false);

  // Fetch top posts of various types
  // FY posts
  // useEffect(() => {
  //   async function fetchFYPosts() {
  //     try {
  //       setCollectionFYInitialLoading(true);

  //       const fyPayload = new newnewapi.PagedRequest({
  //         paging: {
  //           limit: 10,
  //         },
  //       });

  //       const resFY = await fetchForYouPosts(fyPayload);

  //       if (resFY) {
  //         setCollectionFY(() => resFY.data?.posts as newnewapi.Post[]);
  //         setCollectionFYInitialLoading(false);
  //       } else {
  //         throw new Error('Request failed');
  //       }
  //     } catch (err) {
  //       setCollectionFYInitialLoading(false);
  //       setCollectionFYError(true);
  //     }
  //   }

  //   if (user.loggedIn) {
  //     fetchFYPosts();
  //   }

  //   return () => {
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // Live Auctions posts
  // useEffect(() => {
  //   async function fetchAuctions() {
  //     try {
  //       setCollectionACInitialLoading(true);

  //       const liveAuctionsPayload = new newnewapi.PagedAuctionsRequest({
  //         sorting: newnewapi.PostSorting.MOST_FUNDED_FIRST,
  //       });

  //       const resLiveAuctions = await fetchLiveAuctions(liveAuctionsPayload);

  //       if (resLiveAuctions) {
  //         setCollectionAC(
  //           () => resLiveAuctions.data?.auctions as newnewapi.Post[]
  //         );
  //         setCollectionACInitialLoading(false);
  //       } else {
  //         throw new Error('Request failed');
  //       }
  //     } catch (err) {
  //       setCollectionACInitialLoading(false);
  //       setCollectionACError(true);
  //     }
  //   }

  //   fetchAuctions();
  // }, []);

  // Top Multiple Choices
  // useEffect(() => {
  //   async function fetchMultipleChoices() {
  //     try {
  //       setCollectionMCInitialLoading(true);
  //       const multichoicePayload = new newnewapi.PagedMultipleChoicesRequest({
  //         sorting: newnewapi.PostSorting.MOST_FUNDED_FIRST,
  //       });

  //       const resMultichoices = await fetchTopMultipleChoices(
  //         multichoicePayload
  //       );

  //       if (resMultichoices) {
  //         setCollectionMC(
  //           () => resMultichoices.data?.multipleChoices as newnewapi.Post[]
  //         );
  //         setCollectionMCInitialLoading(false);
  //       } else {
  //         throw new Error('Request failed');
  //       }
  //     } catch (err) {
  //       setCollectionMCInitialLoading(false);
  //       setCollectionMCError(true);
  //     }
  //   }

  //   fetchMultipleChoices();
  // }, []);

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
  // useEffect(() => {
  //   async function fetchBiggest() {
  //     try {
  //       setCollectionBiggestInitialLoading(true);
  //       const biggestPayload = new newnewapi.PagedRequest({});

  //       const resBiggest = await fetchBiggestPosts(biggestPayload);

  //       if (resBiggest) {
  //         setCollectionBiggest(
  //           () => resBiggest.data?.posts as newnewapi.Post[]
  //         );
  //         setCollectionBiggestInitialLoading(false);
  //       } else {
  //         throw new Error('Request failed');
  //       }
  //     } catch (err) {
  //       setCollectionBiggestInitialLoading(false);
  //       setCollectionBiggestError(true);
  //     }
  //   }

  //   fetchBiggest();
  // }, []);

  // Resent activity
  const fetchRAPosts = useCallback(
    async (paging: Paging): Promise<PaginatedResponse<newnewapi.IPost>> => {
      if (!user.loggedIn) {
        return {
          nextData: [],
          nextPageToken: undefined,
        };
      }

      const payload = new newnewapi.GetRelatedToMePostsRequest({
        relation: newnewapi.GetRelatedToMePostsRequest.Relation.MY_PURCHASES,
        paging,
      });
      const postsResponse = await getMyPosts(payload);

      if (!postsResponse.data || postsResponse.error) {
        throw new Error('Request failed');
      }

      return {
        nextData: postsResponse.data.posts,
        nextPageToken: postsResponse.data.paging?.nextPageToken,
      };
    },
    [user.loggedIn]
  );

  const {
    data: collectionRA,
    initialLoadDone: collectionRAInitialLoading,
    loadMore,
  } = usePagination<newnewapi.IPost>(fetchRAPosts, 6);

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
        <meta property='og:title' content={t('meta.title')} />
        <meta property='og:description' content={t('meta.description')} />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      {!user.loggedIn && <HeroSection />}

      {user.userData?.options?.isCreator && (
        <>
          <SHeading style={{ marginBottom: '48px' }}>
            <SHeadline>{t('section.your')}</SHeadline>
          </SHeading>
          <YourPostsSection />
        </>
      )}

      {user.loggedIn && (
        <>
          {user.userData?.options?.isCreator && collectionRA?.length > 0 && (
            <SHeading>
              <SHeadline>{t('section.explore')}</SHeadline>
              {/* <SSubtitle variant='subtitle'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                fames nulla dignissim tellus purus. Faucibus ornare.
              </SSubtitle> */}
            </SHeading>
          )}
          {/* Recent activity */}
          {collectionRAInitialLoading && collectionRA?.length > 0 ? (
            <CardsSection
              title={t('cardsSection.title.recent-activity')}
              category='recent-activity'
              collection={collectionRA}
              loading={!collectionRAInitialLoading}
              tutorialCard={
                user.loggedIn ? (
                  <STutorialCard
                    image={
                      theme.name === 'dark'
                        ? assets.common.darkAnimatedLogo
                        : assets.common.lightAnimatedLogo
                    }
                    title={t('tutorial.recent-activity.title')}
                    caption={t('tutorial.recent-activity.caption')}
                  />
                ) : undefined
              }
              padding={user.loggedIn ? 'small' : 'large'}
              onReachEnd={loadMore}
              seeMoreLink='/profile/purchases'
            />
          ) : null}
        </>
      )}

      {/* MC posts example */}
      <PostTypeSection
        headingPosition='right'
        title={t('tutorial.mc.title')}
        caption={t('tutorial.mc.caption')}
        iconSrc={
          theme.name === 'light'
            ? assets.creation.lightMcAnimated
            : assets.creation.darkMcAnimated
        }
        posts={staticSuperpolls}
        isStatic
        // loading={collectionMCInitialLoading}
        padding={user.loggedIn ? 'small' : 'large'}
      />

      {/* AC posts example */}
      <PostTypeSection
        headingPosition='left'
        title={t('tutorial.ac.title')}
        caption={t('tutorial.ac.caption')}
        iconSrc={
          theme.name === 'light'
            ? assets.creation.lightAcAnimated
            : assets.creation.darkAcAnimated
        }
        posts={staticBids}
        isStatic
        // loading={collectionACInitialLoading}
        padding={user.loggedIn ? 'small' : 'large'}
      />

      {/* Greatest of all time posts */}
      {/* {!collectionBiggestError &&
      (collectionBiggestInitialLoading || collectionBiggest?.length > 0) ? (
        <SCardsSection
          title={t('cardsSection.title.biggest')}
          category='biggest'
          collection={collectionBiggest}
          loading={collectionBiggestInitialLoading}
          tutorialCard={
            user.loggedIn ? (
              <STutorialCard
                image={
                  theme.name === 'dark'
                    ? assets.common.darkAnimatedLogo
                    : assets.common.lightAnimatedLogo
                }
                title={t('tutorial.biggest.title')}
                caption={t('tutorial.biggest.caption')}
              />
            ) : undefined
          }
          padding={user.loggedIn ? 'small' : 'large'}
        />
      ) : null} */}

      {(!user.loggedIn || !user.userData?.options?.isCreator) && <FaqSection />}

      {!user.userData?.options?.isCreator && <BecomeCreatorSection />}
    </>
  );
};

(Home as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

const SCardsSection = styled(CardsSection)`
  ${({ theme }) => theme.media.laptop} {
    margin-top: 12px;
  }

  &:last-child {
    padding-bottom: 40px;
  }

  ${({ theme }) => theme.media.tablet} {
    &:last-child {
      padding-bottom: 60px;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    &:last-child {
      padding-bottom: 80px;
    }
  }
`;

const SHeading = styled.div`
  margin-top: 40px;
  margin-bottom: 20px;

  ${(props) => props.theme.media.laptopM} {
    max-width: 1248px;
    margin-left: auto;
    margin-right: auto;
  }

  ${(props) => props.theme.media.tablet} {
    margin-bottom: 48px;

    & + section {
      padding-top: 0;
    }
  }
`;

const SHeadline = styled(Headline)`
  margin-bottom: 16px;

  font-size: 36px;
  line-height: 44px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 24px;

    font-size: 40px;
    line-height: 48px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-bottom: 24px;

    font-size: 52px;
    line-height: 40px;
  }
`;

const SSubtitle = styled(Text)`
  max-width: 570px;

  font-size: 14px;
  line-height: 24px;
  font-weight: 600;

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;

const STutorialCard = styled(TutorialCard)`
  & img {
    width: 152px;
    height: 114px;
  }

  & h4 {
    font-size: 24px;
    line-height: 32px;
  }

  &&& {
    & div {
      padding: 0;
      font-size: 16px;
      line-height: 24px;
    }
  }
`;

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const accessToken = req.cookies?.accessToken;

  const assumeLoggedIn = !!accessToken && !Array.isArray(accessToken);

  const translationContext = await serverSideTranslations(
    context.locale!!,
    [
      'common',
      'page-Home',
      'component-PostCard',
      'page-Post',
      'modal-PaymentModal',
      'modal-ResponseSuccessModal',
      'page-Chat',
    ],
    null,
    SUPPORTED_LANGUAGES
  );

  const staticSuperpolls = [
    {
      username: '☀️Sunny Claire',
      title: 'We give up...help pick our daughter’s name 🐣',
      totalVotes: 102558,
      postType: 'mc',
      coverImageUrl: assets.home.mcExampleThumb1,
      avatarUrl: assets.home.mcExampleAvatar1,
    },
    {
      username: 'julieberns',
      title: 'Should I quit my job and move to Paris to find 💗?',
      totalVotes: 44173,
      postType: 'mc',
      coverImageUrl: assets.home.mcExampleThumb2,
      avatarUrl: assets.home.mcExampleAvatar2,
    },
    {
      username: 'GTmarkis',
      title: 'Getting my first sports car... YOU CHOOSE IT. I BUY IT!',
      totalVotes: 23425,
      postType: 'mc',
      coverImageUrl: assets.home.mcExampleThumb3,
      avatarUrl: assets.home.mcExampleAvatar3,
    },
  ];

  const staticBids = [
    {
      username: 'ambervz',
      title: 'Need ideas on how to breakup w/ my cheating bf',
      totalAmount: 3812,
      postType: 'ac',
      coverImageUrl: assets.home.acExampleThumb1,
      avatarUrl: assets.home.acExampleAvatar1,
    },
    {
      username: 'Jenna B⚡️',
      title: 'I want a new tat! Tell me where to put it👀',
      totalAmount: 4261,
      postType: 'ac',
      coverImageUrl: assets.home.acExampleThumb2,
      avatarUrl: assets.home.acExampleAvatar2,
    },
    {
      username: 'superstacked+',
      title: '😱What should I spend my $250K on???',
      totalAmount: 12482,
      postType: 'ac',
      coverImageUrl: assets.home.acExampleThumb3,
      avatarUrl: assets.home.acExampleAvatar3,
    },
  ];

  // const top10payload = new newnewapi.EmptyRequest({});

  // const resTop10 = await fetchCuratedPosts(top10payload);

  return {
    props: {
      // ...(resTop10.data
      //   ? {
      //       top10posts: resTop10.data.toJSON(),
      //     }
      //   : {}),
      assumeLoggedIn,
      staticSuperpolls,
      staticBids,
      ...translationContext,
    },
  };
};
