import React, { useState, useRef, useEffect } from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import CreatorsList from '../../organisms/search/CreatorsList';
import NoResults from '../../atoms/search/NoResults';

// TODO: use PaginatedData (but it requires a server side sorting)
interface IBundleCreatorsList {
  className?: string;
  creators: newnewapi.IUser[];
  loading: boolean;
  hasMore: boolean;
  initialLoadDone: boolean;
  loadMore: () => void;
  onBundleClicked: (creator: newnewapi.IUser) => void;
}

// TODO: separate out a component for scroll and load more (with optional shade)
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
      {creators.length === 0 && !hasMore ? (
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
        >
          {/* TODO: add no results message (otherwise there is an empty space) */}

          <CreatorsList
            loading={loading && initialLoadDone}
            collection={creators}
            onBuyBundleClicked={onBundleClicked}
          />
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

  // TODO: standardize
  background: ${({ theme }) => theme.gradients.listBottom.quaternary};
  transform: matrix(1, 0, 0, -1, 0, 0);
  z-index: 2;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.2s linear;
  pointer-events: none;
`;
