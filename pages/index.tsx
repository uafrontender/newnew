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

import { useAppSelector } from '../redux-store/store';
import {
  fetchPostByUUID,
  // fetchForYouPosts,
  fetchCuratedPosts,
  fetchBiggestPosts,
} from '../api/endpoints/post';
import { fetchLiveAuctions } from '../api/endpoints/auction';
// import { fetchTopMultipleChoices } from '../api/endpoints/multiple_choice';
import switchPostType from '../utils/switchPostType';
import isBrowser from '../utils/isBrowser';
import assets from '../constants/assets';
import { Mixpanel } from '../utils/mixpanel';

const HeroSection = dynamic(
  () => import('../components/organisms/home/HeroSection')
);
const CardsSection = dynamic(
  () => import('../components/organisms/home/CardsSection')
);
const PostModal = dynamic(() => import('../components/organisms/decision'));

interface IHome {
  top10posts: newnewapi.NonPagedPostsResponse;
  postFromQuery?: newnewapi.Post;
  assumeLoggedIn?: boolean;
}

// No sense to memorize
const Home: NextPage<IHome> = ({
  top10posts,
  postFromQuery,
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
  // useState(false);
  // const [collectionFYError, setCollectionFYError] = useState(false);
  // Auctions
  const [collectionAC, setCollectionAC] = useState<newnewapi.Post[]>([]);
  const [collectionACInitialLoading, setCollectionACInitialLoading] =
    useState(true);
  const [, setCollectionACError] = useState(false);
  // Multiple choice
  // const [collectionMC, setCollectionMC] = useState<newnewapi.Post[]>([]);
  // const [collectionMCInitialLoading, setCollectionMCInitialLoading] =
  // useState(true);
  // const [collectionMCError, setCollectionMCError] = useState(false);

  // Biggest of all time
  const [collectionBiggest, setCollectionBiggest] = useState<newnewapi.Post[]>(
    []
  );
  const [collectionBiggestInitialLoading, setCollectionBiggestInitialLoading] =
    useState(false);
  const [collectionBiggestError, setCollectionBiggestError] = useState(false);

  // Display post
  // const [postModalOpen, setPostModalOpen] = useState(!!postFromQuery);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [displayedPost, setDisplayedPost] = useState<
    newnewapi.IPost | undefined
  >(postFromQuery ?? undefined);

  const handleOpenPostModal = useCallback(
    (post: newnewapi.IPost) => {
      Mixpanel.track('Open Post Modal', {
        _stage: 'Home Page',
        _postUuid: switchPostType(post)[0].postUuid,
      });
      setDisplayedPost(post);
      setPostModalOpen(true);
    },
    [setDisplayedPost, setPostModalOpen]
  );

  const handleSetDisplayedPost = useCallback((post: newnewapi.IPost) => {
    setDisplayedPost(post);
  }, []);

  const handleClosePostModal = useCallback(() => {
    Mixpanel.track('Close Post Modal', {
      _stage: 'Home Page',
    });
    setPostModalOpen(false);
    setDisplayedPost(undefined);
  }, []);

  const handleRemovePostFromState = (postUuid: string) => {
    // setTopSectionCollection((curr) => {
    //   const updated = curr.filter(
    //     (post) => switchPostType(post)[0].postUuid !== postUuid
    //   );
    //   return updated;
    // });
    // setCollectionFY((curr) => {
    //   const updated = curr.filter(
    //     (post) => switchPostType(post)[0].postUuid !== postUuid
    //   );
    //   return updated;
    // });
    // setCollectionAC((curr) => {
    //   const updated = curr.filter(
    //     (post) => switchPostType(post)[0].postUuid !== postUuid
    //   );
    //   return updated;
    // });
    // setCollectionMC((curr) => {
    //   const updated = curr.filter(
    //     (post) => switchPostType(post)[0].postUuid !== postUuid
    //   );
    //   return updated;
    // });
    setCollectionBiggest((curr) => {
      const updated = curr.filter(
        (post) => switchPostType(post)[0].postUuid !== postUuid
      );
      return updated;
    });
  };

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
  //     setPostModalOpen(false);
  //     setDisplayedPost(undefined);
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

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

  // Biggest of all time
  useEffect(() => {
    async function fetchBiggest() {
      try {
        setCollectionBiggestInitialLoading(true);
        const biggestPayload = new newnewapi.PagedRequest({});

        const resBiggest = await fetchBiggestPosts(biggestPayload);

        console.log(resBiggest, 'resBiggest');

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

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta name='description' content={t('meta.description')} />
        <meta property='og:title' content={t('meta.title')} />
        <meta property='og:description' content={t('meta.description')} />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      <HeroSection />

      {/* MC posts */}
      <PostTypeSection
        headingPosition='right'
        title={t('tutorial.mc.title')}
        caption={t('tutorial.mc.caption')}
        iconSrc={
          theme.name === 'light'
            ? assets.creation.lightMcAnimated
            : assets.creation.darkMcAnimated
        }
        openPostModal={handleOpenPostModal}
        posts={collectionAC.slice(0, 3)}
        loading={collectionACInitialLoading}
      />

      {/* AC posts */}
      <PostTypeSection
        headingPosition='left'
        title={t('tutorial.ac.title')}
        caption={t('tutorial.ac.caption')}
        iconSrc={
          theme.name === 'light'
            ? assets.creation.lightAcAnimated
            : assets.creation.darkAcAnimated
        }
        openPostModal={handleOpenPostModal}
        posts={collectionAC.slice(0, 3)}
        loading={collectionACInitialLoading}
      />

      {/* Greatest of all time posts */}
      {!collectionBiggestError &&
      (collectionBiggestInitialLoading || collectionBiggest?.length > 0) ? (
        <SCardsSection
          title={t('cardsSection.title.biggest')}
          category='biggest'
          collection={collectionBiggest}
          loading={collectionBiggestInitialLoading}
          handlePostClicked={handleOpenPostModal}
        />
      ) : null}

      <FaqSection />

      {!user.userData?.options?.isCreator && <BecomeCreatorSection />}

      {/* Post Modal */}
      {displayedPost && (
        <PostModal
          isOpen={postModalOpen}
          post={displayedPost}
          manualCurrLocation={isBrowser() ? window.location.pathname : ''}
          handleClose={handleClosePostModal}
          handleOpenAnotherPost={handleSetDisplayedPost}
          handleRemoveFromStateDeleted={() =>
            handleRemovePostFromState(switchPostType(displayedPost)[0].postUuid)
          }
        />
      )}
    </>
  );
};

(Home as NextPageWithLayout).getLayout = (page: ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

const SCardsSection = styled(CardsSection)`
  margin-top: 12px;
`;

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { post } = context.query;
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
          assumeLoggedIn,
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
      assumeLoggedIn,
      ...translationContext,
    },
  };
};
