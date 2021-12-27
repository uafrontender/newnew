/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';
import { uniqBy } from 'lodash';

import { SocketContext } from '../../../contexts/socketContext';
import { fetchCurrentBidsForPost } from '../../../api/endpoints/auction';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';

import PostVideo from '../../molecules/decision/PostVideo';
import PostTitle from '../../molecules/decision/PostTitle';
import PostTimer from '../../molecules/decision/PostTimer';
import PostTopInfo from '../../molecules/decision/PostTopInfo';
import DecisionTabs from '../../molecules/decision/PostTabs';
import BidsTab from '../../molecules/decision/auction/BidsTab';
import CommentsTab from '../../molecules/decision/CommentsTab';
import SuggestionTitle from '../../molecules/decision/auction/SuggestionTitle';
import SuggestionTopInfo from '../../molecules/decision/auction/SuggestionTopInfo';
import GoBackButton from '../../molecules/GoBackButton';
import InlineSvg from '../../atoms/InlineSVG';

// Icons
import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';

// Temp
const MockVideo = '/video/mock/mock_video_1.mp4';

export type TOptionWithHighestField = newnewapi.Auction.Option & {
  isHighest: boolean;
};

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
  const { user } = useAppSelector((state) => state);
  const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  // Socket
  const socketConnection = useContext(SocketContext);

  // Tabs
  const [currentTab, setCurrentTab] = useState<
    'bids' | 'comments'
  >('bids');

  // Bids
  const [suggestions, setSuggestions] = useState<TOptionWithHighestField[]>([]);
  const [numberOfBids, setNumberOfBids] = useState<number | undefined>(undefined);
  const [bidsNextPageToken, setBidsNextPageToken] = useState<string | undefined | null>('');
  const [bidsLoading, setBidsLoading] = useState(false);
  const [loadingBidsError, setLoadingBidsError] = useState('');

  // Suggestion overview
  const [
    overviewedSuggestion, setOverviewedSuggestion,
  ] = useState<newnewapi.Auction.Option | undefined>(undefined);
  const currLocation = `/?post=${post.postUuid}`;

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
        setSuggestions((curr) => {
          const workingArr = [...curr, ...res.data?.options as TOptionWithHighestField[]];

          const highestOption = workingArr.sort((a, b) => (
            (b?.totalAmount?.usdCents as number) - (a?.totalAmount?.usdCents as number)
          ))[0];

          const optionsByUser = user.userData?.userUuid
            ? workingArr.filter((o) => o.creator?.uuid === user.userData?.userUuid)
            : [];

          const optionsSupportedByUser = user.userData?.userUuid
            ? workingArr.filter((o) => o.isSupportedByUser)
            : [];

          // const optionsByVipUsers = [];

          const workingArrSorted = workingArr.sort((a, b) => {
            // Sort the rest by newest first
            return (b.id as number) - (a.id as number);
          });

          const joinedArr = [
            ...optionsByUser,
            ...optionsSupportedByUser,
            // ...optionsByVipUsers,
            ...(highestOption ? [highestOption] : []),
            ...workingArrSorted,
          ];

          const workingSortedUnique = joinedArr.length > 0
            ? uniqBy(joinedArr, 'id') : [];

          const highestOptionIdx = (
            workingSortedUnique as TOptionWithHighestField[]
          ).findIndex((o) => o.id === highestOption.id);

          if (workingSortedUnique[highestOptionIdx]) {
            workingSortedUnique[highestOptionIdx].isHighest = true;
          }

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
    setSuggestions, bidsLoading,
    post, user.userData?.userUuid,
  ]);

  const handleUpdateIsSupportedByUser = (id: number) => {
    setSuggestions((curr) => {
      const workingArr = [...curr];
      const idx = workingArr.findIndex((o) => o.id === id);
      workingArr[idx].isSupportedByUser = true;
      return workingArr;
    });
  };

  const handleOpenSuggestionBidHistory = (
    suggestionToOpen: newnewapi.Auction.Option,
  ) => {
    setOverviewedSuggestion(suggestionToOpen);
    window.history.pushState(
      suggestionToOpen.id,
      'Post',
      `${currLocation}&suggestion=${suggestionToOpen.id}`,
    );
  };

  const handleCloseSuggestionBidHistory = () => {
    setOverviewedSuggestion(undefined);
    window.history.replaceState('', '', currLocation);
  };

  useEffect(() => {
    setComments([]);
    setSuggestions([]);
    setBidsNextPageToken('');
    fetchBids();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  useEffect(() => {
    const socketHandler = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PostAcOptionCreatedOrUpdated.decode(arr);
      if (decoded.option && decoded.postUuid === post.postUuid) {
        setSuggestions((curr) => {
          const workingArr = [...curr];
          let workingArrUnsorted;
          const idx = workingArr.findIndex((op) => op.id === decoded.option?.id);
          if (idx === -1) {
            workingArrUnsorted = [...workingArr, decoded.option as TOptionWithHighestField];
          } else {
            workingArr[idx]
              .supporterCount = (decoded.option?.supporterCount as number);
            workingArr[idx]
              .totalAmount = (decoded.option?.totalAmount as newnewapi.IMoneyAmount);
            workingArrUnsorted = workingArr;
          }

          const highestOption = workingArrUnsorted.sort((a, b) => (
            (b?.totalAmount?.usdCents as number) - (a?.totalAmount?.usdCents as number)
          ))[0];

          const optionsByUser = user.userData?.userUuid
            ? workingArrUnsorted.filter((o) => o.creator?.uuid === user.userData?.userUuid)
            : [];

          const optionsSupportedByUser = user.userData?.userUuid
            ? workingArrUnsorted.filter((o) => o.isSupportedByUser)
            : [];

          // const optionsByVipUsers = [];

          const workingArrSorted = workingArrUnsorted.sort((a, b) => {
            // Sort the rest by newest first
            return (b.id as number) - (a.id as number);
          });

          const joinedArr = [
            ...optionsByUser,
            ...optionsSupportedByUser,
            // ...optionsByVipUsers,
            ...(highestOption ? [highestOption] : []),
            ...workingArrSorted,
          ];

          const workingSortedUnique = joinedArr.length > 0
            ? uniqBy(joinedArr, 'id') : [];

          const highestOptionIdx = (
            workingSortedUnique as TOptionWithHighestField[]
          ).findIndex((o) => o.id === highestOption.id);

          if (workingSortedUnique[highestOptionIdx]) {
            (workingSortedUnique[highestOptionIdx] as TOptionWithHighestField).isHighest = true;
          }

          return workingSortedUnique;
        });
      }
    };

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

      const subscribeMsgEncoded = newnewapi.SubscribeToChannels.encode(subscribeMsg).finish();

      console.log(subscribeMsgEncoded);
      console.log(subscribeMsg);

      socketConnection.emit(
        newnewapi.SubscribeToChannels.name,
        subscribeMsgEncoded,
      );

      console.log(newnewapi.PostAcOptionCreatedOrUpdated.name);
      console.log('hello');

      socketConnection.on(newnewapi.PostAcOptionCreatedOrUpdated.name, (data: any) => {
        console.log('Received option data');
        const arr = new Uint8Array(data);
        const decoded = newnewapi.PostAcOptionCreatedOrUpdated.decode(arr);
        if (decoded.option && decoded.postUuid === post.postUuid) {
          setSuggestions((curr) => {
            const workingArr = [...curr];
            let workingArrUnsorted;
            const idx = workingArr.findIndex((op) => op.id === decoded.option?.id);
            if (idx === -1) {
              workingArrUnsorted = [...workingArr, decoded.option as TOptionWithHighestField];
            } else {
              workingArr[idx]
                .supporterCount = (decoded.option?.supporterCount as number);
              workingArr[idx]
                .totalAmount = (decoded.option?.totalAmount as newnewapi.IMoneyAmount);
              workingArrUnsorted = workingArr;
            }

            const highestOption = workingArrUnsorted.sort((a, b) => (
              (b?.totalAmount?.usdCents as number) - (a?.totalAmount?.usdCents as number)
            ))[0];

            const optionsByUser = user.userData?.userUuid
              ? workingArrUnsorted.filter((o) => o.creator?.uuid === user.userData?.userUuid)
              : [];

            const optionsSupportedByUser = user.userData?.userUuid
              ? workingArrUnsorted.filter((o) => o.isSupportedByUser)
              : [];

            // const optionsByVipUsers = [];

            const workingArrSorted = workingArrUnsorted.sort((a, b) => {
              // Sort the rest by newest first
              return (b.id as number) - (a.id as number);
            });

            const joinedArr = [
              ...optionsByUser,
              ...optionsSupportedByUser,
              // ...optionsByVipUsers,
              ...(highestOption ? [highestOption] : []),
              ...workingArrSorted,
            ];

            const workingSortedUnique = joinedArr.length > 0
              ? uniqBy(joinedArr, 'id') : [];

            const highestOptionIdx = (
              workingSortedUnique as TOptionWithHighestField[]
            ).findIndex((o) => o.id === highestOption.id);

            if (workingSortedUnique[highestOptionIdx]) {
              (workingSortedUnique[highestOptionIdx] as TOptionWithHighestField).isHighest = true;
            }

            console.log(workingSortedUnique);
            return workingSortedUnique;
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
        // socketConnection.off(newnewapi.PostAcOptionCreatedOrUpdated.name, socketHandler);
        socketConnection.emit(
          newnewapi.UnsubscribeFromChannels.name,
          newnewapi.UnsubscribeFromChannels.encode(unsubMsg).finish(),
        );
      }
    };
  }, [
    socketConnection,
    post,
    user.userData?.userUuid,
    setSuggestions,
  ]);

  // Just a test for animations
  const [order, setOrder] = useState(true);
  useEffect(() => {
    setSuggestions((curr) => curr.sort((a, b) => (
      order
        ? ((a.totalAmount?.usdCents as number) - (b.totalAmount?.usdCents as number))
        : ((b.totalAmount?.usdCents as number) - (a.totalAmount?.usdCents as number))
    )));
  }, [order, setSuggestions]);

  useEffect(() => {
    console.log(socketConnection.listeners(newnewapi.PostAcOptionCreatedOrUpdated.name));
  }, [socketConnection]);

  return (
    <SWrapper>
      <SExpiresSection
        onDoubleClick={() => setOrder((o) => !o)}
      >
        {isMobile && !overviewedSuggestion && (
          <GoBackButton
            style={{
              gridArea: 'closeBtnMobile',
            }}
            onClick={handleGoBack}
          />
        )}
        {overviewedSuggestion && (
          <GoBackButton
            style={{
              gridArea: 'closeBtnMobile',
            }}
            onClick={() => {
              handleCloseSuggestionBidHistory();
            }}
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
        // NB! Will be changed for streaming format
        videoSrc={post.announcement?.originalVideoUrl ?? MockVideo}
        isMuted={mutedMode}
        handleToggleMuted={() => handleToggleMutedMode()}
      />
      <div
        style={{
          gridArea: 'title',
        }}
      >
        <PostTitle
          shrink={overviewedSuggestion !== undefined}
        >
          { post.title }
        </PostTitle>
        {overviewedSuggestion && (
          <SuggestionTitle
            suggestion={overviewedSuggestion}
          />
        )}
      </div>
      <SActivitesContainer>
        {!overviewedSuggestion ? (
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
        ) : (
          <SuggestionTopInfo
            creator={overviewedSuggestion?.creator!!}
            suggestion={overviewedSuggestion}
            postId={post.postUuid}
            minAmount={post.minimalBid?.usdCents
              ? (
                parseInt((post.minimalBid?.usdCents / 100).toFixed(0), 10)
              ) : 5}
            amountInBids={overviewedSuggestion?.totalAmount?.usdCents!!}
            createdAtSeconds={overviewedSuggestion?.createdAt?.seconds as number}
            handleUpdateIsSupportedByUser={handleUpdateIsSupportedByUser}
          />
        )}
        {!overviewedSuggestion ? (
          <DecisionTabs
            tabs={[
              {
                label: 'bids',
                value: 'bids',
                // NB! Temp there will a separate endpoint and socket.io event
                // for amount of bids and comments
                ...(
                  suggestions.length > 0
                    ? { amount: suggestions.length.toString() } : {}
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
        ) : (
          <SHistoryLabel>
            History
          </SHistoryLabel>
        )}
        {currentTab === 'bids'
          ? (
            <BidsTab
              postId={post.postUuid}
              suggestions={suggestions}
              suggestionsLoading={bidsLoading}
              pagingToken={bidsNextPageToken}
              minAmount={post.minimalBid?.usdCents
                ? (
                  parseInt((post.minimalBid?.usdCents / 100).toFixed(0), 10)
                ) : 5}
              handleLoadBids={fetchBids}
              overviewedSuggestion={overviewedSuggestion}
              handleUpdateIsSupportedByUser={handleUpdateIsSupportedByUser}
              handleOpenSuggestionBidHistory={handleOpenSuggestionBidHistory}
              handleCloseSuggestionBidHistory={handleCloseSuggestionBidHistory}
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

    // NB! 1fr results in unstable width
    /* grid-template-columns: 410px 1fr; */
    grid-template-columns: 410px 538px;
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

//
const SHistoryLabel = styled.div`
  height: 32px;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`;
