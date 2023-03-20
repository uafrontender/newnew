import React, { useCallback, useEffect, useMemo } from 'react';
import { newnewapi } from 'newnew-api';
import { useInView } from 'react-intersection-observer';
import dynamic from 'next/dynamic';
import styled from 'styled-components';

import { useAppSelector } from '../../../redux-store/store';
import useSearchPosts from '../../../utils/hooks/useSearchPosts';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';

const PostList = dynamic(() => import('./PostList'));
const NoResults = dynamic(() => import('../../atoms/search/NoResults'));

interface ISearchDecisions {
  query: string;
}

export const SearchDecisions: React.FC<ISearchDecisions> = ({ query }) => {
  const { showErrorToastPredefined } = useErrorToasts();
  const { loggedIn } = useAppSelector((state) => state.user);

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
        filters: [],
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

  return (
    <div>
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
