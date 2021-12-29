/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';

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
import { ChannelsContext } from '../../../contexts/channelsContext';
import switchPostType from '../../../utils/switchPostType';

// Temp
const MockVideo = '/video/mock/mock_video_1.mp4';

export type TOptionWithHighestField = newnewapi.Auction.Option & {
  isHighest: boolean;
};

interface IPostViewAC {
  post: newnewapi.Auction;
  suggestionFromUrl?: newnewapi.Auction.Option;
  handleGoBack: () => void;
}

const PostViewAC: React.FunctionComponent<IPostViewAC> = ({
  post,
  suggestionFromUrl,
  handleGoBack,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state);
  const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  // Socket
  const socketConnection = useContext(SocketContext);
  const {
    channelsWithSubs,
    addChannel,
    removeChannel,
  } = useContext(ChannelsContext);

  // Tabs
  const [currentTab, setCurrentTab] = useState<
    'bids' | 'comments'
  >('bids');

  // Total amount
  const [totalAmount, setTotalAmount] = useState(post.totalAmount?.usdCents ?? 0);

  // Bids
  const [suggestions, setSuggestions] = useState<TOptionWithHighestField[]>([]);
  const [numberOfOptions, setNumberOfOptions] = useState<number | undefined>(post.optionCount ?? '');
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

      const getCurrentBidsPayload = new newnewapi.GetAcOptionsRequest({
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
            ? [...new Set(joinedArr)] : [];

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

  // Increment channel subs after mounting
  // Decrement when unmounting
  useEffect(() => {
    addChannel(post.postUuid);

    return () => {
      removeChannel(post.postUuid);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setComments([]);
    setSuggestions([]);
    setBidsNextPageToken('');
    fetchBids();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  useEffect(() => {
    if (suggestionFromUrl) {
      setOverviewedSuggestion(suggestionFromUrl);
    }
  }, [suggestionFromUrl]);

  useEffect(() => {
    const socketHandlerOptionCreatedOrUpdated = (data: any) => {
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

          workingArrUnsorted.forEach((option, i) => {
            if (i > 0) {
              // eslint-disable-next-line no-param-reassign
              option.isHighest = false;
            }
          });

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
            ? [...new Set(joinedArr)] : [];

          const highestOptionIdx = (
            workingSortedUnique as TOptionWithHighestField[]
          ).findIndex((o) => o.id === highestOption.id);

          if (workingSortedUnique[highestOptionIdx]) {
            (workingSortedUnique[highestOptionIdx] as TOptionWithHighestField).isHighest = true;
          }

          return workingSortedUnique;
        });

        setOverviewedSuggestion((curr) => {
          if (curr === undefined) return curr;
          const workingObj = { ...curr };
          if (workingObj.totalAmount) {
            workingObj.totalAmount.usdCents = decoded.option?.totalAmount?.usdCents!!;
          }
          return workingObj as newnewapi.Auction.Option;
        });
      }
    };

    const socketHandlerPostData = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PostUpdated.decode(arr);

      if (!decoded) return;
      const [decodedParsed] = switchPostType(
        decoded.post as newnewapi.IPost);
      if (decodedParsed.postUuid === post.postUuid) {
        setTotalAmount(decoded.post?.auction?.totalAmount?.usdCents!!);
        setNumberOfOptions(decoded.post?.auction?.optionCount!!);
      }
    };

    if (socketConnection) {
      socketConnection.on('PostAcOptionCreatedOrUpdated', socketHandlerOptionCreatedOrUpdated);
      socketConnection.on('PostUpdated', socketHandlerPostData);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('PostAcOptionCreatedOrUpdated', socketHandlerOptionCreatedOrUpdated);
        socketConnection.off('PostUpdated', socketHandlerPostData);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    socketConnection,
    post,
    user.userData?.userUuid,
    setSuggestions,
  ]);

  return (
    <SWrapper>
      <SExpiresSection>
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
            amountInBids={totalAmount}
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
                ...(
                  numberOfOptions
                    ? { amount: numberOfOptions.toString() } : {}
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

PostViewAC.defaultProps = {
  suggestionFromUrl: undefined,
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
