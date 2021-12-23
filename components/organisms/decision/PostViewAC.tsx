/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { newnewapi } from 'newnew-api';

import { fetchCurrentBidsForPost } from '../../../api/endpoints/auction';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';

import PostVideo from '../../molecules/decision/PostVideo';
import PostTitle from '../../molecules/decision/PostTitle';
import PostTimer from '../../molecules/decision/PostTimer';
import GoBackButton from '../../molecules/GoBackButton';
import InlineSvg from '../../atoms/InlineSVG';

// Icons
import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import PostTopInfo from '../../molecules/decision/PostTopInfo';
import DecisionTabs from '../../molecules/decision/PostTabs';
import BidsTab from '../../molecules/decision/auction/BidsTab';
import CommentsTab from '../../molecules/decision/CommentsTab';
import { SocketContext } from '../../../contexts/socketContext';

// Temp
const MockVideo = '/video/mock/mock_video_1.mp4';

interface IPostViewAC {
  post: newnewapi.Auction;
  handleGoBack: () => void;
}

const PostViewAC: React.FunctionComponent<IPostViewAC> = ({
  post,
  handleGoBack,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  // Socket
  const socketConnection = useContext(SocketContext);

  // Tabs
  const [currentTab, setCurrentTab] = useState<
    'bids' | 'comments'
  >('bids');

  // Bids
  const [bids, setBids] = useState<newnewapi.Auction.Option[]>([]);
  const [numberOfBids, setNumberOfBids] = useState<number | undefined>(undefined);
  const [bidsNextPageToken, setBidsNextPageToken] = useState<string | undefined | null>('');
  const [bidsLoading, setBidsLoading] = useState(false);
  const [loadingBidsError, setLoadingBidsError] = useState('');

  // Comments
  const [comments, setComments] = useState<any[]>([]);
  const [commentsNextPageToken, setCommentsNextPageToken] = useState<string | undefined | null>('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [loadingCommentsError, setLoadingCommentsError] = useState('');

  const handleToggleMutedMode = useCallback(() => {
    dispatch(toggleMutedMode(''));
  }, [dispatch]);

  const fetchBids = useCallback(async (
    pageToken?: string,
  ) => {
    if (bidsLoading) return;
    try {
      setBidsLoading(true);
      setLoadingBidsError('');

      const getCurrentBidsPayload = new newnewapi.GetCurrentBidsRequest({
        postUuid: post.postUuid,
        ...(pageToken ? {
          paging: {
            pageToken,
          },
        } : {}),
      });

      const res = await fetchCurrentBidsForPost(getCurrentBidsPayload);

      if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');

      if (res.data && res.data.options) {
        setBids((curr) => {
          const workingArrUnsorted = [...curr, ...res.data?.options as newnewapi.Auction.Option[]];
          const workingArrSorted = workingArrUnsorted.sort((a, b) => (
            (b?.totalAmount?.usdCents as number) - (a?.totalAmount?.usdCents as number)
          ));
          const workingSortedUnique = [...workingArrSorted.reduce((a, b) => {
            a.set(b.id, b);
            return a;
          }, new Map()).values()];
          return workingSortedUnique;
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
    setBids, bidsLoading,
    post,
  ]);

  useEffect(() => {
    setComments([]);
    setBids([]);
    setBidsNextPageToken('');
    fetchBids();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  useEffect(() => {
    if (socketConnection && socketConnection.connected) {
      console.log('Subscribing for socket updates');
      const subscribeMsg = new newnewapi.SubscribeToChannels({
        channels: [
          {
            postUpdates: {
              postUuid: post.postUuid,
            },
          },
        ],
      });
      socketConnection.emit(
        newnewapi.SubscribeToChannels.name,
        newnewapi.SubscribeToChannels.encode(subscribeMsg).finish(),
      );

      socketConnection.on(newnewapi.PostAcBidCreatedOrUpdated.name, (data) => {
        const arr = new Uint8Array(data);
        const decoded = newnewapi.PostAcBidCreatedOrUpdated.decode(arr);
        if (decoded.option && decoded.postUuid === post.postUuid) {
          setBids((curr) => {
            const workingArr = [...curr];
            let workingArrUnsorted;
            const idx = workingArr.findIndex((op) => op.id === decoded.option?.id);
            if (idx === -1) {
              workingArrUnsorted = [...workingArr, decoded.option as newnewapi.Auction.Option];
            } else {
              workingArr[idx] = decoded.option as newnewapi.Auction.Option;
              workingArrUnsorted = workingArr;
            }

            const workingArrSorted = workingArrUnsorted.sort((a, b) => (
              (b?.totalAmount?.usdCents as number) - (a?.totalAmount?.usdCents as number)
            ));

            console.log(workingArrSorted);

            return workingArrSorted;
          });
        }
      });
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        console.log('Unsubscribing from socket updates');
        const unsubMsg = new newnewapi.UnsubscribeFromChannels({
          channels: [
            {
              postUpdates: {
                postUuid: post.postUuid,
              },
            },
          ],
        });
        socketConnection.emit(
          newnewapi.UnsubscribeFromChannels.name,
          newnewapi.UnsubscribeFromChannels.encode(unsubMsg).finish(),
        );
      }
    };
  }, [socketConnection, post, setBids]);

  const [order, setOrder] = useState(true);
  useEffect(() => {
    setBids((curr) => curr.sort((a, b) => (
      order
        ? ((a.totalAmount?.usdCents as number) - (b.totalAmount?.usdCents as number))
        : ((b.totalAmount?.usdCents as number) - (a.totalAmount?.usdCents as number))
    )));
  }, [order, setBids]);

  return (
    <SWrapper>
      <SExpiresSection
        onDoubleClick={() => setOrder((o) => !o)}
      >
        {isMobile && (
          <GoBackButton
            style={{
              gridArea: 'closeBtnMobile',
            }}
            onClick={handleGoBack}
          />
        )}
        <PostTimer
          timestampSeconds={new Date((post.expiresAt?.seconds as number) * 1000).getTime()}
          postType="ac"
        />
        {!isMobile && (
          <SGoBackButtonDesktop
            onClick={handleGoBack}
          >
            <InlineSvg
              svg={CancelIcon}
              fill={theme.colorsThemed.text.primary}
              width="24px"
              height="24px"
            />
          </SGoBackButtonDesktop>
        )}
      </SExpiresSection>
      <PostVideo
        videoSrc={post.announcement?.videoUrl ?? MockVideo}
        isMuted={mutedMode}
        handleToggleMuted={() => handleToggleMutedMode()}
      />
      <PostTitle>
        { post.title }
      </PostTitle>
      <SActivitesContainer>
        <PostTopInfo
          postType="ac"
          // Temp
          // amountInBids={post.totalAmount?.usdCents ?? 0}
          amountInBids={5000}
          creator={post.creator!!}
          startsAtSeconds={post.startsAt?.seconds as number}
          handleFollowCreator={() => {}}
          handleFollowDecision={() => {}}
          handleReportAnnouncement={() => {}}
        />
        <DecisionTabs
          tabs={[
            {
              label: 'bids',
              value: 'bids',
              ...(
                bids.length > 0
                  ? { amount: bids.length.toString() } : {}
              ),
            },
            {
              label: 'comments',
              value: 'comments',
              ...(
                comments.length > 0
                  ? { amount: comments.length.toString() } : {}
              ),
            },
          ]}
          activeTab={currentTab}
          handleChangeTab={(tab: string) => setCurrentTab(tab as typeof currentTab)}
        />
        {currentTab === 'bids'
          ? (
            <BidsTab
              postId={post.postUuid}
              bids={bids}
              bidsLoading={bidsLoading}
              pagingToken={bidsNextPageToken}
              minAmount={post.minimalBid?.usdCents
                ? (
                  parseInt((post.minimalBid?.usdCents / 100).toFixed(0), 10)
                ) : 5}
              handleLoadBids={fetchBids}
            />
          ) : (
            <CommentsTab
              comments={comments}
            />
          )}
      </SActivitesContainer>
    </SWrapper>
  );
};

export default PostViewAC;

const SWrapper = styled.div`
  display: grid;

  grid-template-areas:
    'expires'
    'video'
    'title'
    'activities'
  ;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    grid-template-areas:
      'expires expires'
      'title title'
      'video activities'
    ;
    grid-template-columns: 284px 1fr;
    /* grid-template-rows: 46px 64px 40px calc(506px - 46px); */
    grid-template-rows: 46px min-content 1fr;
    grid-column-gap: 16px;

    align-items: flex-start;
  }

  ${({ theme }) => theme.media.laptop} {
    grid-template-areas:
      'video expires'
      'video title'
      'video activities'
    ;

    /* grid-template-rows: 46px 64px 40px calc(728px - 46px - 64px - 40px); */
    /* grid-template-rows: 1fr max-content; */

    grid-template-columns: 410px 1fr;
  }
`;

const SExpiresSection = styled.div`
  grid-area: expires;

  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas: 'closeBtnMobile timer closeBtnDesktop';

  width: 100%;

  margin-bottom: 6px;
`;

const SGoBackButtonDesktop = styled.button`
  grid-area: closeBtnDesktop;

  display: flex;
  justify-content: flex-end;
  align-items: center;

  width: 100%;
  border: transparent;
  background: transparent;
  padding: 24px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-size: 20px;
  line-height: 28px;
  font-weight: bold;
  text-transform: capitalize;

  cursor: pointer;
`;

const SActivitesContainer = styled.div`
  grid-area: activities;

  display: flex;
  flex-direction: column;

  align-self: bottom;

  height: 100%;

  min-height: calc(728px - 46px - 64px - 40px - 72px);

  ${({ theme }) => theme.media.tablet} {
    min-height: initial;
    max-height: calc(728px - 46px - 64px - 40px - 72px);
  }

  ${({ theme }) => theme.media.laptop} {
    max-height: calc(728px - 46px - 64px);
  }
`;
