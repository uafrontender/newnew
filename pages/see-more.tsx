import React, { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { scroller } from 'react-scroll';
import Router, { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useInView } from 'react-intersection-observer';
import type { GetServerSideProps, NextPage } from 'next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';

import { NextPageWithLayout } from './_app';
import PostList from '../components/organisms/see-more/PostList';
import TitleBlock from '../components/organisms/see-more/TitleBlock';
import HomeLayout from '../components/templates/HomeLayout';

import useErrorToasts from '../utils/hooks/useErrorToasts';
import { fetchBiggestPosts, fetchForYouPosts } from '../api/endpoints/post';
import { getMyPosts } from '../api/endpoints/user';
import { APIResponse } from '../api/apiConfigs';
import { fetchLiveAuctions } from '../api/endpoints/auction';
import { fetchTopMultipleChoices } from '../api/endpoints/multiple_choice';
import assets from '../constants/assets';
import { I18nNamespaces } from '../@types/i18next';
import { useAppState } from '../contexts/appStateContext';

const TopSection = dynamic(
  () => import('../components/organisms/home/TopSection')
);

export type TCollectionType =
  | 'ac'
  | 'mc' /* | 'cf' */
  | 'biggest'
  | 'for-you'
  | 'recent-activity';
export type TSortingType = 'all' | 'num_bids' | 'newest';

interface ISearch {
  top10posts: newnewapi.NonPagedPostsResponse;
}

const Search: NextPage<ISearch> = ({ top10posts }) => {
  const { t } = useTranslation('page-SeeMore');
  const { showErrorToastPredefined } = useErrorToasts();
  const { userLoggedIn } = useAppState();

  const router = useRouter();
  const categoryRef = useRef(router.query.category?.toString() ?? 'ac');
  const sortingRef = useRef<string | undefined>('');

  // Posts
  // Top section/Curated posts
  const topSectionCollection = useRef<newnewapi.Post[]>(
    (top10posts.posts as newnewapi.Post[]) ?? []
  );

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

        if (categoryToFetch === 'for-you' && userLoggedIn) {
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

          if (res?.data && (res.data as newnewapi.PagedPostsResponse)?.posts) {
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
            res?.data &&
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
            res?.data &&
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

        /* if (categoryToFetch === 'cf') {
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
            res?.data &&
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
        } */

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

          if (res?.data && (res.data as newnewapi.PagedPostsResponse)?.posts) {
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

        if (categoryToFetch === 'recent-activity') {
          const biggestPayload = new newnewapi.GetRelatedToMePostsRequest({
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

          res = await getMyPosts(biggestPayload);

          if (
            res?.data &&
            (res.data as newnewapi.PagedCountedPostsResponse)?.posts
          ) {
            setCollectionLoaded((curr) => [
              ...curr,
              ...((res.data as newnewapi.PagedCountedPostsResponse)
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
        showErrorToastPredefined(undefined);
      }
    },

    [userLoggedIn, isCollectionLoading, showErrorToastPredefined]
  );
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

    if (!userLoggedIn && category === 'for-you') {
      Router.push('/sign-up');
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
  }, [
    inView,
    nextPageToken,
    router.query.category,
    router.query.sort,
    userLoggedIn,
    isCollectionLoading,
    loadPosts,
  ]);

  return (
    <>
      <Head>
        <title>
          {t(
            `meta.${
              (router?.query
                ?.category as keyof I18nNamespaces['page-SeeMore']['meta']) ||
              'ac'
            }.title`
          )}
        </title>
        <meta
          name='description'
          content={t(
            `meta.${
              (router?.query
                ?.category as keyof I18nNamespaces['page-SeeMore']['meta']) ||
              'ac'
            }.description`
          )}
        />
        <meta
          property='og:title'
          content={t(
            `meta.${
              (router?.query
                ?.category as keyof I18nNamespaces['page-SeeMore']['meta']) ||
              'ac'
            }.title`
          )}
        />
        <meta
          property='og:description'
          content={t(
            `meta.${
              (router?.query
                ?.category as keyof I18nNamespaces['page-SeeMore']['meta']) ||
              'ac'
            }.description`
          )}
        />
        <meta property='og:image' content={assets.openGraphImage.common} />
      </Head>
      {topSectionCollection.current?.length > 0 && (
        <TopSection collection={topSectionCollection.current} />
      )}
      <SWrapper name={router.query.category?.toString() ?? ''}>
        <TitleBlock
          category={categoryRef.current}
          authenticated={userLoggedIn}
          disabled={isCollectionLoading}
        />
        <SListContainer>
          <PostList
            category={router.query.category?.toString() ?? ''}
            collection={collectionLoaded}
            loading={isCollectionLoading}
          />
        </SListContainer>
        <div ref={loadingRef} />
      </SWrapper>
    </>
  );
};

(Search as NextPageWithLayout).getLayout = (page: React.ReactElement) => (
  <HomeLayout>{page}</HomeLayout>
);

export default Search;

// TODO: remove redirect and comment out code when see-more returns
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    permanent: false,
    destination: '/',
  },
});

// const translationContext = await serverSideTranslations(context.locale!!, [
//   'common',
//   'page-SeeMore',
//   'component-PostCard',
//   'page-Post',
//   'modal-PaymentModal',
//   'modal-ResponseSuccessModal',
// ]);

// const top10payload = new newnewapi.EmptyRequest({});

// const resTop10 = await fetchCuratedPosts(top10payload);

// return {
//   props: {
//     ...(resTop10.data
//       ? {
//           top10posts: resTop10.data.toJSON(),
//         }
//       : {}),
//     ...translationContext,
//   },
// };
// };

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
