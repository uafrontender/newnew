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
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'next-i18next';

import { SocketContext } from '../../../contexts/socketContext';
import { ChannelsContext } from '../../../contexts/channelsContext';
import { fetchPostByUUID } from '../../../api/endpoints/post';
import { fetchPledges } from '../../../api/endpoints/crowdfunding';
import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';

import Headline from '../../atoms/Headline';
import PostVotingTab from '../../molecules/decision/PostVotingTab';
import CommentsBottomSection from '../../molecules/decision/success/CommentsBottomSection';
import PostVideoModeration from '../../molecules/decision/PostVideoModeration';
import PostTopInfoModeration from '../../molecules/decision/PostTopInfoModeration';

import switchPostStatus, {
  TPostStatusStringified,
} from '../../../utils/switchPostStatus';
import switchPostType from '../../../utils/switchPostType';
import { setUserTutorialsProgress } from '../../../redux-store/slices/userStateSlice';
import { markTutorialStepAsCompleted } from '../../../api/endpoints/user';
import useSynchronizedHistory from '../../../utils/hooks/useSynchronizedHistory';
import useResponseUpload from '../../../utils/hooks/useResponseUpload';
import PostResponseTabModeration from '../../molecules/decision/PostResponseTabModeration';
import { formatNumber } from '../../../utils/format';
import Text from '../../atoms/Text';

const GoBackButton = dynamic(() => import('../../molecules/GoBackButton'));
const CommentsTab = dynamic(
  () => import('../../molecules/decision/CommentsTab')
);
const ResponseTimer = dynamic(
  () => import('../../molecules/decision/ResponseTimer')
);
const PostTimer = dynamic(() => import('../../molecules/decision/PostTimer'));
const CfBackersStatsSectionModeration = dynamic(
  () =>
    import(
      '../../molecules/decision/crowdfunding/moderation/CfBackersStatsSectionModeration'
    )
);
const CfCrowdfundingSuccessModeration = dynamic(
  () =>
    import(
      '../../molecules/decision/crowdfunding/moderation/CfCrowdfundingSuccessModeration'
    )
);
const CfBackersStatsSectionModerationFailed = dynamic(
  () =>
    import(
      '../../molecules/decision/crowdfunding/moderation/CfBackersStatsSectionModerationFailed'
    )
);
const HeroPopup = dynamic(() => import('../../molecules/decision/HeroPopup'));

export type TCfPledgeWithHighestField = newnewapi.Crowdfunding.Pledge & {
  isHighest: boolean;
};

interface IPostModerationCF {
  post: newnewapi.Crowdfunding;
  postStatus: TPostStatusStringified;
  handleUpdatePostStatus: (postStatus: number | string) => void;
  handleRemovePostFromState: () => void;
  handleGoBack: () => void;
}

const PostModerationCF: React.FunctionComponent<IPostModerationCF> = React.memo(
  ({
    post,
    postStatus,
    handleUpdatePostStatus,
    handleGoBack,
    handleRemovePostFromState,
  }) => {
    const router = useRouter();
    const { t } = useTranslation('modal-Post');
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state);
    const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const { syncedHistoryReplaceState } = useSynchronizedHistory();

    // Socket
    const socketConnection = useContext(SocketContext);
    const { addChannel, removeChannel } = useContext(ChannelsContext);

    // Comments
    const { ref: commentsSectionRef, inView } = useInView({
      threshold: 0.8,
    });

    const handleCommentFocus = () => {
      if (isMobile && !!document.getElementById('action-button-mobile')) {
        document.getElementById('action-button-mobile')!!.style.display =
          'none';
      }
    };

    const handleCommentBlur = () => {
      if (isMobile && !!document.getElementById('action-button-mobile')) {
        document.getElementById('action-button-mobile')!!.style.display = '';
      }
    };

    // Total amount
    const [totalAmount, setTotalAmount] = useState<
      newnewapi.MoneyAmount | undefined
    >((post?.totalAmount as newnewapi.MoneyAmount) || undefined);

    // Current backers
    const [currentBackers, setCurrentBackers] = useState(
      post.currentBackerCount ?? 0
    );

    // Pledges
    const [pledges, setPledges] = useState<TCfPledgeWithHighestField[]>([]);
    const [pledgesNextPageToken, setPledgesNextPageToken] =
      useState<string | undefined | null>('');
    const [pledgesLoading, setPledgesLoading] = useState(false);
    const [loadingPledgesError, setLoadingPledgesError] = useState('');

    // Response upload
    const [responseFreshlyUploaded, setResponseFreshlyUploaded] =
      useState<newnewapi.IVideoUrls | undefined>(undefined);

    // Tabs
    const [openedTab, setOpenedTab] = useState<'announcement' | 'response'>(
      post.response ||
        responseFreshlyUploaded ||
        postStatus === 'waiting_for_response' ||
        postStatus === 'processing_response'
        ? 'response'
        : 'announcement'
    );

    const {
      handleCancelVideoUpload,
      handleItemChange,
      handleResetVideoUploadAndProcessingState,
      handleUploadVideoNotProcessed,
      handleUploadVideoProcessed,
      handleVideoDelete,
      responseFileProcessingETA,
      responseFileProcessingError,
      responseFileProcessingLoading,
      responseFileProcessingProgress,
      responseFileUploadETA,
      responseFileUploadError,
      responseFileUploadLoading,
      responseFileUploadProgress,
      uploadedResponseVideoUrl,
      videoProcessing,
      responseUploading,
      responseUploadSuccess,
    } = useResponseUpload({
      postId: post.postUuid,
      postStatus,
      openedTab,
      handleUpdatePostStatus,
      handleUpdateResponseVideo: (newValue) =>
        setResponseFreshlyUploaded(newValue),
    });

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

        if (res.data.crowdfunding) {
          setCurrentBackers(res.data.crowdfunding.currentBackerCount as number);
          if (res.data.crowdfunding.status)
            handleUpdatePostStatus(res.data.crowdfunding.status);
          if (res.data.crowdfunding.totalAmount) {
            setTotalAmount(
              res.data.crowdfunding.totalAmount as newnewapi.MoneyAmount
            );
          }
        }
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
          if (decoded.post?.crowdfunding?.currentBackerCount)
            setCurrentBackers(decoded.post?.crowdfunding?.currentBackerCount);
          if (decoded.post?.crowdfunding?.totalAmount) {
            setTotalAmount(
              decoded.post?.crowdfunding.totalAmount as newnewapi.MoneyAmount
            );
          }
          if (
            !responseFreshlyUploaded &&
            decoded.post?.crowdfunding?.response
          ) {
            setResponseFreshlyUploaded(decoded.post.crowdfunding.response);
          }
        }
      };

      const socketHandlerPostStatus = async (data: any) => {
        const arr = new Uint8Array(data);
        const decoded = newnewapi.PostStatusUpdated.decode(arr);

        if (!decoded) return;
        if (decoded.postUuid === post.postUuid && decoded.crowdfunding) {
          handleUpdatePostStatus(decoded.crowdfunding);

          if (
            !responseFreshlyUploaded &&
            postStatus === 'processing_response' &&
            switchPostStatus('cf', decoded.crowdfunding) === 'succeeded'
          ) {
            const fetchPostPayload = new newnewapi.GetPostRequest({
              postUuid: post.postUuid,
            });

            const res = await fetchPostByUUID(fetchPostPayload);

            if (res.data?.crowdfunding?.response) {
              setResponseFreshlyUploaded(res.data?.crowdfunding?.response);
            }
          }
        }
      };

      if (socketConnection) {
        socketConnection?.on('CfPledgeCreated', socketHandlerPledgeCreated);
        socketConnection?.on('PostUpdated', socketHandlerPostData);
        socketConnection?.on('PostStatusUpdated', socketHandlerPostStatus);
      }

      return () => {
        if (socketConnection && socketConnection?.connected) {
          socketConnection?.off('CfPledgeCreated', socketHandlerPledgeCreated);
          socketConnection?.off('PostUpdated', socketHandlerPostData);
          socketConnection?.off('PostStatusUpdated', socketHandlerPostStatus);
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socketConnection, post, postStatus, setPledges, sortPleges]);

    const goToNextStep = () => {
      if (
        user.userTutorialsProgress.remainingCfSteps &&
        user.userTutorialsProgress.remainingCfSteps[0]
      ) {
        if (user.loggedIn) {
          const payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
            cfCurrentStep: user.userTutorialsProgress.remainingCfSteps[0],
          });
          markTutorialStepAsCompleted(payload);
        }
        dispatch(
          setUserTutorialsProgress({
            remainingCfSteps: [
              ...user.userTutorialsProgress.remainingCfSteps,
            ].slice(1),
          })
        );
      }
    };

    const [isPopupVisible, setIsPopupVisible] = useState(false);
    useEffect(() => {
      if (
        user.userTutorialsProgressSynced &&
        user.userTutorialsProgress.remainingCfSteps &&
        user.userTutorialsProgress.remainingCfSteps[0] ===
          newnewapi.CfTutorialStep.CF_HERO
      ) {
        setIsPopupVisible(true);
      } else {
        setIsPopupVisible(false);
      }
    }, [user]);

    // Scroll to comments if hash is present
    useEffect(() => {
      const handleCommentsInitialHash = () => {
        const { hash } = window.location;
        if (!hash) {
          return;
        }

        const parsedHash = hash.substring(1);

        if (parsedHash === 'comments') {
          document.getElementById('comments')?.scrollIntoView();
        }
      };

      handleCommentsInitialHash();
    }, []);

    // Replace hash once scrolled to comments
    useEffect(() => {
      if (inView) {
        syncedHistoryReplaceState(
          {},
          `${router.locale !== 'en-US' ? `/${router.locale}` : ''}/post/${
            post.postUuid
          }#comments`
        );
      } else {
        syncedHistoryReplaceState(
          {},
          `${router.locale !== 'en-US' ? `/${router.locale}` : ''}/post/${
            post.postUuid
          }`
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView, post.postUuid, router.locale]);

    return (
      <>
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
                postType='cf'
              />
            )}
          </SExpiresSection>
          <PostVideoModeration
            postId={post.postUuid}
            announcement={post.announcement!!}
            response={(post.response || responseFreshlyUploaded) ?? undefined}
            thumbnails={{
              startTime: 1,
              endTime: 3,
            }}
            postStatus={postStatus}
            isMuted={mutedMode}
            openedTab={openedTab}
            responseFileProcessingETA={responseFileProcessingETA}
            responseFileProcessingError={responseFileProcessingError}
            responseFileProcessingLoading={responseFileProcessingLoading}
            responseFileProcessingProgress={responseFileProcessingProgress}
            responseFileUploadETA={responseFileUploadETA}
            responseFileUploadError={responseFileUploadError}
            responseFileUploadLoading={responseFileUploadLoading}
            responseFileUploadProgress={responseFileUploadProgress}
            uploadedResponseVideoUrl={uploadedResponseVideoUrl}
            videoProcessing={videoProcessing}
            handleChangeTab={(newValue) => setOpenedTab(newValue)}
            handleToggleMuted={() => handleToggleMutedMode()}
            handleUpdateResponseVideo={(newValue) =>
              setResponseFreshlyUploaded(newValue)
            }
            handleUpdatePostStatus={handleUpdatePostStatus}
            handleCancelVideoUpload={handleCancelVideoUpload}
            handleItemChange={handleItemChange}
            handleResetVideoUploadAndProcessingState={
              handleResetVideoUploadAndProcessingState
            }
            handleUploadVideoNotProcessed={handleUploadVideoNotProcessed}
            handleUploadVideoProcessed={handleUploadVideoProcessed}
            handleVideoDelete={handleVideoDelete}
          />
          <PostTopInfoModeration
            postType='cf'
            postStatus={postStatus}
            title={post.title}
            postId={post.postUuid}
            hasWinner={false}
            hasResponse={!!post.response}
            totalPledges={currentBackers}
            targetPledges={post.targetBackerCount}
            hidden={openedTab === 'response'}
            handleUpdatePostStatus={handleUpdatePostStatus}
            handleRemovePostFromState={handleRemovePostFromState}
          />
          <SActivitesContainer>
            {openedTab === 'announcement' ? (
              <>
                <PostVotingTab>{t('tabs.backers')}</PostVotingTab>
                {postStatus === 'waiting_for_response' ||
                postStatus === 'succeeded' ? (
                  <CfCrowdfundingSuccessModeration
                    currentNumBackers={currentBackers}
                    targetBackerCount={post.targetBackerCount}
                  />
                ) : postStatus === 'failed' ? (
                  <CfBackersStatsSectionModerationFailed
                    targetBackerCount={post.targetBackerCount}
                    currentNumBackers={currentBackers}
                  />
                ) : (
                  <CfBackersStatsSectionModeration
                    targetBackerCount={post.targetBackerCount}
                    currentNumBackers={currentBackers}
                  />
                )}
                {postStatus !== 'failed' && totalAmount && (
                  <SMoneyRaised>
                    <SMoneyRaisedCopy variant={3} weight={600}>
                      {t('cfPostModeration.moneyRaised')}
                    </SMoneyRaisedCopy>
                    <SMoneyRaisedAMount variant={6}>
                      ${formatNumber(totalAmount.usdCents / 100 ?? 0, true)}
                    </SMoneyRaisedAMount>
                  </SMoneyRaised>
                )}
              </>
            ) : (
              <PostResponseTabModeration
                postId={post.postUuid}
                postType='cf'
                postStatus={postStatus}
                postTitle={post.title}
                responseUploading={responseUploading}
                responseReadyToBeUploaded={
                  !!uploadedResponseVideoUrl &&
                  !responseFileUploadLoading &&
                  !responseFileProcessingLoading
                }
                responseUploadSuccess={responseUploadSuccess}
                moneyBacked={totalAmount as newnewapi.MoneyAmount}
                handleUploadResponse={handleUploadVideoProcessed}
              />
            )}
          </SActivitesContainer>
          {isPopupVisible && (
            <HeroPopup
              isPopupVisible={isPopupVisible}
              postType='CF'
              closeModal={goToNextStep}
            />
          )}
        </SWrapper>
        {post.isCommentsAllowed && (
          <SCommentsSection id='comments' ref={commentsSectionRef}>
            <SCommentsHeadline variant={4}>
              {t('successCommon.comments.heading')}
            </SCommentsHeadline>
            <CommentsBottomSection
              postUuid={post.postUuid}
              commentsRoomId={post.commentsRoomId as number}
              onFormBlur={handleCommentBlur}
              onFormFocus={handleCommentFocus}
            />
          </SCommentsSection>
        )}
      </>
    );
  }
);

PostModerationCF.defaultProps = {};

export default PostModerationCF;

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

const SMoneyRaised = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const SMoneyRaisedCopy = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

const SMoneyRaisedAMount = styled(Headline)``;

// Comments
const SCommentsHeadline = styled(Headline)`
  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 16px;
  }
`;

const SCommentsSection = styled.div``;
