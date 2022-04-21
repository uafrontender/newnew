/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';

import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import { fetchPostByUUID } from '../../../api/endpoints/post';
import { fetchPledges } from '../../../api/endpoints/crowdfunding';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';

import GoBackButton from '../../molecules/GoBackButton';
import CommentsTab from '../../molecules/decision/CommentsTab';
import DecisionTabs from '../../molecules/decision/PostTabs';
import PostTimer from '../../molecules/decision/PostTimer';
import ResponseTimer from '../../molecules/decision/ResponseTimer';
import PostVideoModeration from '../../molecules/decision/PostVideoModeration';
import PostTopInfoModeration from '../../molecules/decision/PostTopInfoModeration';
import CfBackersStatsSectionModeration from '../../molecules/decision/crowdfunding/moderation/CfBackersStatsSectionModeration';
import CfCrowdfundingSuccessModeration from '../../molecules/decision/crowdfunding/moderation/CfCrowdfundingSuccessModeration';

import switchPostType from '../../../utils/switchPostType';
import isBrowser from '../../../utils/isBrowser';

import { TPostStatusStringified } from '../../../utils/switchPostStatus';
import HeroPopup from '../../molecules/decision/HeroPopup';
import { setUserTutorialsProgress } from '../../../redux-store/slices/userStateSlice';
import { setTutorialStatus } from '../../../api/endpoints/user';

export type TCfPledgeWithHighestField = newnewapi.Crowdfunding.Pledge & {
  isHighest: boolean;
};

interface IPostModerationCF {
  post: newnewapi.Crowdfunding;
  postStatus: TPostStatusStringified;
  handleGoBack: () => void;
  handleUpdatePostStatus: (postStatus: number | string) => void;
}

const PostModerationCF: React.FunctionComponent<IPostModerationCF> = ({
  post,
  postStatus,
  handleGoBack,
  handleUpdatePostStatus,
}) => {
  const { t } = useTranslation('decision');
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state);
  const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  // Socket
  const socketConnection = useContext(SocketContext);
  const { addChannel, removeChannel } = useContext(ChannelsContext);

  // Tabs
  const [currentTab, setCurrentTab] = useState<'backers' | 'comments'>(() => {
    if (!isBrowser()) {
      return 'backers';
    }
    const { hash } = window.location;
    if (hash && (hash === '#backers' || hash === '#comments')) {
      return hash.substring(1) as 'backers' | 'comments';
    }
    return 'backers';
  });

  const handleChangeTab = (tab: string) => {
    if (tab === 'comments' && isMobile) {
      window.history.pushState(
        {
          postId: post.postUuid,
        },
        'Post',
        `/post/${post.postUuid}#${tab}`
      );
    } else {
      window.history.replaceState(
        {
          postId: post.postUuid,
        },
        'Post',
        `/post/${post.postUuid}#${tab}`
      );
    }
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

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
    };

    window.addEventListener('hashchange', handleHashChange, false);

    return () => {
      window.removeEventListener('hashchange', handleHashChange, false);
    };
  }, []);

  // Current backers
  const [currentBackers, setCurrentBackers] = useState(
    post.currentBackerCount ?? 0
  );
  const crowdfundingSuccess = useMemo(() => {
    return currentBackers >= post.targetBackerCount;
  }, [post, currentBackers]);

  // Pledges
  const [pledges, setPledges] = useState<TCfPledgeWithHighestField[]>([]);
  const [pledgesNextPageToken, setPledgesNextPageToken] =
    useState<string | undefined | null>('');
  const [pledgesLoading, setPledgesLoading] = useState(false);
  const [loadingPledgesError, setLoadingPledgesError] = useState('');

  // Respone upload
  const [responseFreshlyUploaded, setResponseFreshlyUploaded] =
    useState<newnewapi.IVideoUrls | undefined>(undefined);

  const handleToggleMutedMode = useCallback(() => {
    dispatch(toggleMutedMode(''));
  }, [dispatch]);

  const sortPleges = useCallback(
    (unsortedArr: TCfPledgeWithHighestField[]) => {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < unsortedArr.length; i++) {
        // eslint-disable-next-line no-param-reassign
        unsortedArr[i].isHighest = false;
      }

      const highestPledge = unsortedArr.sort(
        (a, b) =>
          (b?.amount?.usdCents as number) - (a?.amount?.usdCents as number)
      )[0];

      const pledgesByUser = user.userData?.userUuid
        ? unsortedArr
            .filter((o) => o.creator?.uuid === user.userData?.userUuid)
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
        ...(highestPledge &&
        highestPledge.creator?.uuid === user.userData?.userUuid
          ? [highestPledge]
          : []),
        ...pledgesByUser,
        // ...pledgesByVipUsers,
        ...(highestPledge &&
        highestPledge.creator?.uuid !== user.userData?.userUuid
          ? [highestPledge]
          : []),
        ...workingArrSorted,
      ];

      const workingSortedUnique =
        joinedArr.length > 0 ? [...new Set(joinedArr)] : [];

      const highestPledgeIdx = (
        workingSortedUnique as TCfPledgeWithHighestField[]
      ).findIndex((o) => o.id === highestPledge.id);

      if (workingSortedUnique[highestPledgeIdx]) {
        workingSortedUnique[highestPledgeIdx].isHighest = true;
      }

      return workingSortedUnique;
    },
    [user.userData?.userUuid]
  );

  const fetchPledgesForPost = useCallback(
    async (pageToken?: string) => {
      if (pledgesLoading) return;
      try {
        setPledgesLoading(true);
        setLoadingPledgesError('');

        const getCurrentPledgesPayload = new newnewapi.GetPledgesRequest({
          postUuid: post.postUuid,
          ...(pageToken
            ? {
                paging: {
                  pageToken,
                },
              }
            : {}),
        });

        const res = await fetchPledges(getCurrentPledgesPayload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        if (res.data && res.data.pledges) {
          setPledges((curr) => {
            const workingArr = [
              ...curr,
              ...(res.data?.pledges as TCfPledgeWithHighestField[]),
            ];
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
    },
    [pledgesLoading, setPledges, sortPleges, post]
  );

  const fetchPostLatestData = useCallback(async () => {
    try {
      const fetchPostPayload = new newnewapi.GetPostRequest({
        postUuid: post.postUuid,
      });

      const res = await fetchPostByUUID(fetchPostPayload);

      if (!res.data || res.error)
        throw new Error(res.error?.message ?? 'Request failed');

      setCurrentBackers(res.data.crowdfunding!!.currentBackerCount as number);
      handleUpdatePostStatus(res.data.crowdfunding!!.status!!);
    } catch (err) {
      console.error(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Increment channel subs after mounting
  // Decrement when unmounting
  useEffect(() => {
    addChannel(post.postUuid, {
      postUpdates: {
        postUuid: post.postUuid,
      },
    });

    return () => {
      removeChannel(post.postUuid);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPledges([]);
    setPledgesNextPageToken('');
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
          const idx = workingArr.findIndex(
            (op) => op.id === decoded.pledge?.id
          );
          if (idx === -1) {
            workingArrUnsorted = [
              ...workingArr,
              decoded.pledge as TCfPledgeWithHighestField,
            ];
          } else {
            workingArr[idx].amount!!.usdCents = decoded.pledge?.amount
              ?.usdCents as number;
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
      const [decodedParsed] = switchPostType(decoded.post as newnewapi.IPost);
      if (decodedParsed.postUuid === post.postUuid) {
        setCurrentBackers(decoded.post?.crowdfunding?.currentBackerCount!!);
      }
    };

    const socketHandlerPostStatus = (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.PostStatusUpdated.decode(arr);

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
  }, [socketConnection, post, setPledges, sortPleges]);

  const goToNextStep = () => {
    if (user.loggedIn) {
      const payload = new newnewapi.SetTutorialStatusRequest({
        cfCurrentStep: user.userTutorialsProgress.remainingCfSteps!![1],
      });
      setTutorialStatus(payload);
    }
    dispatch(
      setUserTutorialsProgress({
        remainingCfSteps: [
          ...user.userTutorialsProgress.remainingCfSteps!!,
        ].slice(1),
      })
    );
  };

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
        {postStatus === 'waiting_for_response' ? (
          <ResponseTimer
            timestampSeconds={new Date(
              (post.responseUploadDeadline?.seconds as number) * 1000
            ).getTime()}
          />
        ) : (
          <PostTimer
            timestampSeconds={new Date(
              (post.expiresAt?.seconds as number) * 1000
            ).getTime()}
            postType="cf"
          />
        )}
      </SExpiresSection>
      <PostVideoModeration
        postId={post.postUuid}
        announcement={post.announcement!!}
        response={(post.response || responseFreshlyUploaded) ?? undefined}
        postStatus={postStatus}
        isMuted={mutedMode}
        handleToggleMuted={() => handleToggleMutedMode()}
        handleUpdateResponseVideo={(newValue) =>
          setResponseFreshlyUploaded(newValue)
        }
      />
      <PostTopInfoModeration
        postType="cf"
        postStatus={postStatus}
        title={post.title}
        postId={post.postUuid}
        handleUpdatePostStatus={handleUpdatePostStatus}
      />
      <SActivitesContainer>
        <DecisionTabs
          tabs={[
            {
              label: 'backers',
              value: 'backers',
            },
            ...(post.isCommentsAllowed
              ? [
                  {
                    label: 'comments',
                    value: 'comments',
                  },
                ]
              : []),
          ]}
          activeTab={currentTab}
          handleChangeTab={handleChangeTab}
        />
        {currentTab === 'backers' ? (
          !crowdfundingSuccess ? (
            <CfBackersStatsSectionModeration
              targetBackerCount={post.targetBackerCount}
              currentNumBackers={currentBackers}
            />
          ) : (
            <CfCrowdfundingSuccessModeration
              post={post}
              postStatus={postStatus}
              currentNumBackers={currentBackers}
            />
          )
        ) : post.isCommentsAllowed ? (
          <CommentsTab
            canDeleteComments={post.creator?.uuid === user.userData?.userUuid}
            commentsRoomId={post.commentsRoomId as number}
            handleGoBack={() => handleChangeTab('backers')}
          />
        ) : null}
      </SActivitesContainer>
      <HeroPopup
        isPopupVisible={
          user!!.userTutorialsProgress.remainingCfSteps!![0] ===
          newnewapi.CfTutorialStep.CF_HERO
        }
        postType="CF"
        closeModal={goToNextStep}
      />
    </SWrapper>
  );
};

PostModerationCF.defaultProps = {};

export default PostModerationCF;

const SWrapper = styled.div`
  width: 100%;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    height: 648px;

    display: grid;
    grid-template-areas:
      'expires expires'
      'title title'
      'video activities';
    grid-template-columns: 284px 1fr;
    grid-template-rows: max-content max-content minmax(0, 1fr);

    grid-column-gap: 16px;

    align-items: flex-start;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 728px;

    grid-template-areas:
      'video expires'
      'video title'
      'video activities';
    grid-template-columns: 410px 1fr;
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
`;
