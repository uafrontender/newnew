/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import styled, { useTheme } from 'styled-components';
import { newnewapi } from 'newnew-api';

import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';

import PostVideo from '../../molecules/decision/PostVideo';
import PostTitle from '../../molecules/decision/PostTitle';
import PostTimer from '../../molecules/decision/PostTimer';
import GoBackButton from '../../molecules/GoBackButton';
import InlineSvg from '../../atoms/InlineSVG';

// Icons
import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import DecisionTabs from '../../molecules/decision/PostTabs';
import { fetchCurrentOptionsForMCPost, voteOnPost } from '../../../api/endpoints/multiple_choice';
import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import CommentsTab from '../../molecules/decision/CommentsTab';
import McOptionsTab from '../../molecules/decision/multiple_choice/McOptionsTab';
import PostTopInfo from '../../molecules/decision/PostTopInfo';
import switchPostType from '../../../utils/switchPostType';
import { fetchPostByUUID, markPost } from '../../../api/endpoints/post';
import LoadingModal from '../../molecules/LoadingModal';
import McOptionsTabModeration from '../../molecules/decision/multiple_choice/moderation/McOptionsTabModeration';
import isBrowser from '../../../utils/isBrowser';
import PostVideoModeration from '../../molecules/decision/PostVideoModeration';
import { TPostStatusStringified } from '../../../utils/switchPostStatus';

export type TMcOptionWithHighestField = newnewapi.MultipleChoice.Option & {
  isHighest: boolean;
};

interface IPostModerationMC {
  post: newnewapi.MultipleChoice;
  postStatus: TPostStatusStringified;
  handleGoBack: () => void;
  handleUpdatePostStatus: (postStatus: number | string) => void;
}

const PostModerationMC: React.FunctionComponent<IPostModerationMC> = ({
  post,
  postStatus,
  handleGoBack,
  handleUpdatePostStatus,
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
  const [currentTab, setCurrentTab] = useState<'options' | 'comments'>(() => {
    if (!isBrowser()) {
      return 'options'
    }
    const { hash } = window.location;
    if (hash && (hash === '#options' || hash === '#comments')) {
      return hash.substring(1) as 'options' | 'comments';
    }
    return 'options';
  });

  const handleChangeTab = (tab: string) => {
    if (tab === 'comments' && isMobile) {
      window.history.pushState(post.postUuid, 'Post', `/?post=${post.postUuid}#${tab}`);
    } else {
      window.history.replaceState(post.postUuid, 'Post', `/?post=${post.postUuid}#${tab}`);
    }
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }

  useEffect(() => {
    const handleHashChange = () => {
      const { hash } = window.location;
      if (!hash) {
        setCurrentTab('options');
        return;
      }
      const parsedHash = hash.substring(1);
      if (parsedHash === 'options' || parsedHash === 'comments') {
        setCurrentTab(parsedHash);
      }
    }

    window.addEventListener('hashchange', handleHashChange, false);

    return () => {
      window.removeEventListener('hashchange', handleHashChange, false);
    }
  }, []);

  // Respone upload
  const [responseFreshlyUploaded, setResponseFreshlyUploaded] = useState<newnewapi.IVideoUrls | undefined>(undefined);

  const [loadingModalOpen, setLoadingModalOpen] = useState(false);

  // Total votes
  const [totalVotes, setTotalVotes] = useState(post.totalVotes ?? 0);

  // Options
  const [options, setOptions] = useState<TMcOptionWithHighestField[]>([]);
  const [numberOfOptions, setNumberOfOptions] = useState<number | undefined>(post.optionCount ?? '');
  const [optionsNextPageToken, setOptionsNextPageToken] = useState<string | undefined | null>('');
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [loadingOptionsError, setLoadingOptionsError] = useState('');

  // Comments
  const [comments, setComments] = useState<any[]>([]);
  const [commentsNextPageToken, setCommentsNextPageToken] = useState<string | undefined | null>('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [loadingCommentsError, setLoadingCommentsError] = useState('');

  const handleToggleMutedMode = useCallback(() => {
    dispatch(toggleMutedMode(''));
  }, [dispatch]);

  const sortOptions = useCallback((unsortedArr: TMcOptionWithHighestField[]) => {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < unsortedArr.length; i++) {
      // eslint-disable-next-line no-param-reassign
      unsortedArr[i].isHighest = false;
    }

    const highestOption = unsortedArr.sort((a, b) => (
      (b?.voteCount as number) - (a?.voteCount as number)
    ))[0];

    const optionsByUser = user.userData?.userUuid
      ? unsortedArr.filter((o) => o.creator?.uuid === user.userData?.userUuid)
        .sort((a, b) => (
          (b?.voteCount as number) - (a?.voteCount as number)
        ))
      : [];

    const optionsSupportedByUser = user.userData?.userUuid
      ? unsortedArr.filter((o) => o.isSupportedByMe)
        .sort((a, b) => (
          (b?.voteCount as number) - (a?.voteCount as number)
        ))
      : [];

    // const optionsByVipUsers = [];

    const workingArrSorted = unsortedArr.sort((a, b) => (
      (b?.voteCount as number) - (a?.voteCount as number)
    ));

    const joinedArr = [
      ...(
        highestOption
        && highestOption.creator?.uuid === user.userData?.userUuid ? [highestOption] : []),
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
      workingSortedUnique as TMcOptionWithHighestField[]
    ).findIndex((o) => o.id === highestOption.id);

    if (workingSortedUnique[highestOptionIdx]) {
      workingSortedUnique[highestOptionIdx].isHighest = true;
    }

    return workingSortedUnique;
  }, [user.userData?.userUuid]);

  const fetchOptions = useCallback(async (
    pageToken?: string,
  ) => {
    if (optionsLoading) return;
    try {
      setOptionsLoading(true);
      setLoadingOptionsError('');

      const getCurrentOptionsPayload = new newnewapi.GetMcOptionsRequest({
        postUuid: post.postUuid,
        ...(pageToken ? {
          paging: {
            pageToken,
          },
        } : {}),
      });

      const res = await fetchCurrentOptionsForMCPost(getCurrentOptionsPayload);

      if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');

      if (res.data && res.data.options) {
        setOptions((curr) => {
          const workingArr = [...curr, ...res.data?.options as TMcOptionWithHighestField[]];

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
    optionsLoading,
    setOptions,
    sortOptions,
    post,
  ]);

  const handleRemoveOption = useCallback((
    optionToRemove: newnewapi.MultipleChoice.Option,
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

  const fetchPostLatestData = useCallback(async () => {
    try {
      const fetchPostPayload = new newnewapi.GetPostRequest({
        postUuid: post.postUuid,
      });

      const res = await fetchPostByUUID(fetchPostPayload);

      if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');

      setTotalVotes(res.data.multipleChoice!!.totalVotes as number);
      setNumberOfOptions(res.data.multipleChoice!!.optionCount as number);
      handleUpdatePostStatus(res.data.multipleChoice!!.status!!);
    } catch (err) {
      console.error(err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    fetchOptions();
    fetchPostLatestData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.postUuid]);

  useEffect(() => {
    const socketHandlerOptionCreatedOrUpdated = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.McOptionCreatedOrUpdated.decode(arr);
      if (decoded.option && decoded.postUuid === post.postUuid) {
        setOptions((curr) => {
          const workingArr = [...curr];
          let workingArrUnsorted;
          const idx = workingArr.findIndex((op) => op.id === decoded.option?.id);
          if (idx === -1) {
            workingArrUnsorted = [...workingArr, decoded.option as TMcOptionWithHighestField];
          } else {
            workingArr[idx]
              .voteCount = (decoded.option?.voteCount as number);
            workingArrUnsorted = workingArr;
          }

          return sortOptions(workingArrUnsorted);
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
        setTotalVotes(decoded.post?.multipleChoice?.totalVotes!!);
        setNumberOfOptions(decoded.post?.multipleChoice?.optionCount!!);
      }
    };

    const socketHandlerPostStatus = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PostStatusUpdated.decode(arr);

      console.log(decoded)


      if (!decoded) return;
      if (decoded.postUuid === post.postUuid) {
        handleUpdatePostStatus(decoded.multipleChoice!!);
      }
    };

    if (socketConnection) {
      socketConnection.on('McOptionCreatedOrUpdated', socketHandlerOptionCreatedOrUpdated);
      socketConnection.on('PostUpdated', socketHandlerPostData);
      socketConnection.on('PostStatusUpdated', socketHandlerPostStatus);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('McOptionCreatedOrUpdated', socketHandlerOptionCreatedOrUpdated);
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
          postType="mc"
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
      <PostTopInfo
        postType="mc"
        postId={post.postUuid}
        title={post.title}
        totalVotes={totalVotes}
        creator={post.creator!!}
        startsAtSeconds={post.startsAt?.seconds as number}
        isFollowingDecisionInitial={false}
      />
      <SActivitesContainer>
        <DecisionTabs
          tabs={[
            {
              label: 'options',
              value: 'options',
            },
            {
              label: 'comments',
              value: 'comments',
            },
          ]}
          activeTab={currentTab}
          handleChangeTab={handleChangeTab}
        />
        {currentTab === 'options'
          ? (
            <McOptionsTabModeration
              post={post}
              options={options}
              optionsLoading={optionsLoading}
              pagingToken={optionsNextPageToken}
              minAmount={post.votePrice?.usdCents
                ? (
                  parseInt((post.votePrice?.usdCents / 100).toFixed(0), 10)
                ) : 1}
              handleLoadOptions={fetchOptions}
              handleRemoveOption={handleRemoveOption}
            />
          ) : (
            <CommentsTab
              comments={comments}
              handleGoBack={() => handleChangeTab('options')}
            />
          )}
      </SActivitesContainer>
      {/* Loading Modal */}
      <LoadingModal
        isOpen={loadingModalOpen}
        zIndex={14}
      />
    </SWrapper>
  );
};

PostModerationMC.defaultProps = {
};

export default PostModerationMC;

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
  }

  ${({ theme }) => theme.media.laptop} {
    grid-template-areas:
      'video expires'
      'video title'
      'video activities';
    grid-template-columns: 410px 538px;
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

const SActivitesContainer = styled.div`
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
  }
`;
