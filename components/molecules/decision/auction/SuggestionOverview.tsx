/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import { useInView } from 'react-intersection-observer';

import { useAppSelector } from '../../../../redux-store/store';
import { SocketContext } from '../../../../contexts/socketContext';
import { fetchBidsForOption, placeBidOnAuction } from '../../../../api/endpoints/auction';

import BidCard from './BidCard';

import isBrowser from '../../../../utils/isBrowser';

interface ISuggestionOverview {
  postUuid: string;
  overviewedSuggestion: newnewapi.Auction.Option;
  handleCloseSuggestionBidHistory: () => void;
}

const SuggestionOverview: React.FunctionComponent<ISuggestionOverview> = ({
  postUuid,
  overviewedSuggestion,
  handleCloseSuggestionBidHistory,
}) => {
  // Socket
  const socketConnection = useContext(SocketContext);
  // Infinite load
  const {
    ref: loadingRef,
    inView,
  } = useInView();

  // Bids history
  const [
    bidsHistory, setBidsHistory,
  ] = useState<newnewapi.Auction.Bid[]>([]);
  const [bidsNextPageToken, setBidsNextPageToken] = useState<string | undefined | null>('');
  const [bidsLoading, setBidsLoading] = useState(false);
  const [loadingBidsError, setLoadingBidsError] = useState('');

  const fetchBids = useCallback(async (
    pageToken?: string,
  ) => {
    if (bidsLoading) return;
    try {
      setBidsLoading(true);
      setLoadingBidsError('');

      const getCurrentBidsPayload = new newnewapi.GetAcBidsRequest({
        postUuid,
        optionId: overviewedSuggestion.id,
        ...(pageToken ? {
          paging: {
            pageToken,
          },
        } : {}),
      });

      const res = await fetchBidsForOption(getCurrentBidsPayload);

      if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');

      if (res.data && res.data.bids) {
        setBidsHistory((curr) => {
          const workingArr = [...curr, ...res.data?.bids as newnewapi.Auction.Bid[]];
          return workingArr;
        });
        setBidsNextPageToken(res.data.paging?.nextPageToken);
      }

      setBidsLoading(false);
    } catch (err) {
      setBidsLoading(false);
      setLoadingBidsError((err as Error).message);
      console.error(err);
    }
  }, [
    setBidsHistory, bidsLoading,
    overviewedSuggestion,
    postUuid,
  ]);

  // Close on back btn
  useEffect(() => {
    const verifySuggestionHistoryOpen = () => {
      if (!isBrowser()) return;

      const suggestionId = new URL(window.location.href).searchParams.get('suggestion');

      if (!suggestionId) {
        handleCloseSuggestionBidHistory();
      }
    };

    window.addEventListener('popstate', verifySuggestionHistoryOpen);

    return () => window.removeEventListener('popstate', verifySuggestionHistoryOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchBids();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (inView && !bidsLoading && bidsNextPageToken) {
      fetchBids(bidsNextPageToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, bidsNextPageToken, bidsLoading]);

  useEffect(() => {
    const socketHandler = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PostAcBidCreated.decode(arr);
      if (decoded.optionId === overviewedSuggestion.id && decoded.bid) {
        setBidsHistory((curr) => ([(decoded.bid as newnewapi.Auction.Bid), ...curr]));
      }
    };

    if (socketConnection) {
      // console.log('Listening for bids updates events');

      socketConnection.on('PostAcBidCreated', socketHandler);
    }

    return () => {
      // console.log('Stop listening for bids updates events');
      socketConnection.off(newnewapi.PostAcBidCreated.name, socketHandler);
    };
  }, [
    socketConnection,
    overviewedSuggestion,
    setBidsHistory,
  ]);

  return (
    <SBidsContainer>
      {bidsHistory.map((bid, i) => (
        <BidCard
          key={bid.id.toString()}
          bid={bid}
        />
      ))}
      <SLoaderDiv
        ref={loadingRef}
      />
    </SBidsContainer>
  );
};

export default SuggestionOverview;

const SBidsContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  /* gap: 16px; */

  ${({ theme }) => theme.media.tablet} {
    padding-bottom: 125px;
  }
`;

const SLoaderDiv = styled.div`
  height: 10px;
`;
