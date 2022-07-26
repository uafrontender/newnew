/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from 'react';
import { newnewapi } from 'newnew-api';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';

import { searchCreators } from '../../../api/endpoints/search';
import Lottie from '../../atoms/Lottie';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';

const NoResults = dynamic(() => import('../../atoms/search/NoResults'));
const CreatorsList = dynamic(() => import('./CreatorsList'));

interface IFunction {
  query: string;
}

export const SearchCreators: React.FC<IFunction> = ({ query }) => {
  // Loading state
  const { ref: loadingRef, inView } = useInView();

  const [hasNoResults, setHasNoResults] = useState(true);
  const [initialLoad, setInitialLoad] = useState(false);
  const [loadingCreators, setLoadingCreators] = useState(false);
  const [creators, setCreators] = useState<newnewapi.IUser[]>([]);
  const [creatorsNextPageToken, setCreatorsRoomsNextPageToken] = useState<
    string | undefined | null
  >('');

  const getSearchResult = useCallback(
    async (pageToken?: string) => {
      if (loadingCreators) return;
      try {
        setLoadingCreators(true);
        const payload = new newnewapi.SearchCreatorsRequest({
          query,
          paging: {
            limit: 10,
            pageToken,
          },
        });
        const res = await searchCreators(payload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        if (!initialLoad) setInitialLoad(true);
        if (res.data.creators && res.data.creators.length > 0) {
          if (hasNoResults) setHasNoResults(false);
          if (!initialLoad) setInitialLoad(true);
          setCreators((curr) => {
            const arr = [...curr, ...(res.data?.creators as newnewapi.IUser[])];
            return arr;
          });
          setCreatorsRoomsNextPageToken(res.data.paging?.nextPageToken);
        } else if (!pageToken) {
          setHasNoResults(true);
        }

        if (!res.data.paging?.nextPageToken && creatorsNextPageToken) {
          setCreatorsRoomsNextPageToken(null);
        }
        setLoadingCreators(false);
      } catch (err) {
        setLoadingCreators(false);
        toast.error('toastErrors.generic');
        console.error(err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadingCreators, query]
  );

  useEffect(() => {
    if (query.length > 0) {
      setCreators([]);
      getSearchResult();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (inView && !loadingCreators && creatorsNextPageToken) {
      getSearchResult(creatorsNextPageToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, loadingCreators, creatorsNextPageToken]);

  return (
    <div>
      {!hasNoResults ? (
        <>
          <SCardsSection>
            {initialLoad && (
              <CreatorsList
                loading={loadingCreators}
                collection={creators}
                withEllipseMenu
              />
            )}
          </SCardsSection>
          {creatorsNextPageToken && !loadingCreators && (
            <SRef ref={loadingRef}>Loading...</SRef>
          )}
        </>
      ) : (
        <SNoResults>
          {initialLoad ? (
            <NoResults />
          ) : (
            <Lottie
              width={64}
              height={64}
              options={{
                loop: true,
                autoplay: true,
                animationData: loadingAnimation,
              }}
            />
          )}
        </SNoResults>
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
