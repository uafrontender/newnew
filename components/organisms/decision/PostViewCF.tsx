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
import { ChannelsContext } from '../../../contexts/channelsContext';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';
import { fetchPostByUUID, markPost } from '../../../api/endpoints/post';
import { doPledgeCrowdfunding, fetchPledgeLevels, fetchPledges } from '../../../api/endpoints/crowdfunding';

import PostVideo from '../../molecules/decision/PostVideo';
import PostTitle from '../../molecules/decision/PostTitle';
import PostTimer from '../../molecules/decision/PostTimer';
import PostTopInfo from '../../molecules/decision/PostTopInfo';
import DecisionTabs from '../../molecules/decision/PostTabs';
import CommentsTab from '../../molecules/decision/CommentsTab';
import CfPledgesSection from '../../molecules/decision/crowdfunding/CfPledgesSection';
import CfPledgeLevelsSection from '../../molecules/decision/crowdfunding/CfPledgeLevelsSection';
import GoBackButton from '../../molecules/GoBackButton';
import LoadingModal from '../../molecules/LoadingModal';
import InlineSvg from '../../atoms/InlineSVG';

// Icons
import CancelIcon from '../../../public/images/svg/icons/outlined/Close.svg';

// Utils
import isBrowser from '../../../utils/isBrowser';
import switchPostType from '../../../utils/switchPostType';
import CfBackersStatsSection from '../../molecules/decision/crowdfunding/CfBackersStatsSection';
import Button from '../../atoms/Button';
import CfPledgeLevelsModal from '../../molecules/decision/crowdfunding/CfPledgeLevelsModal';
import { TPostStatusStringified } from '../../../utils/switchPostStatus';
import CfCrowdfundingSuccess from '../../molecules/decision/crowdfunding/CfCrowdfundingSuccess';

export type TCfPledgeWithHighestField = newnewapi.Crowdfunding.Pledge & {
  isHighest: boolean;
};

interface IPostViewCF {
  post: newnewapi.Crowdfunding;
  postStatus: TPostStatusStringified;
  sessionId?: string;
  handleGoBack: () => void;
  handleUpdatePostStatus: (postStatus: number | string) => void;
}

const PostViewCF: React.FunctionComponent<IPostViewCF> = ({
  post,
  postStatus,
  sessionId,
  handleGoBack,
  handleUpdatePostStatus,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('decision');
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state);
  const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [heightDelta, setHeightDelta] = useState( isMobile ? 0 : 256);

  // Socket
  const socketConnection = useContext(SocketContext);
  const {
    channelsWithSubs,
    addChannel,
    removeChannel,
  } = useContext(ChannelsContext);

  // Tabs
  const [currentTab, setCurrentTab] = useState<'backers' | 'comments'>(() => {
    if (!isBrowser()) {
      return 'backers'
    }
    const { hash } = window.location;
    if (hash && (hash === '#backers' || hash === '#comments')) {
      return hash.substring(1) as 'backers' | 'comments';
    }
    return 'backers';
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
        setCurrentTab('backers');
        return;
      }
      const parsedHash = hash.substring(1);
      if (parsedHash === 'backers' || parsedHash === 'comments') {
        setCurrentTab(parsedHash);
      }
    }

    window.addEventListener('hashchange', handleHashChange, false);

    return () => {
      window.removeEventListener('hashchange', handleHashChange, false);
    }
  }, []);

  // Vote from sessionId
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);

  // Current backers
  const [currentBackers, setCurrentBackers] = useState(post.currentBackerCount ?? 0);

  // Pledge levels
  const [pledgeLevels, setPledgeLevels] = useState<newnewapi.IMoneyAmount[]>([]);
  const [pledgeLevelsLoading, setPledgeLevelsLoading] = useState(false);
  const [loadingPledgeLevelsError, setLoadingPledgeLevelsError] = useState('');

  // Pledges
  const [pledges, setPledges] = useState<TCfPledgeWithHighestField[]>([]);
  const [pledgesNextPageToken, setPledgesNextPageToken] = useState<string | undefined | null>('');
  const [pledgesLoading, setPledgesLoading] = useState(false);
  const [loadingPledgesError, setLoadingPledgesError] = useState('');

  // Mobile choose pledge modal
  const [choosePledgeModalOpen, setChoosePledgeModalOpen] = useState(false);

  // Comments
  const [comments, setComments] = useState<any[]>([]);
  const [commentsNextPageToken, setCommentsNextPageToken] = useState<string | undefined | null>('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [loadingCommentsError, setLoadingCommentsError] = useState('');

  const handleToggleMutedMode = useCallback(() => {
    dispatch(toggleMutedMode(''));
  }, [dispatch]);

  const sortPleges = useCallback((unsortedArr: TCfPledgeWithHighestField[]) => {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < unsortedArr.length; i++) {
      // eslint-disable-next-line no-param-reassign
      unsortedArr[i].isHighest = false;
    }

    const highestPledge = unsortedArr.sort((a, b) => (
      (b?.amount?.usdCents as number) - (a?.amount?.usdCents as number)
    ))[0];

    const pledgesByUser = user.userData?.userUuid
      ? unsortedArr.filter((o) => o.creator?.uuid === user.userData?.userUuid)
        .sort((a, b) => {
          // Sort by newest first
          return (b.id as number) - (a.id as number);
        })
      : [];

    // const pledgesByVipUsers = [];

    const workingArrSorted = unsortedArr.sort((a, b) => {
      // Sort the rest by newest first
      return (b.id as number) - (a.id as number);
    });

    const joinedArr = [
      ...(
        highestPledge
        && highestPledge.creator?.uuid === user.userData?.userUuid ? [highestPledge] : []),
      ...pledgesByUser,
      // ...pledgesByVipUsers,
      ...(
        highestPledge
        && highestPledge.creator?.uuid !== user.userData?.userUuid ? [highestPledge] : []),
      ...workingArrSorted,
    ];

    const workingSortedUnique = joinedArr.length > 0
      ? [...new Set(joinedArr)] : [];

    const highestPledgeIdx = (
      workingSortedUnique as TCfPledgeWithHighestField[]
    ).findIndex((o) => o.id === highestPledge.id);

    if (workingSortedUnique[highestPledgeIdx]) {
      workingSortedUnique[highestPledgeIdx].isHighest = true;
    }

    return workingSortedUnique;
  }, [user.userData?.userUuid]);

  const fetchPledgeLevelsForPost = useCallback(async () => {
    try {
      setPledgeLevelsLoading(true);
      setLoadingPledgeLevelsError('');

      const fetchPledgeLevelsPayload = new newnewapi.EmptyRequest({});

      const res = await fetchPledgeLevels(fetchPledgeLevelsPayload);

      if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');

      setPledgeLevels(res.data.amounts);

      setPledgeLevelsLoading(false);
    } catch (err) {
      console.error(err);
      setPledgeLevelsLoading(false);
      setLoadingPledgeLevelsError((err as Error).message);
    }
  }, []);

  const fetchPledgesForPost = useCallback(async (
    pageToken?: string,
  ) => {
    if (pledgesLoading) return;
    try {
      setPledgesLoading(true);
      setLoadingPledgesError('');

      const getCurrentPledgesPayload = new newnewapi.GetPledgesRequest({
        postUuid: post.postUuid,
        ...(pageToken ? {
          paging: {
            pageToken,
          },
        } : {}),
      });

      const res = await fetchPledges(getCurrentPledgesPayload);

      if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');

      if (res.data && res.data.pledges) {
        setPledges((curr) => {
          const workingArr = [...curr, ...res.data?.pledges as TCfPledgeWithHighestField[]];
          const workingArrUnsorted = [...workingArr];

          return sortPleges(workingArrUnsorted);
        });
        setPledgesNextPageToken(res.data.paging?.nextPageToken);
      }

      setPledgesLoading(false);
    } catch (err) {
      setPledgesLoading(false);
      setLoadingPledgesError((err as Error).message);
      console.error(err);
    }
  }, [
    pledgesLoading,
    setPledges,
    sortPleges,
    post,
  ]);

  const handleAddPledgeFromResponse = useCallback((newPledge: newnewapi.Crowdfunding.Pledge) => {
    setPledges((curr) => {
      const workingArrUnsorted = [...curr, newPledge as TCfPledgeWithHighestField];
      return sortPleges(workingArrUnsorted);
    });
  }, [
    setPledges,
    sortPleges,
  ]);

  const fetchPostLatestData = useCallback(async () => {
    try {
      const fetchPostPayload = new newnewapi.GetPostRequest({
        postUuid: post.postUuid,
      });

      const res = await fetchPostByUUID(fetchPostPayload);

      if (!res.data || res.error) throw new Error(res.error?.message ?? 'Request failed');

      setCurrentBackers(res.data.crowdfunding!!.currentBackerCount as number);
      handleUpdatePostStatus(res.data.crowdfunding!!.status!!);
    } catch (err) {
      console.error(err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render functions
  const renderBackersSection = useCallback(() => {
    switch(postStatus) {
      case 'voting': {
        return (
          <>
          <CfBackersStatsSection
            post={post}
            currentNumBackers={currentBackers}
          />
          {!isMobile ? (
            <CfPledgeLevelsSection
              post={post}
              pledgeLevels={pledgeLevels}
              handleAddPledgeFromResponse={handleAddPledgeFromResponse}
            />
          ) : null }
        </>
        );
      }
      case 'waiting_for_response': {
        return (
          <>
            <CfCrowdfundingSuccess
              post={post}
              currentNumBackers={currentBackers}
            />
            <SNotifyMeSection>
              notify me
            </SNotifyMeSection>
          </>
        );
      }
      case 'succeeded': {
        return (
          <>
            <CfCrowdfundingSuccess
              post={post}
              currentNumBackers={currentBackers}
            />
            <SSeeMoreSection>
              see more
            </SSeeMoreSection>
          </>
        );
      }
      default: {
        // return null;
        <>
        <CfCrowdfundingSuccess
          post={post}
          currentNumBackers={currentBackers}
        />

      </>
      }
    }

    return null;
  }, [
    currentBackers,
    handleAddPledgeFromResponse,
    isMobile,
    pledgeLevels,
    post,
    postStatus,
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
    setPledges([]);
    setPledgesNextPageToken('');
    fetchPledgeLevelsForPost();
    fetchPledgesForPost();
    fetchPostLatestData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.postUuid]);

  useEffect(() => {
    const makePledgeFromSessionId = async () => {
      if (!sessionId) return;
      try {
        setLoadingModalOpen(true);
        const payload = new newnewapi.FulfillPaymentPurposeRequest({
          paymentSuccessUrl: `session_id=${sessionId}`,
        });

        const res = await doPledgeCrowdfunding(payload);

        if (!res.data
          || res.data.status !== newnewapi.DoPledgeResponse.Status.SUCCESS
          || res.error
        ) throw new Error(res.error?.message ?? 'Request failed');

        handleAddPledgeFromResponse(res.data.pledge as newnewapi.Crowdfunding.Pledge);
        setLoadingModalOpen(false);
      } catch (err) {
        console.error(err);
        setLoadingModalOpen(false);
      }
    };

    makePledgeFromSessionId();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const socketHandlerPledgeCreated = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.CfPledgeCreated.decode(arr);
      if (decoded.pledge && decoded.postUuid === post.postUuid) {
        if (decoded.pledge.creator?.uuid === user.userData?.userUuid) return;
        setPledges((curr) => {
          const workingArr = [...curr];
          let workingArrUnsorted;
          const idx = workingArr.findIndex((op) => op.id === decoded.pledge?.id);
          if (idx === -1) {
            workingArrUnsorted = [...workingArr, decoded.pledge as TCfPledgeWithHighestField];
          } else {
            workingArr[idx]
              .amount!!.usdCents = (decoded.pledge?.amount?.usdCents as number);
            workingArrUnsorted = workingArr;
          }

          return sortPleges(workingArrUnsorted);
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
        setCurrentBackers(decoded.post?.crowdfunding?.currentBackerCount!!);
      }
    };

    const socketHandlerPostStatus = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PostStatusUpdated.decode(arr);

      console.log(decoded)

      if (!decoded) return;
      if (decoded.postUuid === post.postUuid) {
        handleUpdatePostStatus(decoded.crowdfunding!!);
      }
    };

    if (socketConnection) {
      socketConnection.on('CfPledgeCreated', socketHandlerPledgeCreated);
      socketConnection.on('PostUpdated', socketHandlerPostData);
      socketConnection.on('PostStatusUpdated', socketHandlerPostStatus);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('CfPledgeCreated', socketHandlerPledgeCreated);
        socketConnection.off('PostUpdated', socketHandlerPostData);
        socketConnection.off('PostStatusUpdated', socketHandlerPostStatus);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    socketConnection,
    post,
    setPledges,
    sortPleges,
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
          postType="cf"
        />
      </SExpiresSection>
      <PostVideo
        postId={post.postUuid}
        announcement={post.announcement!!}
        isMuted={mutedMode}
        handleToggleMuted={() => handleToggleMutedMode()}
      />
      <PostTopInfo
        postType="cf"
        postId={post.postUuid}
        postStatus={postStatus}
        title={post.title}
        creator={post.creator!!}
        startsAtSeconds={post.startsAt?.seconds as number}
        isFollowingDecisionInitial={post.isFavoritedByMe ?? false}
      />
      <SActivitesContainer>
        <DecisionTabs
          tabs={[
            {
              label: 'backers',
              value: 'backers',
            },
            {
              label: 'comments',
              value: 'comments',
            },
          ]}
          activeTab={currentTab}
          handleChangeTab={handleChangeTab}
        />
        {currentTab === 'backers' ? (
          renderBackersSection()
        ) : (
          <CommentsTab
            comments={comments}
            handleGoBack={() => handleChangeTab('backers')}
          />
        )
      }
      </SActivitesContainer>
      {/* Loading Modal */}
      <LoadingModal
        isOpen={loadingModalOpen}
        zIndex={14}
      />
      {/* Choose pledge mobile modal */}
      {isMobile ? (
        <CfPledgeLevelsModal
          zIndex={11}
          post={post}
          pledgeLevels={pledgeLevels}
          isOpen={choosePledgeModalOpen}
          handleAddPledgeFromResponse={handleAddPledgeFromResponse}
          onClose={() => setChoosePledgeModalOpen(false)}
        />
      ) : null}
      {/* Mobile floating button */}
      {isMobile && !choosePledgeModalOpen ? (
        <SActionButton
          view="primaryGrad"
          onClick={() => setChoosePledgeModalOpen(true)}
        >
          { t('CfPost.FloatingActionButton.choosePledgeBtn') }
        </SActionButton>
      ) : null}
    </SWrapper>
  );
};

PostViewCF.defaultProps = {
  sessionId: undefined,
};

export default PostViewCF;

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

const SActionButton = styled(Button)`
  position: fixed;
  z-index: 2;

  width: calc(100% - 32px);
  bottom: 16px;
  left: 16px;
`;

const SActivitesContainer = styled.div`
  grid-area: activities;

  /* display: flex; */
  flex-direction: column;

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

// Notify me
const SNotifyMeSection = styled.div`

`;

// See more
const SSeeMoreSection = styled.div`

`;
