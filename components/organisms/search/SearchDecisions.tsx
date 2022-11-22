/* eslint-disable default-case */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { newnewapi } from 'newnew-api';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';

import Button from '../../atoms/Button';
import Sorting from '../Sorting';

import { searchPosts } from '../../../api/endpoints/search';
import { useAppSelector } from '../../../redux-store/store';
import SortOption from '../../atoms/SortOption';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';

const PostList = dynamic(() => import('./PostList'));
const NoResults = dynamic(() => import('../../atoms/search/NoResults'));

interface ISearchDecisions {
  query: string;
  type: string;
}

const parseFilterToArray = (filter: string): newnewapi.Post.Filter[] => {
  const filterArr = filter.split('-');

  const arr: newnewapi.Post.Filter[] = [];

  filterArr.forEach((f) => {
    switch (f) {
      case 'ac':
        arr.push(newnewapi.Post.Filter.AUCTIONS);
        break;
      case 'mc':
        arr.push(newnewapi.Post.Filter.MULTIPLE_CHOICES);
        break;
      case 'cf':
        arr.push(newnewapi.Post.Filter.CROWDFUNDINGS);
        break;
      default:
        arr.push(newnewapi.Post.Filter.ALL);
    }
  });

  return arr;
};

const getSortingValue = (sorting: string) => {
  switch (sorting) {
    case 'num_bids':
      return newnewapi.PostSorting.MOST_VOTED_FIRST;
      break;
    case 'all':
      return newnewapi.PostSorting.MOST_FUNDED_FIRST;
      break;
    case 'newest':
      return newnewapi.PostSorting.NEWEST_FIRST;
      break;
    default:
      return newnewapi.PostSorting.MOST_FUNDED_FIRST;
  }
};

const sortOptions: any = [
  {
    key: 'sortingtype',
    options: [
      {
        key: 'all',
      },
      {
        key: 'num_bids',
      },
      {
        key: 'newest',
      },
    ],
  },
];

export const SearchDecisions: React.FC<ISearchDecisions> = ({
  query,
  type,
}) => {
  const { t: tCommon } = useTranslation('common');
  const { showErrorToastPredefined } = useErrorToasts();
  const router = useRouter();

  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Loading state
  const { ref: loadingRef, inView } = useInView();

  const { sorting = '', filter = '' } = router.query;

  const [activeTabs, setActiveTabs] = useState<newnewapi.Post.Filter[]>(
    parseFilterToArray(filter as string)
  );

  const [postSorting, setPostSorting] = useState<string>(
    (sorting as string) || 'all'
  );

  const selectedSorting = useMemo(
    () => ({
      sortingtype: postSorting,
    }),
    [postSorting]
  );

  const [hasNoResults, setHasNoResults] = useState(true);
  const [initialLoad, setInitialLoad] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [resultsPosts, setResultsPosts] = useState<newnewapi.IPost[]>([]);
  const [postsNextPageToken, setPostsRoomsNextPageToken] = useState<
    string | undefined | null
  >('');

  const getSearchResult = useCallback(
    async (pageToken?: string) => {
      try {
        setLoadingPosts(true);

        const payload = new newnewapi.SearchPostsRequest({
          query,
          searchType:
            type === 'hashtags'
              ? newnewapi.SearchPostsRequest.SearchType.HASHTAGS
              : newnewapi.SearchPostsRequest.SearchType.UNSET,
          paging: {
            limit: 20,
            pageToken: pageToken ?? null,
          },
          sorting: getSortingValue(postSorting),
          filters: activeTabs,
        });

        const res = await searchPosts(payload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        if (!initialLoad) setInitialLoad(true);

        if (res.data.posts && res.data.posts.length > 0) {
          if (hasNoResults) setHasNoResults(false);

          setResultsPosts((curr) => {
            if (!pageToken) {
              return res.data?.posts || [];
            }

            const arr = [...curr, ...(res.data?.posts as newnewapi.IPost[])];

            return arr;
          });
          setPostsRoomsNextPageToken(res.data.paging?.nextPageToken);
        } else if (!pageToken) {
          setResultsPosts([]);
          setHasNoResults(true);
        }

        if (!res.data.paging?.nextPageToken) {
          setPostsRoomsNextPageToken(null);
        }

        setLoadingPosts(false);
      } catch (err) {
        setLoadingPosts(false);
        showErrorToastPredefined(undefined);
        console.error(err);
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [postSorting, query, type, initialLoad, activeTabs, hasNoResults]
  );

  useEffect(() => {
    setPostsRoomsNextPageToken(null);
    getSearchResult();
  }, [getSearchResult]);

  useEffect(() => {
    if (inView && !loadingPosts && postsNextPageToken) {
      getSearchResult(postsNextPageToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, loadingPosts, postsNextPageToken]);

  useEffect(() => {
    if (router.query.tab !== 'posts') {
      return;
    }

    const routerArr: string[] = [];
    activeTabs.forEach((filterValue) => {
      switch (filterValue) {
        case newnewapi.Post.Filter.AUCTIONS:
          routerArr.push('ac');
          break;
        case newnewapi.Post.Filter.MULTIPLE_CHOICES:
          routerArr.push('mc');
          break;
        // case newnewapi.Post.Filter.CROWDFUNDINGS:
        //   routerArr.push('cf');
        //   break;
      }
    });

    router.push({
      pathname: '/search',
      query: {
        query,
        type,
        tab: 'posts',
        filter: routerArr.length > 0 ? routerArr.join('-') : '',
        sorting: postSorting,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postSorting, activeTabs, query, type]);

  const tabTypes = useMemo(
    () => [
      {
        type: newnewapi.Post.Filter.AUCTIONS,
        id: 'auction',
        title: tCommon('postType.ac'),
      },
      {
        type: newnewapi.Post.Filter.MULTIPLE_CHOICES,
        id: 'multipleChoice',
        title: tCommon('postType.mc'),
      },
      // {
      //   type: newnewapi.Post.Filter.CROWDFUNDINGS,
      //   id: 'crowdfunding',
      //   title: tCommon('postType.cf'),
      // },
    ],
    [tCommon]
  );

  const updateActiveTabs = useCallback(
    (tabType: newnewapi.Post.Filter) => {
      if (!loadingPosts) {
        setActiveTabs((curr) => {
          const arr = [...curr];
          const index = arr.findIndex((item) => item === tabType);

          if (index < 0) {
            arr.push(tabType);
          } else {
            arr.splice(index, 1);
          }

          return arr;
        });
      }
    },
    [loadingPosts]
  );

  const clearSorting = useCallback(() => {
    setPostSorting('all');
  }, []);

  const Tabs = useCallback(
    () => (
      <STabs>
        {tabTypes.map((tab) => (
          <STab
            size='sm'
            view='secondary'
            active={activeTabs.findIndex((item) => item === tab.type) > -1}
            key={tab.id}
            onClick={() => updateActiveTabs(tab.type)}
          >
            {tab.title}
          </STab>
        ))}
        {selectedSorting &&
          selectedSorting.sortingtype !== 'all' &&
          !isMobile && (
            <SortOption
              sorts={selectedSorting}
              category=''
              onClick={clearSorting}
            />
          )}
      </STabs>
    ),
    [
      activeTabs,
      tabTypes,
      selectedSorting,
      isMobile,
      clearSorting,
      updateActiveTabs,
    ]
  );

  const handleTypeChange = useCallback(
    (newSort: { sortingtype: string }) => {
      if (!loadingPosts) {
        setPostSorting(newSort.sortingtype);
      }
    },
    [loadingPosts]
  );

  return (
    <div>
      {!(
        activeTabs.length === 1 &&
        activeTabs.includes(newnewapi.Post.Filter.ALL) &&
        hasNoResults
      ) && (
        <SToolBar disabled={false}>
          <Tabs />
          <Sorting
            category=''
            options={sortOptions}
            selected={selectedSorting}
            onChange={handleTypeChange}
          />
        </SToolBar>
      )}

      <SCardsSection>
        <PostList loading={loadingPosts} collection={resultsPosts} />
      </SCardsSection>
      {postsNextPageToken && !loadingPosts && (
        <SRef ref={loadingRef}>Loading...</SRef>
      )}
      {hasNoResults && initialLoad && (
        <SNoResults>
          <NoResults />
        </SNoResults>
      )}
    </div>
  );
};

export default SearchDecisions;

interface ISToolBar {
  disabled: boolean;
}

const SToolBar = styled.div<ISToolBar>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 24px;
  font-weight: 600;
  text-align: center;
  position: relative;
  ${(props) => {
    if (props.disabled) {
      return css`
        opacity: 0.1;
        &:after {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
        }
      `;
    }
    return css``;
  }}
`;

const STabs = styled.div`
  display: flex;
`;

interface ISTab {
  active: boolean;
}
const STab = styled(Button)<ISTab>`
  min-width: 96px;
  padding: 8px;
  cursor: pointer;
  margin-right: 16px;
  border-radius: 12px !important;
  ${(props) => {
    if (props.active) {
      return css`
        color: ${props.theme.colorsThemed.background.tertiary} !important;
        background: ${props.theme.colorsThemed.text.primary} !important;
      `;
    }
    return css`
      color: ${props.theme.colorsThemed.text.primary};
      background: ${props.theme.colorsThemed.background.secondary};
    `;
  }}
`;

const SCardsSection = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const SRef = styled.span`
  text-indent: -9999px;
  height: 0;
  overflow: hidden;
`;

const SNoResults = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
`;
