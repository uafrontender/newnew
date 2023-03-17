import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { newnewapi } from 'newnew-api';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import styled, { css } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useUpdateEffect } from 'react-use';

import Button from '../../atoms/Button';

import { useAppSelector } from '../../../redux-store/store';
import useSearchPosts from '../../../utils/hooks/useSearchPosts';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';

const PostList = dynamic(() => import('./PostList'));
const NoResults = dynamic(() => import('../../atoms/search/NoResults'));

interface ISearchDecisions {
  query: string;
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

export const SearchDecisions: React.FC<ISearchDecisions> = ({ query }) => {
  const { t: tCommon } = useTranslation('common');
  const router = useRouter();

  const { showErrorToastPredefined } = useErrorToasts();

  const { loggedIn } = useAppSelector((state) => state.user);

  const { filter = '' } = router.query;

  const [activeTabs, setActiveTabs] = useState<newnewapi.Post.Filter[]>(
    parseFilterToArray(filter as string)
  );

  const onLoadingCreatorsError = useCallback((err: any) => {
    console.error(err);
    showErrorToastPredefined(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useSearchPosts(
      {
        loggedInUser: loggedIn,
        query,
        searchType: newnewapi.SearchPostsRequest.SearchType.HASHTAGS,
        sorting: newnewapi.PostSorting.MOST_FUNDED_FIRST,
        filters: activeTabs,
      },
      {
        onError: onLoadingCreatorsError,
      }
    );

  const posts = useMemo(
    () => (data?.pages ? data?.pages.map((page) => page.posts).flat() : []),
    [data]
  );

  const hasNoResults = useMemo(
    () => !isLoading && posts?.length === 0,
    [isLoading, posts?.length]
  );

  // Loading state
  const { ref: loadingRef, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  useUpdateEffect(() => {
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
        default:
          // Do nothing
          break;
      }
    });

    router.push(
      {
        pathname: '/search',
        query: {
          query,
          tab: 'posts',
          filter: routerArr.length > 0 ? routerArr.join('-') : '',
        },
      },
      undefined,
      // Avoid page reload as we stay on the same page
      { shallow: true }
    );
  }, [activeTabs, query]);

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
    ],
    [tCommon]
  );

  const updateActiveTabs = useCallback((tabType: newnewapi.Post.Filter) => {
    setActiveTabs((curr) => {
      const index = curr.findIndex((item) => item === tabType);

      // While we have only 2 tabs, there is no way to enable 2 at a time
      if (index < 0) {
        return [tabType];
      }

      return [];
    });
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
      </STabs>
    ),
    [activeTabs, tabTypes, updateActiveTabs]
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
        </SToolBar>
      )}
      <SCardsSection>
        <PostList
          loading={isLoading || isFetchingNextPage}
          collection={posts}
        />
      </SCardsSection>
      {hasNextPage && !isFetchingNextPage && <SRef ref={loadingRef} />}
      {hasNoResults && !isLoading && (
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
  height: 10px;
  overflow: hidden;
`;

const SNoResults = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
`;
