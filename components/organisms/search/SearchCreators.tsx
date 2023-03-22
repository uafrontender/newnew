import React, { useCallback, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';
import dynamic from 'next/dynamic';

import useErrorToasts from '../../../utils/hooks/useErrorToasts';
import useSearchCreators from '../../../utils/hooks/useSearchCreators';
import { useAppSelector } from '../../../redux-store/store';

import Lottie from '../../atoms/Lottie';
import loadingAnimation from '../../../public/animations/logo-loading-blue.json';

const NoResults = dynamic(() => import('../../atoms/search/NoResults'));
const CreatorsList = dynamic(() => import('./CreatorsList'));

interface IFunction {
  query: string;
}

export const SearchCreators: React.FC<IFunction> = ({ query }) => {
  const { loggedIn } = useAppSelector((state) => state.user);
  const { showErrorToastPredefined } = useErrorToasts();

  const onLoadingCreatorsError = useCallback((err: any) => {
    console.error(err);
    showErrorToastPredefined(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useSearchCreators(
      {
        loggedInUser: loggedIn,
        query,
      },
      {
        onError: onLoadingCreatorsError,
      }
    );

  const creators = useMemo(
    () => (data?.pages ? data?.pages.map((page) => page.creators).flat() : []),
    [data]
  );

  const hasNoResults = useMemo(
    () => !isLoading && creators?.length === 0,
    [isLoading, creators?.length]
  );

  // Loading state
  const { ref: loadingRef, inView } = useInView();

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage]);

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
      {creators.length === 0 ? (
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
            <CreatorsList
              loading={isLoading || isFetchingNextPage}
              collection={creators}
              withEllipseMenu
            />
          </SCardsSection>
          {hasNextPage && !isFetchingNextPage && <SRef ref={loadingRef} />}
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
  height: 10px;
  overflow: hidden;
`;

const SNoResults = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
`;
