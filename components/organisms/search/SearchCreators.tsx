/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from 'react';
import { newnewapi } from 'newnew-api';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';
import dynamic from 'next/dynamic';

import { searchCreators } from '../../../api/endpoints/search';
import Lottie from '../../atoms/Lottie';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';
import usePagination, {
  PaginatedResponse,
  Paging,
} from '../../../utils/hooks/usePagination';
import useErrorToasts from '../../../utils/hooks/useErrorToasts';

const NoResults = dynamic(() => import('../../atoms/search/NoResults'));
const CreatorsList = dynamic(() => import('./CreatorsList'));

interface IFunction {
  query: string;
}

export const SearchCreators: React.FC<IFunction> = ({ query }) => {
  const { showErrorToastPredefined } = useErrorToasts();
  // Loading state
  const { ref: loadingRef, inView } = useInView();

  const loadData = useCallback(
    async (paging: Paging): Promise<PaginatedResponse<newnewapi.IUser>> => {
      if (query.length === 0) {
        return {
          nextData: [],
          nextPageToken: undefined,
        };
      }

      const payload = new newnewapi.SearchCreatorsRequest({
        query,
        paging,
      });

      const res = await searchCreators(payload);

      if (!res.data || res.error) {
        showErrorToastPredefined(undefined);
        throw new Error(res.error?.message ?? 'Request failed');
      }

      return {
        nextData: res.data.creators,
        nextPageToken: res.data.paging?.nextPageToken,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query]
  );

  const { data, loading, hasMore, loadMore } = usePagination(loadData, 10);

  useEffect(() => {
    if (inView && !loading && hasMore) {
      loadMore().catch((e) => console.error(e));
    }
  }, [inView, loading, hasMore, loadMore]);

  const hasNoResults = data.length === 0 && !hasMore;

  if (hasNoResults) {
    return (
      <div>
        <SNoResults>
          <NoResults />
        </SNoResults>
      </div>
    );
  }

  return (
    <div>
      {data.length === 0 ? (
        <SNoResults>
          <Lottie
            width={64}
            height={64}
            options={{
              loop: true,
              autoplay: true,
              animationData: loadingAnimation,
            }}
          />
        </SNoResults>
      ) : (
        <>
          <SCardsSection>
            <CreatorsList loading={loading} collection={data} withEllipseMenu />
          </SCardsSection>
          {hasMore && !loading && <SRef ref={loadingRef}>Loading...</SRef>}
        </>
      )}
    </div>
  );
};

export default SearchCreators;

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
