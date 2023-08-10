import React, { useEffect } from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import CreatorsList from '../../organisms/search/CreatorsList';
import NoResults from '../../atoms/search/NoResults';
import { useOverlayMode } from '../../../contexts/overlayModeContext';
import Loader from '../../atoms/Loader';

// TODO: Use react query (but it requires a server side sorting)
interface IMobileBundleCreatorsList {
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
const MobileBundleCreatorsList: React.FC<IMobileBundleCreatorsList> = ({
  className,
  creators,
  loading,
  hasMore,
  initialLoadDone,
  loadMore,
  onBundleClicked,
}) => {
  const { ref: loadingRef, inView } = useInView();
  const { overlayModeEnabled } = useOverlayMode();

  useEffect(() => {
    if (
      inView &&
      !loading &&
      hasMore &&
      initialLoadDone &&
      !overlayModeEnabled
    ) {
      loadMore();
    }
  }, [inView, loading, hasMore, initialLoadDone, overlayModeEnabled, loadMore]);

  return (
    <SContainer className={className}>
      {creators.length === 0 && !hasMore && initialLoadDone ? (
        <SNoResults />
      ) : (
        <>
          <CreatorsList
            loading={loading}
            collection={creators}
            onBuyBundleClicked={onBundleClicked}
          />
          {hasMore && !loading && <SRef ref={loadingRef}>Loading...</SRef>}
          {loading && initialLoadDone && <SLoader />}
        </>
      )}
    </SContainer>
  );
};

export default MobileBundleCreatorsList;

const SContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  min-height: 280px;
`;

const SNoResults = styled(NoResults)`
  margin-top: 40px;
  margin-right: auto;
  margin-bottom: 40px;
  margin-left: auto;
`;

const SRef = styled.div`
  text-indent: -9999px;
  width: 100%;
  height: 1px;
  overflow: hidden;
`;

const SLoader = styled(Loader)`
  margin: 0 auto;
`;
