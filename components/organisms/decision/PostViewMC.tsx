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
import { fetchCurrentOptionsForMCPost } from '../../../api/endpoints/multiple_choice';
import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import CommentsTab from '../../molecules/decision/CommentsTab';
import McOptionsTab from '../../molecules/decision/multiple_choice/McOptionsTab';
import PostTopInfo from '../../molecules/decision/PostTopInfo';
import switchPostType from '../../../utils/switchPostType';
import { fetchPostByUUID, markPost } from '../../../api/endpoints/post';

// Temp
const MockVideo = '/video/mock/mock_video_1.mp4';

export type TMcOptionWithHighestField = newnewapi.MultipleChoice.Option & {
  isHighest: boolean;
};

interface IPostViewMC {
  post: newnewapi.MultipleChoice;
  handleGoBack: () => void;
}

const PostViewMC: React.FunctionComponent<IPostViewMC> = ({
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
  const {
    channelsWithSubs,
    addChannel,
    removeChannel,
  } = useContext(ChannelsContext);

  // Tabs
  const [currentTab, setCurrentTab] = useState<
    'options' | 'comments'
  >('options');

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
      ? unsortedArr.filter((o) => o.isSupportedByUser)
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

      console.log(res.data);

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

  const handleAddOrUpdateOptionFromResponse = useCallback((
    newOrUpdatedption: newnewapi.MultipleChoice.Option,
  ) => {
    setOptions((curr) => {
      const workingArr = [...curr];
      let workingArrUnsorted;
      const idx = workingArr.findIndex((op) => op.id === newOrUpdatedption.id);
      if (idx === -1) {
        workingArrUnsorted = [...workingArr, newOrUpdatedption as TMcOptionWithHighestField];
      } else {
        workingArr[idx]
          .voteCount = (newOrUpdatedption.voteCount as number);
        workingArr[idx]
          .isSupportedByUser = true;
        workingArrUnsorted = workingArr;
      }

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
    } catch (err) {
      console.error(err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Increment channel subs after mounting
  // Decrement when unmounting
  useEffect(() => {
    addChannel(post.postUuid);

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

    if (socketConnection) {
      socketConnection.on('McOptionCreatedOrUpdated', socketHandlerOptionCreatedOrUpdated);
      socketConnection.on('PostUpdated', socketHandlerPostData);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('McOptionCreatedOrUpdated', socketHandlerOptionCreatedOrUpdated);
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
          postType="mc"
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
        videoSrc={post.announcement?.originalVideoUrl ?? MockVideo}
        isMuted={mutedMode}
        handleToggleMuted={() => handleToggleMutedMode()}
      />
      <div
        style={{
          gridArea: 'title',
        }}
      >
        <PostTitle>
          { post.title }
        </PostTitle>
      </div>
      <SActivitesContainer>
        <PostTopInfo
          postType="mc"
          // Temp
          totalVotes={totalVotes}
          creator={post.creator!!}
          startsAtSeconds={post.startsAt?.seconds as number}
          handleFollowCreator={() => {}}
          handleFollowDecision={() => {}}
          handleReportAnnouncement={() => {}}
        />
        <DecisionTabs
          tabs={[
            {
              label: 'options',
              value: 'options',
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
        {currentTab === 'options'
          ? (
            <McOptionsTab
              post={post}
              options={options}
              optionsLoading={optionsLoading}
              pagingToken={optionsNextPageToken}
              minAmount={post.votePrice?.usdCents
                ? (
                  parseInt((post.votePrice?.usdCents / 100).toFixed(0), 10)
                ) : 1}
              handleLoadOptions={fetchOptions}
              handleAddOrUpdateOptionFromResponse={handleAddOrUpdateOptionFromResponse}
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

export default PostViewMC;

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
