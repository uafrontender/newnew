/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, {
  useCallback, useContext, useEffect, useRef, useState,
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
import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import { doPledgeCrowdfunding, fetchPledgeLevels, fetchPledges } from '../../../api/endpoints/crowdfunding';
import { fetchPostByUUID, markPost } from '../../../api/endpoints/post';
import switchPostType from '../../../utils/switchPostType';
import PostTopInfo from '../../molecules/decision/PostTopInfo';
import CfPledgesSection from '../../molecules/decision/crowdfunding/CfPledgesSection';
import CfPledgeLevelsSection from '../../molecules/decision/crowdfunding/CfPledgeLevelsSection';
import LoadingModal from '../../molecules/LoadingModal';
import isBrowser from '../../../utils/isBrowser';
import CommentsTab from '../../molecules/decision/CommentsTab';
import DecisionTabs from '../../molecules/decision/PostTabs';

export type TCfPledgeWithHighestField = newnewapi.Crowdfunding.Pledge & {
  isHighest: boolean;
};

interface IPostModerationCF {
  post: newnewapi.Crowdfunding;
  handleGoBack: () => void;
}

const PostModerationCF: React.FunctionComponent<IPostModerationCF> = ({
  post,
  handleGoBack,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state);
  const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);

  const [heightDelta, setHeightDelta] = useState(256);

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
    window.history.replaceState(post.postUuid, 'Post', `/?post=${post.postUuid}#${tab}`);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }

  useEffect(() => {
    const handleHashChange = () => {
      const { hash } = window.location;
      console.log(hash)
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
    setPledges([]);
    setPledgesNextPageToken('');
    fetchPledgeLevelsForPost();
    fetchPledgesForPost();
    fetchPostLatestData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.postUuid]);

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

    if (socketConnection) {
      socketConnection.on('CfPledgeCreated', socketHandlerPledgeCreated);
      socketConnection.on('PostUpdated', socketHandlerPostData);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('CfPledgeCreated', socketHandlerPledgeCreated);
        socketConnection.off('PostUpdated', socketHandlerPostData);
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
          <GoBackButton
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
        <PostTitle>
          { post.title }
        </PostTitle>
      </div>
      <SActivitesContainer>
        <PostTopInfo
          postId={post.postUuid}
          postType="cf"
          currentBackers={currentBackers}
          targetBackers={post.targetBackerCount}
          creator={post.creator!!}
          startsAtSeconds={post.startsAt?.seconds as number}
          handleFollowCreator={() => {}}
          handleReportAnnouncement={() => {}}
        />
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
          <CfPledgesSection
            pledges={pledges}
            pagingToken={pledgesNextPageToken}
            pledgesLoading={pledgesLoading}
            post={post}
            heightDelta={heightDelta ?? 256}
            handleLoadPledges={fetchPledgesForPost}
          />
        ) : (
          <CommentsTab
            comments={comments}
          />
        )
      }
      </SActivitesContainer>
      {/* Loading Modal */}
      <LoadingModal
        isOpen={loadingModalOpen}
        zIndex={14}
      />
    </SWrapper>
  );
};

PostModerationCF.defaultProps = {
};

export default PostModerationCF;

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
