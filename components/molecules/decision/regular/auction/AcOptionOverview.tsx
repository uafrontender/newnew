/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useInView } from 'react-intersection-observer';

import { SocketContext } from '../../../../../contexts/socketContext';
import { fetchBidsForOption } from '../../../../../api/endpoints/auction';

import AcBidCard from './AcBidCard';

import isBrowser from '../../../../../utils/isBrowser';

interface IOptionOverview {
  postUuid: string;
  overviewedOption: newnewapi.Auction.Option;
  handleCloseOptionBidHistory: () => void;
}

const OptionOverview: React.FunctionComponent<IOptionOverview> = ({
  postUuid,
  overviewedOption,
  handleCloseOptionBidHistory,
}) => {
  // Socket
  const { socketConnection } = useContext(SocketContext);
  // Infinite load
  const { ref: loadingRef, inView } = useInView();

  // Bids history
  const [bidsHistory, setBidsHistory] = useState<newnewapi.Auction.Bid[]>([]);
  const [bidsNextPageToken, setBidsNextPageToken] = useState<
    string | undefined | null
  >('');
  const [bidsLoading, setBidsLoading] = useState(false);
  const [loadingBidsError, setLoadingBidsError] = useState('');

  const fetchBids = useCallback(
    async (pageToken?: string) => {
      if (bidsLoading) return;
      try {
        setBidsLoading(true);
        setLoadingBidsError('');

        const getCurrentBidsPayload = new newnewapi.GetAcBidsRequest({
          postUuid,
          optionId: overviewedOption.id,
          ...(pageToken
            ? {
                paging: {
                  pageToken,
                },
              }
            : {}),
        });

        const res = await fetchBidsForOption(getCurrentBidsPayload);

        if (!res?.data || res.error) {
          throw new Error(res?.error?.message ?? 'Request failed');
        }

        if (res.data.bids) {
          setBidsHistory((curr) => {
            const workingArr = [
              ...curr,
              ...(res.data?.bids as newnewapi.Auction.Bid[]),
            ];
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
    },
    [setBidsHistory, bidsLoading, overviewedOption, postUuid]
  );

  // Close on back btn
  useEffect(() => {
    const verifyOptionHistoryOpen = () => {
      if (!isBrowser()) return;

      const optionId = new URL(window.location.href).searchParams.get(
        'suggestion'
      );

      if (!optionId) {
        handleCloseOptionBidHistory();
      }
    };

    window.addEventListener('popstate', verifyOptionHistoryOpen);

    return () =>
      window.removeEventListener('popstate', verifyOptionHistoryOpen);
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
      const decoded = newnewapi.AcBidCreated.decode(arr);
      if (decoded.optionId === overviewedOption.id && decoded.bid) {
        setBidsHistory((curr) => [
          decoded.bid as newnewapi.Auction.Bid,
          ...curr,
        ]);
      }
    };

    if (socketConnection) {
      socketConnection?.on('AcBidCreated', socketHandler);
    }

    return () => {
      socketConnection?.off('AcBidCreated', socketHandler);
    };
  }, [socketConnection, overviewedOption, setBidsHistory]);

  return (
    <SBidsContainer>
      {bidsHistory.map((bid) => (
        <AcBidCard key={bid.id.toString()} bid={bid} />
      ))}
      <SLoaderDiv ref={loadingRef} />
    </SBidsContainer>
  );
};

export default OptionOverview;

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
