/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { scroller } from 'react-scroll';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useInView } from 'react-intersection-observer';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetServerSideProps, NextPage } from 'next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';

import { NextPageWithLayout } from './_app';
import PostList from '../components/organisms/see-more/PostList';
import TitleBlock from '../components/organisms/see-more/TitleBlock';
import HomeLayout from '../components/templates/HomeLayout';

import { useAppSelector } from '../redux-store/store';
import {
  fetchBiggestPosts,
  fetchCuratedPosts,
  fetchForYouPosts,
} from '../api/endpoints/post';
import { APIResponse } from '../api/apiConfigs';
import { fetchLiveAuctions } from '../api/endpoints/auction';
import { fetchTopMultipleChoices } from '../api/endpoints/multiple_choice';
import { fetchTopCrowdfundings } from '../api/endpoints/crowdfunding';
import switchPostType from '../utils/switchPostType';
import assets from '../constants/assets';
import { Mixpanel } from '../utils/mixpanel';

const PostModal = dynamic(
  () => import('../components/organisms/decision/PostModal')
);
const TopSection = dynamic(
  () => import('../components/organisms/home/TopSection')
);

export type TCollectionType = 'ac' | 'mc' | 'cf' | 'biggest' | 'for-you';
export type TSortingType = 'all' | 'num_bids' | 'newest';

interface ISearch {
  top10posts: newnewapi.NonPagedPostsResponse;
}

const Search: NextPage<ISearch> = ({ top10posts }) => {
  const { t } = useTranslation('page-SeeMore');
  const { loggedIn, _persist } = useAppSelector((state) => state.user);

  const router = useRouter();
  const categoryRef = useRef(router.query.category?.toString() ?? 'ac');
  const sortingRef = useRef<string | undefined>('');

  // Posts
  // Top section/Curated posts
  const [topSectionCollection, setTopSectionCollection] = useState<
    newnewapi.Post[]
  >((top10posts.posts as newnewapi.Post[]) ?? []);

  // Searched and sorted posts
  const [collectionLoaded, setCollectionLoaded] = useState<newnewapi.Post[]>(
    []
  );
  const [nextPageToken, setNextPageToken] = useState<string | null | undefined>(
    ''
  );
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);
  const { ref: loadingRef, inView } = useInView();

  const loadPosts = useCallback(
    async ({
      categoryToFetch,
      sorting,
      pageToken,
    }: {
      categoryToFetch: TCollectionType;
      sorting?: newnewapi.PostSorting;
      pageToken?: string;
    }) => {
      if (isCollectionLoading) return;
      try {
        setIsCollectionLoading(true);
        let res: APIResponse<
          | newnewapi.PagedPostsResponse
          | newnewapi.PagedMultipleChoicesResponse
          | newnewapi.PagedCrowdfundingsResponse
          | newnewapi.PagedAuctionsResponse
        >;

        if (categoryToFetch === 'for-you' && loggedIn) {
          const fyPayload = new newnewapi.PagedRequest({
            ...(pageToken
              ? {
                  paging: {
                    pageToken,
                  },
                }
              : {}),
            ...(sorting
              ? {
                  sorting,
                }
              : {}),
          });

          res = await fetchForYouPosts(fyPayload);

          if (res.data && (res.data as newnewapi.PagedPostsResponse)?.posts) {
            setCollectionLoaded((curr) => [
              ...curr,
              ...((res.data as newnewapi.PagedPostsResponse)
                .posts as newnewapi.Post[]),
            ]);
            setNextPageToken(res.data.paging?.nextPageToken);
            setIsCollectionLoading(false);
            return;
          }
          throw new Error('Request failed');
        }

        if (categoryToFetch === 'ac') {
          const liveAuctionsPayload = new newnewapi.PagedAuctionsRequest({
            ...(pageToken
              ? {
                  paging: {
                    pageToken,
                  },
                }
              : {}),
            ...(sorting
              ? {
                  sorting,
                }
              : {}),
          });

          res = await fetchLiveAuctions(liveAuctionsPayload);

          if (
            res.data &&
            (res.data as newnewapi.PagedAuctionsResponse)?.auctions
          ) {
            setCollectionLoaded((curr) => [
              ...curr,
              ...((res.data as newnewapi.PagedAuctionsResponse)
                .auctions as newnewapi.Post[]),
            ]);
            setNextPageToken(res.data.paging?.nextPageToken);
            setIsCollectionLoading(false);
            return;
          }
          throw new Error('Request failed');
        }

        if (categoryToFetch === 'mc') {
          const multichoicePayload = new newnewapi.PagedMultipleChoicesRequest({
            ...(pageToken
              ? {
                  paging: {
                    pageToken,
                  },
                }
              : {}),
            ...(sorting
              ? {
                  sorting,
                }
              : {}),
          });

          res = await fetchTopMultipleChoices(multichoicePayload);

          if (
            res.data &&
            (res.data as newnewapi.PagedMultipleChoicesResponse)
              ?.multipleChoices
          ) {
            setCollectionLoaded((curr) => [
              ...curr,
              ...((res.data as newnewapi.PagedMultipleChoicesResponse)
                .multipleChoices as newnewapi.Post[]),
            ]);
            setNextPageToken(res.data.paging?.nextPageToken);
            setIsCollectionLoading(false);
            return;
          }
          throw new Error('Request failed');
        }

        if (categoryToFetch === 'cf') {
          const cfPayload = new newnewapi.PagedCrowdfundingsRequest({
            ...(pageToken
              ? {
                  paging: {
                    pageToken,
                  },
                }
              : {}),
            ...(sorting
              ? {
                  sorting,
                }
              : {}),
          });

          res = await fetchTopCrowdfundings(cfPayload);

          if (
            res.data &&
            (res.data as newnewapi.PagedCrowdfundingsResponse)?.crowdfundings
          ) {
            setCollectionLoaded((curr) => [
              ...curr,
              ...((res.data as newnewapi.PagedCrowdfundingsResponse)
                .crowdfundings as newnewapi.Post[]),
            ]);
            setNextPageToken(res.data.paging?.nextPageToken);
            setIsCollectionLoading(false);
            return;
          }
          throw new Error('Request failed');
        }

        if (categoryToFetch === 'biggest') {
          const biggestPayload = new newnewapi.PagedRequest({
            ...(pageToken
              ? {
                  paging: {
                    pageToken,
                  },
                }
              : {}),
            ...(sorting
              ? {
                  sorting,
                }
              : {}),
          });

          res = await fetchBiggestPosts(biggestPayload);

          if (res.data && (res.data as newnewapi.PagedPostsResponse)?.posts) {
            setCollectionLoaded((curr) => [
              ...curr,
              ...((res.data as newnewapi.PagedPostsResponse)
                .posts as newnewapi.Post[]),
            ]);
            setNextPageToken(res.data.paging?.nextPageToken);
            setIsCollectionLoading(false);
            return;
          }
          throw new Error('Request failed');
        }
      } catch (err) {
        console.error(err);
        setIsCollectionLoading(false);
        toast.error('toastErrors.generic');
      }
    },
    [setCollectionLoaded, loggedIn, isCollectionLoading]
  );

  // Display post
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [displayedPost, setDisplayedPost] = useState<
    newnewapi.IPost | undefined
  >(undefined);

  const handleOpenPostModal = (post: newnewapi.IPost) => {
    Mixpanel.track('Open Post Modal', {
      _stage: 'See More Page',
      _postUuid: switchPostType(post)[0].postUuid,
    });
    setDisplayedPost(post);
    setPostModalOpen(true);
  };

  const handleSetDisplayedPost = useCallback((post: newnewapi.IPost) => {
    setDisplayedPost(post);
  }, []);

  const handleClosePostModal = () => {
    Mixpanel.track('Close Post Modal', {
      _stage: 'See More Page',
    });
    setPostModalOpen(false);
    setDisplayedPost(undefined);
  };

  const handleRemovePostFromState = (postUuid: string) => {
    setCollectionLoaded((curr) => {
      const updated = curr.filter(
        (post) => switchPostType(post)[0].postUuid !== postUuid
      );
      return updated;
    });
    setTopSectionCollection((curr) => {
      const updated = curr.filter(
        (post) => switchPostType(post)[0].postUuid !== postUuid
      );
      return updated;
    });
  };

  // Scroll to top once category changed
  useEffect(() => {
    const category = router.query.category?.toString() ?? '';
    setNextPageToken('');
    setCollectionLoaded([]);
    scroller.scrollTo(category, {
      smooth: true,
      offset: -100,
    });
  }, [router.query.category, router.query.sort]);

  // Load collection on category change && scroll
  useEffect(() => {
    const category = router.query.category?.toString() ?? 'ac';
    const sort = router.query.sort?.toString()
      ? JSON.parse(router.query.sort?.toString())
      : '';
    // eslint-disable-next-line no-undef-init
    let sorting: newnewapi.PostSorting | undefined = undefined;
    if (sort.sortingtype) {
      if ((sort.sortingtype as TSortingType) === 'num_bids') {
        sorting = newnewapi.PostSorting.MOST_VOTED_FIRST;
      } else if ((sort.sortingType as TSortingType) === 'newest') {
        sorting = newnewapi.PostSorting.NEWEST_FIRST;
      }
    }

    // Redirect only after the persist data is pulled
    if (category === 'for-you' && _persist?.rehydrated && !loggedIn) {
      router?.push('/sign-up');
      return;
    }

    if (inView && category && !isCollectionLoading) {
      if (nextPageToken) {
        loadPosts({
          categoryToFetch: category as TCollectionType,
          pageToken: nextPageToken,
          ...(sorting
            ? {
                sorting,
              }
            : {}),
        });
      } else if (!nextPageToken && category !== categoryRef.current) {
        loadPosts({
          categoryToFetch: category as TCollectionType,
          ...(sorting
            ? {
                sorting,
              }
            : {}),
        });
        categoryRef.current = category;
        sortingRef.current = sorting?.toString();
      } else if (sorting?.toString() !== sortingRef.current) {
        setCollectionLoaded([]);
        setNextPageToken(undefined);
        loadPosts({
          categoryToFetch: category as TCollectionType,
          ...(sorting
            ? {
                sorting,
              }
            : {}),
        });
        categoryRef.current = category;
        sortingRef.current = sorting?.toString();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inView,
    nextPageToken,
    isCollectionLoading,
    router.query.category,
    router.query.sort,
    _persist?.rehydrated,
    loggedIn,
  ]);

  return (
    <>
      <Head>
        <title>{t(`meta.${router?.query?.category || 'ac'}.title`)}</title>
        <meta
          name='description'
          content={t(`meta.${router?.query?.category || 'ac'}.description`)}
        />
        <meta
          property='og:title'
          content={t(`meta.${router?.query?.category || 'ac'}.title`)}
        />
        <meta
          property='og:description'
          content={t(`meta.${router?.query?.category || 'ac'}.description`)}
        />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      {topSectionCollection?.length > 0 && (
        <TopSection
          collection={topSectionCollection}
          handlePostClicked={handleOpenPostModal}
        />
      )}
      <SWrapper name={router.query.category?.toString() ?? ''}>
        <TitleBlock
          category={categoryRef.current}
          authenticated={loggedIn}
          disabled={isCollectionLoading}
        />
        <SListContainer>
          <PostList
            category={router.query.category?.toString() ?? ''}
            collection={collectionLoaded}
            loading={isCollectionLoading}
            handlePostClicked={handleOpenPostModal}
          />
        </SListContainer>
        <div ref={loadingRef} />
      </SWrapper>
      {displayedPost && (
        <PostModal
          isOpen={postModalOpen}
          post={displayedPost}
          handleClose={() => handleClosePostModal()}
          handleOpenAnotherPost={handleSetDisplayedPost}
          handleRemoveFromStateDeleted={() =>
            handleRemovePostFromState(switchPostType(displayedPost)[0].postUuid)
          }
        />
      )}
    </>
  );
};

(Search as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

export default Search;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translationContext = await serverSideTranslations(context.locale!!, [
    'common',
    'page-SeeMore',
    'component-PostCard',
    'modal-Post',
    'modal-PaymentModal',
    'modal-ResponseSuccessModal',
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
