import React, { useState, useRef, useEffect } from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';

import CreatorsList from '../../organisms/search/CreatorsList';
import NoResults from '../../atoms/search/NoResults';
import Loader from '../../atoms/Loader';
import useComponentScrollRestoration from '../../../utils/hooks/useComponentScrollRestoration';

// TODO: Use react query (but it requires a server side sorting)
interface IBundleCreatorsList {
  className?: string;
  creators: newnewapi.IUser[];
  loading: boolean;
  hasMore: boolean;
  initialLoadDone: boolean;
  loadMore: () => void;
  onBundleClicked: (creator: newnewapi.IUser) => void;
}

// With the logic to sort users (the ones user bought bundles from first) on FE
// The user who scrolls down will not see new creators they have bundles for
// As such creators will be added to the top of the list, while user looks at the bottom
const BundleCreatorsList: React.FC<IBundleCreatorsList> = ({
  className,
  creators,
  loading,
  hasMore,
  initialLoadDone,
  loadMore,
  onBundleClicked,
}) => {
  const searchContainerRef = useRef<HTMLDivElement | undefined>();
  const [scrolledToBottom, setScrolledToBottom] = useState<boolean>(false);
  const [shadeVisible, setShadeVisible] = useState<boolean>(true);

  useComponentScrollRestoration(
    searchContainerRef.current || undefined,
    'search-container'
  );

  useEffect(() => {
    if (scrolledToBottom) {
      loadMore();
    }
  }, [scrolledToBottom, loadMore]);

  useEffect(() => {
    if (!searchContainerRef.current || !initialLoadDone) {
      return;
    }

    const scrollable =
      searchContainerRef.current.scrollHeight >
      searchContainerRef.current.clientHeight;
    const scrolledToTheBottom =
      searchContainerRef.current.scrollTop >=
      searchContainerRef.current.scrollHeight -
        searchContainerRef.current.clientHeight;

    setScrolledToBottom(scrolledToTheBottom);
    setShadeVisible(scrollable && (!scrolledToTheBottom || hasMore));
  }, [searchContainerRef, creators, hasMore, initialLoadDone]);

  return (
    <SContainer className={className}>
      {creators.length === 0 && !hasMore && initialLoadDone ? (
        <NoResults />
      ) : (
        <SContent
          ref={(e) => {
            if (e) {
              searchContainerRef.current = e;
            }
          }}
          onScroll={(e: any) => {
            const scrollable = e.target.scrollHeight > e.target.clientHeight;
            const scrolledToTheBottom =
              e.target.scrollTop >=
              e.target.scrollHeight - e.target.clientHeight;
            setScrolledToBottom(!scrollable || scrolledToTheBottom);
            setShadeVisible(scrollable && (!scrolledToTheBottom || hasMore));
          }}
          id='search-container'
        >
          <CreatorsList
            loading={loading && initialLoadDone}
            collection={creators}
            onBuyBundleClicked={onBundleClicked}
          />
          {loading && !initialLoadDone && <Loader size='md' isStatic />}
        </SContent>
      )}
      <SBottomShade visible={shadeVisible} />
    </SContainer>
  );
};

export default BundleCreatorsList;

const SContainer = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;

  // Scrollbar
  &::-webkit-scrollbar {
    width: 4px;
  }
  scrollbar-width: none;
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
    transition: 0.2s linear;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 4px;
    transition: 0.2s linear;
  }

  &:hover {
    scrollbar-width: thin;
    &::-webkit-scrollbar-track {
      background: ${({ theme }) => theme.colorsThemed.background.outlines1};
    }

    &::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.colorsThemed.background.outlines2};
    }
  }
`;

const SBottomShade = styled.div<{ visible: boolean }>`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 228px;

  background: ${({ theme }) => theme.gradients.listBottom.quaternary};
  transform: matrix(1, 0, 0, -1, 0, 0);
  z-index: 2;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.2s linear;
  pointer-events: none;
`;
