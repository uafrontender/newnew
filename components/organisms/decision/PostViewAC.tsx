/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
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
import AcOptionsTab from '../../molecules/decision/auction/AcOptionsTab';
import CommentsTab from '../../molecules/decision/CommentsTab';
import OptionTitle from '../../molecules/decision/auction/AcOptionTitle';
import AcOptionTopInfo from '../../molecules/decision/auction/AcOptionTopInfo';
import GoBackButton from '../../molecules/GoBackButton';
import InlineSvg from '../../atoms/InlineSVG';

// Icons
import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import { ChannelsContext } from '../../../contexts/channelsContext';
import switchPostType from '../../../utils/switchPostType';
import { fetchPostByUUID, markPost } from '../../../api/endpoints/post';

// Temp
const MockVideo = '/video/mock/mock_video_1.mp4';

export type TAcOptionWithHighestField = newnewapi.Auction.Option & {
  isHighest: boolean;
};

interface IPostViewAC {
  post: newnewapi.Auction;
  optionFromUrl?: newnewapi.Auction.Option;
  handleGoBack: () => void;
}

const PostViewAC: React.FunctionComponent<IPostViewAC> = ({
  post,
  optionFromUrl,
  handleGoBack,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('decision');
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

  // Options
  const [options, setOptions] = useState<TAcOptionWithHighestField[]>([]);
  const [numberOfOptions, setNumberOfOptions] = useState<number | undefined>(post.optionCount ?? '');
  const [optionsNextPageToken, setOptionsNextPageToken] = useState<string | undefined | null>('');
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [loadingOptionsError, setLoadingOptionsError] = useState('');

  // Animating options
  const [optionToAnimate, setOptionToAnimate] = useState('');

  // Option overview
  const [
    overviewedOption, setOverviewedOption,
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

  const sortOptions = useCallback((unsortedArr: TAcOptionWithHighestField[]) => {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < unsortedArr.length; i++) {
      // eslint-disable-next-line no-param-reassign
      unsortedArr[i].isHighest = false;
    }

    const highestOption = unsortedArr.sort((a, b) => (
      (b?.totalAmount?.usdCents as number) - (a?.totalAmount?.usdCents as number)
    ))[0];

    unsortedArr.forEach((option, i) => {
      if (i > 0) {
        // eslint-disable-next-line no-param-reassign
        option.isHighest = false;
      }
    });

    const optionsByUser = user.userData?.userUuid
      ? unsortedArr.filter((o) => o.creator?.uuid === user.userData?.userUuid)
        .sort((a, b) => {
          return (b.id as number) - (a.id as number);
        })
      : [];

    const optionsSupportedByUser = user.userData?.userUuid
      ? unsortedArr.filter((o) => o.isSupportedByUser)
        .sort((a, b) => {
          return (b.id as number) - (a.id as number);
        })
      : [];

    // const optionsByVipUsers = [];

    const workingArrSorted = unsortedArr.sort((a, b) => {
      // Sort the rest by newest first
      return (b.id as number) - (a.id as number);
    });

    const joinedArr = [
      ...(
        highestOption
        && (highestOption.creator?.uuid === user.userData?.userUuid
          || highestOption.isSupportedByUser) ? [highestOption] : []),
      ...optionsByUser,
      ...optionsSupportedByUser,
      // ...optionsByVipUsers,
      ...(
        highestOption
        && highestOption.creator?.uuid !== user.userData?.userUuid ? [highestOption] : []),
      ...workingArrSorted,
    ];

    const workingSortedUnique = joinedArr.length > 0
      ? [...new Set(joinedArr)] : [];

    const highestOptionIdx = (
      workingSortedUnique as TAcOptionWithHighestField[]
    ).findIndex((o) => o.id === highestOption.id);

    if (workingSortedUnique[highestOptionIdx]) {
      (workingSortedUnique[highestOptionIdx] as TAcOptionWithHighestField).isHighest = true;
    }

    return workingSortedUnique;
  }, [
    user.userData?.userUuid,
  ]);

  const fetchBids = useCallback(async (
    pageToken?: string,
  ) => {
    if (optionsLoading) return;
    try {
      setOptionsLoading(true);
      setLoadingOptionsError('');

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
        setOptions((curr) => {
          const workingArr = [...curr, ...res.data?.options as TAcOptionWithHighestField[]];

          return sortOptions(workingArr);
        });
        setOptionsNextPageToken(res.data.paging?.nextPageToken);
      }

      setOptionsLoading(false);
    } catch (err) {
      setOptionsLoading(false);
      setLoadingOptionsError((err as Error).message);
      console.error(err);
    }
  }, [
    post,
    setOptions,
    sortOptions,
    optionsLoading,
  ]);

  const fetchPostLatestData = useCallback(async () => {
    try {
      const fetchPostPayload = new newnewapi.GetPostRequest({
        postUuid: post.postUuid,
      });

      const res = await fetchPostByUUID(fetchPostPayload);

      if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');

      setTotalAmount(res.data.auction!!.totalAmount?.usdCents as number);
      setNumberOfOptions(res.data.auction!!.optionCount as number);
    } catch (err) {
      console.error(err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddOrUpdateOptionFromResponse = useCallback((
    newOption: newnewapi.Auction.Option,
  ) => {
    setOptions((curr) => {
      const workingArr = [...curr];
      let workingArrUnsorted;
      const idx = workingArr.findIndex((op) => op.id === newOption?.id);
      if (idx === -1) {
        workingArrUnsorted = [...workingArr, newOption as TAcOptionWithHighestField];
      } else {
        workingArr[idx]
          .supporterCount = (newOption?.supporterCount as number);
        workingArr[idx]
          .totalAmount = (newOption?.totalAmount as newnewapi.IMoneyAmount);
        workingArrUnsorted = workingArr;
      }

      return sortOptions(workingArrUnsorted);
    });
    setOptionToAnimate(newOption.id.toString());

    setTimeout(() => {
      setOptionToAnimate('');
    }, 3000);
  }, [
    setOptions,
    sortOptions,
  ]);

  const handleOpenOptionBidHistory = (
    optionToOpen: newnewapi.Auction.Option,
  ) => {
    setOverviewedOption(optionToOpen);
    window.history.pushState(
      optionToOpen.id,
      'Post',
      `${currLocation}&suggestion=${optionToOpen.id}`,
    );
  };

  const handleCloseOptionBidHistory = () => {
    setOverviewedOption(undefined);
    window.history.replaceState('', '', currLocation);
  };

  // Increment channel subs after mounting
  // Decrement when unmounting
  useEffect(() => {
    addChannel(
      post.postUuid,
      {
        postUpdates: {
          postUuid: post.postUuid,
        },
      },
    );

    return () => {
      removeChannel(post.postUuid);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mark post as viewed if logged in
  useEffect(() => {
    async function markAsViewed() {
      if (
        !user.loggedIn
        || user.userData?.userUuid === post.creator?.uuid) return;
      try {
        const markAsViewedPayload = new newnewapi.MarkPostRequest({
          markAs: newnewapi.MarkPostRequest.Kind.VIEWED,
          postUuid: post.postUuid,
        });

        const res = await markPost(markAsViewedPayload);

        console.log(res);
      } catch (err) {
        console.error(err);
      }
    }

    markAsViewed();
  }, [
    post,
    user.loggedIn,
    user.userData?.userUuid,
  ]);

  useEffect(() => {
    setComments([]);
    setOptions([]);
    setOptionsNextPageToken('');
    fetchBids();
    fetchPostLatestData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.postUuid]);

  useEffect(() => {
    if (optionFromUrl) {
      setOverviewedOption(optionFromUrl);
    }
  }, [optionFromUrl]);

  useEffect(() => {
    const socketHandlerOptionCreatedOrUpdated = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.AcOptionCreatedOrUpdated.decode(arr);
      if (decoded.option && decoded.postUuid === post.postUuid) {
        setOptions((curr) => {
          const workingArr = [...curr];
          let workingArrUnsorted;
          const idx = workingArr.findIndex((op) => op.id === decoded.option?.id);
          if (idx === -1) {
            workingArrUnsorted = [...workingArr, decoded.option as TAcOptionWithHighestField];
          } else {
            workingArr[idx]
              .supporterCount = (decoded.option?.supporterCount as number);
            workingArr[idx]
              .totalAmount = (decoded.option?.totalAmount as newnewapi.IMoneyAmount);
            workingArrUnsorted = workingArr;
          }

          return sortOptions(workingArrUnsorted);
        });

        setOverviewedOption((curr) => {
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
      socketConnection.on('AcOptionCreatedOrUpdated', socketHandlerOptionCreatedOrUpdated);
      socketConnection.on('PostUpdated', socketHandlerPostData);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('AcOptionCreatedOrUpdated', socketHandlerOptionCreatedOrUpdated);
        socketConnection.off('PostUpdated', socketHandlerPostData);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    socketConnection,
    post,
    user.userData?.userUuid,
    setOptions,
    sortOptions,
  ]);

  return (
    <SWrapper>
      <SExpiresSection>
        {isMobile && !overviewedOption && (
          <GoBackButton
            style={{
              gridArea: 'closeBtnMobile',
            }}
            onClick={handleGoBack}
          />
        )}
        {overviewedOption && (
          <GoBackButton
            style={{
              gridArea: 'closeBtnMobile',
            }}
            onClick={() => {
              handleCloseOptionBidHistory();
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
        // NB! Will support responses, as well!
        postId={post.postUuid}
        announcement={post.announcement!!}
        isMuted={mutedMode}
        handleToggleMuted={() => handleToggleMutedMode()}
      />
      <div
        style={{
          gridArea: 'title',
        }}
      >
        <PostTitle
          shrink={overviewedOption !== undefined}
        >
          { post.title }
        </PostTitle>
        {overviewedOption && (
          <OptionTitle
            option={overviewedOption}
          />
        )}
      </div>
      <SActivitesContainer>
        {!overviewedOption ? (
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
          <AcOptionTopInfo
            creator={overviewedOption?.creator!!}
            option={overviewedOption}
            postId={post.postUuid}
            minAmount={post.minimalBid?.usdCents
              ? (
                parseInt((post.minimalBid?.usdCents / 100).toFixed(0), 10)
              ) : 5}
            amountInBids={overviewedOption?.totalAmount?.usdCents!!}
            createdAtSeconds={overviewedOption?.createdAt?.seconds as number}
            handleAddOrUpdateOptionFromResponse={handleAddOrUpdateOptionFromResponse}
          />
        )}
        {!overviewedOption ? (
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
            { t('tabs.history') }
          </SHistoryLabel>
        )}
        {currentTab === 'bids'
          ? (
            <AcOptionsTab
              postId={post.postUuid}
              options={options}
              optionToAnimate={optionToAnimate}
              optionsLoading={optionsLoading}
              pagingToken={optionsNextPageToken}
              minAmount={post.minimalBid?.usdCents
                ? (
                  parseInt((post.minimalBid?.usdCents / 100).toFixed(0), 10)
                ) : 5}
              handleLoadBids={fetchBids}
              overviewedOption={overviewedOption}
              handleAddOrUpdateOptionFromResponse={handleAddOrUpdateOptionFromResponse}
              handleOpenOptionBidHistory={handleOpenOptionBidHistory}
              handleCloseOptionBidHistory={handleCloseOptionBidHistory}
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
  optionFromUrl: undefined,
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

const SHistoryLabel = styled.div`
  height: 32px;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`;
