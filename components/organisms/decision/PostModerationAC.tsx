/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import styled, { css, useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';

import { SocketContext } from '../../../contexts/socketContext';
import { fetchCurrentBidsForPost, placeBidOnAuction } from '../../../api/endpoints/auction';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';

import AcOptionsTabModeration from '../../molecules/decision/auction/moderation/AcOptionsTabModeration';
import PostVideo from '../../molecules/decision/PostVideo';
import PostTitle from '../../molecules/decision/PostTitle';
import PostTimer from '../../molecules/decision/PostTimer';
import PostTopInfo from '../../molecules/decision/PostTopInfo';
import DecisionTabs from '../../molecules/decision/PostTabs';
import CommentsTab from '../../molecules/decision/CommentsTab';
import GoBackButton from '../../molecules/GoBackButton';
import InlineSvg from '../../atoms/InlineSVG';

// Icons
import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import { ChannelsContext } from '../../../contexts/channelsContext';
import switchPostType from '../../../utils/switchPostType';
import { fetchPostByUUID, markPost } from '../../../api/endpoints/post';
import LoadingModal from '../../molecules/LoadingModal';
import isBrowser from '../../../utils/isBrowser';
import PostTopInfoModeration from '../../molecules/decision/PostTopInfoModeration';
import { TPostStatusStringified } from '../../../utils/switchPostStatus';
import AcWinnerTabModeration from '../../molecules/decision/auction/moderation/AcWinnerTabModeration';
import Button from '../../atoms/Button';
import PostVideoModeration from '../../molecules/decision/PostVideoModeration';

export type TAcOptionWithHighestField = newnewapi.Auction.Option & {
  isHighest: boolean;
};

interface IPostModerationAC {
  post: newnewapi.Auction;
  handleGoBack: () => void;
  postStatus: TPostStatusStringified;
  handleUpdatePostStatus: (postStatus: number | string) => void;
}

const PostModerationAC: React.FunctionComponent<IPostModerationAC> = ({
  post,
  handleGoBack,
  postStatus,
  handleUpdatePostStatus,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('decision');
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state);
  const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const showSelectWinnerOption = useMemo(() => (
    postStatus === 'wating_for_decision'
  ), [postStatus]);

  // Socket
  const socketConnection = useContext(SocketContext);
  const {
    channelsWithSubs,
    addChannel,
    removeChannel,
  } = useContext(ChannelsContext);

  // Tabs
  const tabs = useMemo(() => {
    // NB! Will a check for winner option here
    if (
      postStatus === 'waiting_for_response'
      || postStatus === 'succeeded'
    ) {
      return [
        {
          label: 'winner',
          value: 'winner',
        },
        {
          label: 'bids',
          value: 'bids',
        },
        {
          label: 'comments',
          value: 'comments',
        },
      ];
    }
    return [
      {
        label: 'bids',
        value: 'bids',
      },
      {
        label: 'comments',
        value: 'comments',
      },
    ];
  }, [postStatus]);

  const [currentTab, setCurrentTab] = useState<'bids' | 'comments' | 'winner'>(() => {
    if (!isBrowser()) {
      return 'bids'
    }
    const { hash } = window.location;
    if (hash && (hash === '#bids' || hash === '#comments' || hash === '#winner')) {
      console.log('from hash')
      console.log(hash)
      return hash.substring(1) as 'bids' | 'comments' | 'winner';
    }
    return 'bids';
  });

  const handleChangeTab = (tab: string) => {
    if (tab === 'comments' && isMobile) {
      window.history.pushState(post.postUuid, 'Post', `/?post=${post.postUuid}#${tab}`);
    } else {
      window.history.replaceState(post.postUuid, 'Post', `/?post=${post.postUuid}#${tab}`);
    }
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  // Respone upload
  const [responseFreshlyUploaded, setResponseFreshlyUploaded] = useState<newnewapi.IVideoUrls | undefined>(undefined);

  useEffect(() => {
    const handleHashChange = () => {
      const { hash } = window.location;
      if (!hash) {
        setCurrentTab('bids');
        return;
      }
      const parsedHash = hash.substring(1);
      if (parsedHash === 'bids' || parsedHash === 'comments' || parsedHash === 'winner') {
        setCurrentTab(parsedHash);
      }
    }

    window.addEventListener('hashchange', handleHashChange, false);

    return () => {
      window.removeEventListener('hashchange', handleHashChange, false);
    }
  }, []);

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
      ? unsortedArr.filter((o) => o.isSupportedByMe)
        .sort((a, b) => {
          return (b.id as number) - (a.id as number);
        })
      : [];

    const optionsByVipUsers = unsortedArr
      .filter((o) => o.isCreatedBySubscriber)
      .sort((a, b) => {
        return (b.id as number) - (a.id as number);
      });

    const workingArrSorted = unsortedArr.sort((a, b) => {
      // Sort the rest by newest first
      return (b.id as number) - (a.id as number);
    });

    const joinedArr = [
      ...(
        highestOption
        && (highestOption.creator?.uuid === user.userData?.userUuid
          || highestOption.isSupportedByMe) ? [highestOption] : []),
      ...optionsByUser,
      ...optionsSupportedByUser,
      ...optionsByVipUsers,
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
      handleUpdatePostStatus(res.data.auction!!.status!!);
    } catch (err) {
      console.error(err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveOption = useCallback((
    optionToRemove: newnewapi.Auction.Option,
  ) => {
    setOptions((curr) => {
      const workingArr = [...curr];
      const workingArrUnsorted = [...workingArr.filter((o) => o.id !== optionToRemove.id)];
      return sortOptions(workingArrUnsorted);
    });
  }, [
    setOptions,
    sortOptions,
  ]);

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

    const socketHandlerPostStatus = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PostStatusUpdated.decode(arr);

      console.log(decoded)


      if (!decoded) return;
      if (decoded.postUuid === post.postUuid) {
        handleUpdatePostStatus(decoded.auction!!);
      }
    };

    if (socketConnection) {
      socketConnection.on('AcOptionCreatedOrUpdated', socketHandlerOptionCreatedOrUpdated);
      socketConnection.on('PostUpdated', socketHandlerPostData);
      socketConnection.on('PostStatusUpdated', socketHandlerPostStatus);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('AcOptionCreatedOrUpdated', socketHandlerOptionCreatedOrUpdated);
        socketConnection.off('PostUpdated', socketHandlerPostData);
        socketConnection.off('PostStatusUpdated', socketHandlerPostStatus);
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

  console.log(postStatus)

  return (
    <SWrapper>
      <SExpiresSection>
        {isMobile && (
          <SGoBackButton
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
      </SExpiresSection>
      <PostVideoModeration
        postId={post.postUuid}
        announcement={post.announcement!!}
        response={(post.response || responseFreshlyUploaded) ?? undefined}
        postStatus={postStatus}
        isMuted={mutedMode}
        handleToggleMuted={() => handleToggleMutedMode()}
        handleUpdateResponseVideo={(newValue) => setResponseFreshlyUploaded(newValue)}
      />
      <PostTopInfoModeration
        postType="ac"
        postStatus={postStatus}
        title={post.title}
        postId={post.postUuid}
        amountInBids={totalAmount}
        handleUpdatePostStatus={handleUpdatePostStatus}
      />
      <SActivitesContainer
        showSelectWinnerOption={showSelectWinnerOption}
      >
        <DecisionTabs
          tabs={tabs}
          activeTab={currentTab}
          handleChangeTab={handleChangeTab}
        />
        {currentTab === 'bids'
          ? (
            <AcOptionsTabModeration
              postId={post.postUuid}
              postStatus={postStatus}
              options={options}
              optionsLoading={optionsLoading}
              pagingToken={optionsNextPageToken}
              minAmount={post.minimalBid?.usdCents
                ? (
                  parseInt((post.minimalBid?.usdCents / 100).toFixed(0), 10)
                ) : 5}
              handleLoadBids={fetchBids}
              handleRemoveOption={handleRemoveOption}
              handleUpdatePostStatus={handleUpdatePostStatus}
            />
          ) : (
            currentTab === 'comments'
            ? (
              <CommentsTab
                comments={comments}
                handleGoBack={() => handleChangeTab('bids')}
              />
            ) : (
              <AcWinnerTabModeration
                option={new newnewapi.Auction.Option({
                  id: 123,
                  title: 'Some really really long long long long title',
                  supporterCount: 2,
                  totalAmount: {
                    usdCents: 100000,
                  },
                  creator: {
                    username: 'user123',
                  }
                })}
              />
            )
          )}
      </SActivitesContainer>
    </SWrapper>
  );
};

PostModerationAC.defaultProps = {
};

export default PostModerationAC;

const SWrapper = styled.div`
  width: 100%;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    display: grid;
    grid-template-areas:
      'expires expires'
      'title title'
      'video activities';
    grid-template-columns: 284px 1fr;
    grid-template-rows: 46px min-content 1fr;
    grid-column-gap: 16px;

    align-items: flex-start;

    padding-bottom: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
    grid-template-areas:
      'video expires'
      'video title'
      'video activities';
    grid-template-columns: 410px 538px;

    padding-bottom: initial;
  }
`;

const SExpiresSection = styled.div`
  grid-area: expires;

  position: relative;

  display: flex;
  justify-content: center;

  width: 100%;
  margin-bottom: 6px;

  padding-left: 24px;

  ${({ theme }) => theme.media.tablet} {
    padding-left: initial;
  }
`;

const SGoBackButton = styled(GoBackButton)`
  position: absolute;
  left: 0;
  top: 4px;
`;

const SActivitesContainer = styled.div<{
  showSelectWinnerOption: boolean;
}>`
  grid-area: activities;

  display: flex;
  flex-direction: column;

  align-self: bottom;

  height: 100%;
  width: 100%;

  min-height: calc(728px - 46px - 64px - 40px - 72px);

  ${({ theme }) => theme.media.tablet} {
    min-height: initial;
    max-height: calc(728px - 46px - 64px - 40px - 72px);
  }

  ${({ theme }) => theme.media.laptop} {
    max-height: calc(728px - 46px - 64px - 72px);

    ${({ showSelectWinnerOption }) => (
      showSelectWinnerOption
      ? css`
        max-height: calc(728px - 46px - 64px - 72px - 130px);
      `
      : null
    )}
  }
`;
