/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useState } from 'react';
import { newnewapi } from 'newnew-api';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';
import { searchCreators } from '../../../api/endpoints/search';
import NoResults from '../../atoms/search/NoResults';
import CreatorsList from './CreatorsList';
import Lottie from '../../atoms/Lottie';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';

interface IFunction {
  query: string;
}

export const SearchCreators: React.FC<IFunction> = ({ query }) => {
  // Loading state
  const { ref: loadingRef, inView } = useInView();

  const [hasNoResults, setHasNoResults] = useState(true);
  const [initialLoad, setInitialLoad] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [creatorsPosts, setCreatorsPosts] = useState<newnewapi.IUser[]>([]);
  const [postsNextPageToken, setPostsRoomsNextPageToken] =
    useState<string | undefined | null>('');

  const getSearchResult = useCallback(
    async (pageToken?: string) => {
      if (loadingPosts) return;
      try {
        setLoadingPosts(true);
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
          setCreatorsPosts((curr) => {
            const arr = [...curr, ...(res.data?.creators as newnewapi.IUser[])];
            return arr;
          });
          setPostsRoomsNextPageToken(res.data.paging?.nextPageToken);
        } else {
          setHasNoResults(true);
        }

        if (!res.data.paging?.nextPageToken && postsNextPageToken)
          setPostsRoomsNextPageToken(null);
        setLoadingPosts(false);
      } catch (err) {
        setLoadingPosts(false);
        console.error(err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadingPosts, query]
  );

  useEffect(() => {
    if (query.length > 0) {
      setCreatorsPosts([]);
      getSearchResult();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (inView && !loadingPosts && postsNextPageToken) {
      getSearchResult(postsNextPageToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, loadingPosts, postsNextPageToken]);

  return (
    <div>
      {!hasNoResults ? (
        <>
          <SCardsSection>
            {initialLoad && (
              <CreatorsList loading={loadingPosts} collection={creatorsPosts} />
            )}
          </SCardsSection>
          {postsNextPageToken && !loadingPosts && (
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
