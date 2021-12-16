/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useEffect, useState, useCallback, useRef,
} from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useInView } from 'react-intersection-observer';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps, NextPage } from 'next';
import { newnewapi } from 'newnew-api';

import { NextPageWithLayout } from './_app';
import List from '../components/organisms/search/List';
import TitleBlock from '../components/organisms/search/TitleBlock';
import HomeLayout from '../components/templates/HomeLayout';
import TopSection from '../components/organisms/home/TopSection';
import PostModal from '../components/organisms/decision/PostModal';

import { useAppSelector } from '../redux-store/store';
import { fetchBiggestPosts, fetchCuratedPosts, fetchForYouPosts } from '../api/endpoints/post';
import { APIResponse } from '../api/apiConfigs';
import { fetchLiveAuctions } from '../api/endpoints/auction';
import { fetchTopMultipleChoices } from '../api/endpoints/multiple_choice';
import { fetchTopCrowdfundings } from '../api/endpoints/crowdfunding';
import switchPostType from '../utils/switchPostType';

export type TCollectionType = 'ac' | 'mc' | 'cf' | 'biggest' | 'for-you';

interface ISearch {
  top10posts: newnewapi.NonPagedPostsResponse,
}

const Search: NextPage<ISearch> = ({
  top10posts,
}) => {
  const { t } = useTranslation('home');
  const { loggedIn, userData } = useAppSelector((state) => state.user);

  const router = useRouter();
  const categoryRef = useRef('');
  // const category = router.query.category?.toString() ?? '';

  // Posts
  // Top section/Curated posts
  const [
    topSectionCollection, setTopSectionCollection,
  ] = useState<newnewapi.Post[]>(top10posts.posts as newnewapi.Post[]);

  // Searched and sorted posts
  const [collectionLoaded, setCollectionLoaded] = useState<newnewapi.Post[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null | undefined>('');
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);
  const {
    ref: loadingRef,
    inView,
  } = useInView();

  const [collectionSorted, setCollectionSorted] = useState<newnewapi.Post[]>([]);
  const [isCollectionSorting, setIsCollectionSorting] = useState(false);

  const loadPosts = useCallback(async (
    categoryToFetch: TCollectionType,
    pageToken?: string,
  ) => {
    if (isCollectionLoading) return;
    try {
      setIsCollectionLoading(true);
      let res: APIResponse<
        newnewapi.PagedPostsResponse
        | newnewapi.PagedMultipleChoicesResponse
        | newnewapi.PagedCrowdfundingsResponse
      >;

      if (categoryToFetch === 'for-you' && loggedIn) {
        const fyPayload = new newnewapi.PagedRequest({
          ...(pageToken ? {
            paging: {
              pageToken,
            },
          } : {}),
        });

        res = await fetchForYouPosts(fyPayload);

        if (res.data && (res.data as newnewapi.PagedPostsResponse).posts) {
          setCollectionLoaded(
            (curr) => [
              ...curr,
              ...(res.data as newnewapi.PagedPostsResponse).posts as newnewapi.Post[],
            ],
          );
          setNextPageToken(res.data.paging?.nextPageToken);
          setIsCollectionLoading(false);
          return;
        }
        throw new Error('Request failed');
      }

      if (categoryToFetch === 'ac') {
        const liveAuctionsPayload = new newnewapi.PagedRequest({
          ...(pageToken ? {
            paging: {
              pageToken,
            },
          } : {}),
        });

        res = await fetchLiveAuctions(liveAuctionsPayload);

        if (res.data && (res.data as newnewapi.PagedPostsResponse).posts) {
          setCollectionLoaded(
            (curr) => [
              ...curr,
              ...(res.data as newnewapi.PagedPostsResponse).posts as newnewapi.Post[],
            ],
          );
          setNextPageToken(res.data.paging?.nextPageToken);
          setIsCollectionLoading(false);
          return;
        }
        throw new Error('Request failed');
      }

      if (categoryToFetch === 'mc') {
        const multichoicePayload = new newnewapi.PagedRequest({
          ...(pageToken ? {
            paging: {
              pageToken,
            },
          } : {}),
        });

        res = await fetchTopMultipleChoices(multichoicePayload);

        if (res.data && (res.data as newnewapi.PagedMultipleChoicesResponse).multipleChoices) {
          setCollectionLoaded(
            (curr) => [
              ...curr,
              ...(res.data as newnewapi.PagedMultipleChoicesResponse)
                .multipleChoices as newnewapi.Post[],
            ],
          );
          setNextPageToken(res.data.paging?.nextPageToken);
          setIsCollectionLoading(false);
          return;
        }
        throw new Error('Request failed');
      }

      if (categoryToFetch === 'cf') {
        const cfPayload = new newnewapi.PagedRequest({
          ...(pageToken ? {
            paging: {
              pageToken,
            },
          } : {}),
        });

        res = await fetchTopCrowdfundings(cfPayload);

        if (res.data && (res.data as newnewapi.PagedCrowdfundingsResponse).crowdfundings) {
          setCollectionLoaded(
            (curr) => [
              ...curr,
              ...(res.data as newnewapi.PagedCrowdfundingsResponse)
                .crowdfundings as newnewapi.Post[],
            ],
          );
          setNextPageToken(res.data.paging?.nextPageToken);
          setIsCollectionLoading(false);
          return;
        }
        throw new Error('Request failed');
      }

      if (categoryToFetch === 'biggest') {
        const biggestPayload = new newnewapi.PagedRequest({
          ...(pageToken ? {
            paging: {
              pageToken,
            },
          } : {}),
        });

        res = await fetchBiggestPosts(biggestPayload);

        if (res.data && (res.data as newnewapi.PagedPostsResponse).posts) {
          setCollectionLoaded(
            (curr) => [
              ...curr,
              ...(res.data as newnewapi.PagedPostsResponse).posts as newnewapi.Post[],
            ],
          );
          setNextPageToken(res.data.paging?.nextPageToken);
          setIsCollectionLoading(false);
          return;
        }
        throw new Error('Request failed');
      }
    } catch (err) {
      setIsCollectionLoading(false);
      console.error(err);
    }
  }, [
    setCollectionLoaded, loggedIn,
    isCollectionLoading,
  ]);

  // Display post
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [displayedPost, setDisplayedPost] = useState<
  newnewapi.IPost | undefined>(undefined);

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

  // Scroll to top once category changed
  useEffect(() => {
    const category = router.query.category?.toString() ?? '';
    setNextPageToken('');
    setCollectionLoaded([]);
    scroller.scrollTo(category, {
      smooth: true,
      offset: -100,
      containerId: 'generalScrollContainer',
    });
  }, [router.query.category]);

  // Load collection on category change && scroll
  useEffect(() => {
    const category = router.query.category?.toString() ?? '';
    if (inView && category && !isCollectionLoading && !isCollectionSorting) {
      if (nextPageToken) {
        loadPosts(category as TCollectionType, nextPageToken);
      } else if (!nextPageToken && category !== categoryRef.current) {
        loadPosts(category as TCollectionType);
        categoryRef.current = category;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inView,
    nextPageToken,
    isCollectionLoading, isCollectionSorting,
    router.query.category,
  ]);

  // Sort collection after collectionLoaded and on sort changes
  useEffect(() => {
    const sort = router.query.sort?.toString() ? JSON.parse(router.query.sort?.toString()) : '';

    if (collectionLoaded) {
      console.log(sort);
      if (!sort) {
        setCollectionSorted([...collectionLoaded]);
      } else {
        setIsCollectionSorting(true);
        const workingArray = [...collectionLoaded];
        if (sort.time) {
          console.log(sort.time);
          const workingArray2 = workingArray.sort((a, b) => {
            const [A, typeA] = switchPostType(a);
            const [B, typeB] = switchPostType(b);
            console.log(A);
            console.log(B);
            if (sort.time === 'newest') return (B.expiresAt?.seconds as number) - (A.expiresAt?.seconds as number);
            if (sort.time === 'oldest') return (A.expiresAt?.seconds as number) - (B.expiresAt?.seconds as number);
            return (A.expiresAt?.seconds as number) - (B.expiresAt?.seconds as number);
          });
          console.log(workingArray2);
          setCollectionSorted(() => [...workingArray2]);
          setIsCollectionSorting(false);
          return;
        }
        setCollectionSorted(() => [...workingArray]);
        setIsCollectionSorting(false);
      }
    }
  }, [router.query.sort, collectionLoaded]);

  return (
    <>
      <Head>
        <title>
          {t('search.meta.title')}
        </title>
      </Head>
      <TopSection
        collection={topSectionCollection}
        handlePostClicked={handleOpenPostModal}
      />
      <SWrapper name={router.query.category?.toString() ?? ''}>
        <TitleBlock
          authenticated={loggedIn}
          disabled={isCollectionSorting || isCollectionLoading}
        />
        <SListContainer>
          <List
            category={router.query.category?.toString() ?? ''}
            collection={collectionSorted}
            loading={isCollectionLoading}
            handlePostClicked={handleOpenPostModal}
          />
        </SListContainer>
        <div
          ref={loadingRef}
        />
      </SWrapper>
      {displayedPost && (
        <PostModal
          isOpen={postModalOpen}
          post={displayedPost}
          handleClose={() => handleClosePostModal()}
          handleOpenAnotherPost={handleSetDisplayedPost}
        />
      )}
    </>
  );
};

(Search as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <HomeLayout>
    {page}
  </HomeLayout>
);

export default Search;

export const getServerSideProps:GetServerSideProps = async (context) => {
  const translationContext = await serverSideTranslations(
    context.locale!!,
    ['common', 'home', 'decision'],
  );

  const top10payload = new newnewapi.EmptyRequest({});

  const resTop10 = await fetchCuratedPosts(top10payload);

  if (!resTop10.data?.posts || resTop10.error) {
    throw new Error('Request failed');
  }

  return {
    props: {
      top10posts: resTop10.data.toJSON(),
      ...translationContext,
    },
  };
};

interface ISWrapper {
  name: string;
}

const SWrapper = styled.section<ISWrapper>`
  padding: 0 0 24px 0;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${(props) => props.theme.media.tablet} {
    padding: 32px 0;
  }

  ${(props) => props.theme.media.laptop} {
    padding: 40px 0;
  }
`;

const SListContainer = styled.div`
  position: relative;
`;
