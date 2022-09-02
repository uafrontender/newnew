/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, { useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import { toggleMutedMode } from '../../../../redux-store/slices/uiStateSlice';

// Utils
import Headline from '../../../atoms/Headline';
import PostVideoSuccess from '../../../molecules/decision/success/PostVideoSuccess';
import DecisionEndedBox from '../../../molecules/decision/success/DecisionEndedBox';

import { formatNumber } from '../../../../utils/format';
import { fetchPledges } from '../../../../api/endpoints/crowdfunding';
import assets from '../../../../constants/assets';
import { fetchPostByUUID } from '../../../../api/endpoints/post';
import useSynchronizedHistory from '../../../../utils/hooks/useSynchronizedHistory';
import PostTitleContent from '../../../atoms/PostTitleContent';
import { Mixpanel } from '../../../../utils/mixpanel';

const CommentsBottomSection = dynamic(
  () => import('../../../molecules/decision/common/CommentsBottomSection')
);

interface IPostSuccessCF {
  post: newnewapi.Crowdfunding;
}

const PostSuccessCF: React.FunctionComponent<IPostSuccessCF> = React.memo(
  ({ post }) => {
    const { t } = useTranslation('modal-Post');
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state);
    const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );
    const router = useRouter();

    const { syncedHistoryReplaceState } = useSynchronizedHistory();

    // My pledge amount
    const [myPledgeAmount, setMyPledgeAmount] = useState<
      newnewapi.MoneyAmount | undefined
    >(undefined);
    const [pledges, setPledges] = useState<newnewapi.Crowdfunding.IPledge[]>(
      []
    );
    const [pledgesNextPageToken, setPledgesNextPageToken] = useState<
      string | undefined | null
    >('');
    const [pledgesLoading, setPledgesLoading] = useState(false);
    const [loadingPledgesError, setLoadingPledgesError] = useState('');

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
                ...(res.data?.pledges as newnewapi.Crowdfunding.IPledge[]),
              ];
              return workingArr;
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
      [pledgesLoading, setPledges, post]
    );

    // Video
    // Open video tab
    const [videoTab, setVideoTab] = useState<'announcement' | 'response'>(
      'announcement'
    );
    // Response viewed
    const [responseViewed, setResponseViewed] = useState(
      post.isResponseViewedByMe ?? false
    );
    const fetchPostLatestData = useCallback(async () => {
      try {
        const fetchPostPayload = new newnewapi.GetPostRequest({
          postUuid: post.postUuid,
        });

        const res = await fetchPostByUUID(fetchPostPayload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        if (res.data.crowdfunding?.isResponseViewedByMe) {
          setResponseViewed(true);
        }
      } catch (err) {
        console.error(err);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Muted mode
    const handleToggleMutedMode = useCallback(() => {
      dispatch(toggleMutedMode(''));
    }, [dispatch]);

    // Comments
    const { ref: commentsSectionRef, inView } = useInView({
      threshold: 0.8,
    });

    // Check if the response has been viewed
    useEffect(() => {
      fetchPostLatestData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    useEffect(() => {
      fetchPledgesForPost();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (pledgesNextPageToken) {
        fetchPledgesForPost(pledgesNextPageToken);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pledgesNextPageToken]);

    useEffect(() => {
      let workingAmount = 0;

      if (user.userData?.userUuid) {
        workingAmount = pledges
          .filter((pledge) => pledge.creator?.uuid === user.userData?.userUuid)
          .reduce(
            (acc, myPledge) =>
              myPledge.amount?.usdCents ? myPledge.amount?.usdCents + acc : acc,
            0
          );
      }

      if (workingAmount !== 0 && workingAmount !== undefined) {
        setMyPledgeAmount(
          new newnewapi.MoneyAmount({
            usdCents: workingAmount,
          })
        );
      }
    }, [pledges, user.userData?.userUuid]);

    return (
      <>
        <SWrapper>
          <PostVideoSuccess
            postId={post.postUuid}
            announcement={post.announcement!!}
            response={post.response ?? undefined}
            responseViewed={responseViewed}
            openedTab={videoTab}
            setOpenedTab={(tab) => setVideoTab(tab)}
            isMuted={mutedMode}
            handleToggleMuted={() => handleToggleMutedMode()}
            handleSetResponseViewed={(newValue) => setResponseViewed(newValue)}
          />
          <SActivitesContainer>
            <>
              <DecisionEndedBox
                type='mc'
                imgSrc={
                  theme.name === 'light'
                    ? assets.creation.lightCfAnimated
                    : assets.creation.darkCfAnimated
                }
              >
                {t('cfPostSuccess.heroText')}
              </DecisionEndedBox>
              <SMainSectionWrapper>
                <SCreatorInfoDiv>
                  <SCreator>
                    <a href={`/${post.creator?.username}`}>
                      <SCreatorImage src={post.creator?.avatarUrl ?? ''} />
                    </a>
                    <a href={`/${post.creator?.username}`}>
                      <SWantsToKnow>
                        {t('cfPostSuccess.wantsToKnow', {
                          creator: post.creator?.nickname,
                        })}
                      </SWantsToKnow>
                    </a>
                  </SCreator>
                  {/* <STotal>
                    {`$${formatNumber(post.totalAmount?.usdCents/100 ?? 0, true)}`}
                  </STotal> */}
                </SCreatorInfoDiv>
                <SPostTitle variant={4}>
                  <PostTitleContent>{post.title}</PostTitleContent>
                </SPostTitle>
                <SSeparator />
                <SBackersInfo>
                  <SCreatorsBackers>
                    {t('cfPostSuccess.creatorsBackers', {
                      creator: post.creator?.nickname,
                    })}
                  </SCreatorsBackers>
                  <SCurrentBackers variant={4}>
                    {formatNumber(post.currentBackerCount, true)}
                  </SCurrentBackers>
                  <STargetBackers variant={6}>
                    {t('cfPostSuccess.ofTargetBackers', {
                      target_count: formatNumber(post.targetBackerCount, true),
                    })}
                  </STargetBackers>
                </SBackersInfo>
                {user.loggedIn && myPledgeAmount && (
                  <>
                    <SSeparator />
                    <YouBackedInfo>
                      <SYouBackedFor>
                        {t('cfPostSuccess.youBackedFor')}
                      </SYouBackedFor>
                      <SYouBackedAmount variant={4}>
                        {`$${formatNumber(
                          Math.round(myPledgeAmount.usdCents / 100) ?? 0,
                          true
                        )}`}
                      </SYouBackedAmount>
                    </YouBackedInfo>
                  </>
                )}
              </SMainSectionWrapper>
              {!isMobile ? (
                <>
                  {!responseViewed && videoTab === 'announcement' ? (
                    <SWatchResponseWrapper>
                      <SWatchResponseBtn
                        shouldView={!responseViewed}
                        onClickCapture={() => {
                          Mixpanel.track('Watch Response', {
                            _stage: 'Post',
                            _postUuid: post.postUuid,
                            _component: 'PostSuccessCF',
                          });
                        }}
                        onClick={() => setVideoTab('response')}
                      >
                        {t('postVideoSuccess.tabs.watchResponseFirstTime')}
                      </SWatchResponseBtn>
                    </SWatchResponseWrapper>
                  ) : null}
                  {responseViewed ? (
                    <SToggleVideoWidget>
                      <SChangeTabBtn
                        shouldView={videoTab === 'announcement'}
                        onClickCapture={() => {
                          Mixpanel.track('Set Tab Announcement', {
                            _stage: 'Post',
                            _postUuid: post.postUuid,
                            _component: 'PostSuccessCF',
                          });
                        }}
                        onClick={() => setVideoTab('announcement')}
                      >
                        {t('postVideoSuccess.tabs.watchOriginal')}
                      </SChangeTabBtn>
                      <SChangeTabBtn
                        shouldView={videoTab === 'response'}
                        onClickCapture={() => {
                          Mixpanel.track('Set Tab Response', {
                            _stage: 'Post',
                            _postUuid: post.postUuid,
                            _component: 'PostSuccessCF',
                          });
                        }}
                        onClick={() => setVideoTab('response')}
                      >
                        {t('postVideoSuccess.tabs.watchResponse')}
                      </SChangeTabBtn>
                    </SToggleVideoWidget>
                  ) : null}
                </>
              ) : null}
            </>
          </SActivitesContainer>
        </SWrapper>
        {post.isCommentsAllowed && (
          <SCommentsSection id='comments' ref={commentsSectionRef}>
            <SCommentsHeadline variant={4}>
              {t('successCommon.comments.heading')}
            </SCommentsHeadline>
            <CommentsBottomSection
              postUuid={post.postUuid}
              commentsRoomId={post.commentsRoomId as number}
            />
          </SCommentsSection>
        )}
      </>
    );
  }
);

export default PostSuccessCF;

const SWrapper = styled.div`
  width: 100%;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    min-height: 0;

    display: inline-grid;
    grid-template-areas: 'video activities';
    grid-template-columns: 284px 1fr;
    grid-template-rows: minmax(0, 1fr);

    grid-column-gap: 16px;

    align-items: flex-start;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 728px;

    grid-template-areas: 'video activities';
    grid-template-columns: 410px 1fr;
  }
`;

const SActivitesContainer = styled.div`
  grid-area: activities;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
  overflow: hidden;
  border-radius: 16px;

  margin-top: 16px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 0px;
    min-height: 506px;

    background-color: ${({ theme }) =>
      theme.name === 'dark'
        ? theme.colorsThemed.background.secondary
        : 'transparent'};
  }

  ${({ theme }) => theme.media.laptop} {
    min-height: unset;
    height: 728px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
`;

const SMainSectionWrapper = styled.div`
  padding-left: 16px;
  padding-right: 16px;

  ${({ theme }) => theme.media.tablet} {
    padding-left: 16px;
    padding-right: 16px;

    height: calc(100% - 260px);

    display: flex;
    flex-direction: column;
    justify-content: flex-start\;;
  }
`;

const SSeparator = styled.div`
  margin: 24px auto;

  height: 1.5px;
  width: 64px;

  border-bottom: 1.5px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};
`;

// Creator info
const SCreatorInfoDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;

  margin-top: 32px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 16px;

    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const SCreator = styled.div`
  line-height: 24px;

  vertical-align: middle;
`;

const SCreatorImage = styled.img`
  display: inline-block;

  width: 24px;
  height: 24px;

  border-radius: 50%;

  margin-right: 4px;
`;

const SWantsToKnow = styled.span`
  position: relative;
  top: -6px;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;

  ${({ theme }) => theme.media.laptop} {
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
  }
`;

const STotal = styled.div`
  position: relative;
  top: -6px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  span {
    color: ${({ theme }) => theme.colorsThemed.text.secondary};
    font-weight: 700;
    font-size: 12px;
    line-height: 16px;
  }
  ${({ theme }) => theme.media.laptop} {
    position: relative;
    top: -3px;

    font-weight: 600;
    font-size: 18px;
    line-height: 20px;

    span {
      font-weight: 700;
      font-size: 16px;
      line-height: 20px;
    }
  }
`;

// Post title
const SPostTitle = styled(Headline)`
  text-align: center;

  margin-top: 8px;
  ${({ theme }) => theme.media.tablet} {
    text-align: left;
  }
`;

// Backers info
const SBackersInfo = styled.div`
  text-align: center;
  ${({ theme }) => theme.media.tablet} {
    text-align: left;
  }
`;

const SCreatorsBackers = styled.div`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;

  ${({ theme }) => theme.media.laptop} {
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
  }
`;

const SCurrentBackers = styled(Headline)``;

const STargetBackers = styled(Headline)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;

// You backed info
const YouBackedInfo = styled.div`
  text-align: center;

  margin-bottom: 16px;
  ${({ theme }) => theme.media.tablet} {
    text-align: left;
  }
`;

const SYouBackedFor = styled.div`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;

  ${({ theme }) => theme.media.laptop} {
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
  }
`;

const SYouBackedAmount = styled(Headline)``;

// Watch response for the first time
const SWatchResponseWrapper = styled.div`
  width: 100%;
  height: 60px;

  overflow: hidden;
  border-radius: 16px;
`;

const SWatchResponseBtn = styled.button<{
  shouldView?: boolean;
}>`
  background: ${({ shouldView, theme }) =>
    shouldView ? theme.colorsThemed.accent.blue : 'rgba(11, 10, 19, 0.2)'};
  border: transparent;
  border-radius: 16px;

  padding: 17px 24px;

  width: 100%;
  height: 100%;

  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;

  cursor: pointer;

  &:active,
  &:focus {
    outline: none;
  }
`;

const SToggleVideoWidget = styled.div`
  display: flex;

  height: 60px;
  width: 100%;

  overflow: hidden;
  border-radius: 16px;
`;

const SChangeTabBtn = styled.button<{
  shouldView?: boolean;
}>`
  background: ${({ shouldView, theme }) =>
    shouldView
      ? theme.colorsThemed.accent.blue
      : theme.colorsThemed.background.tertiary};
  border: transparent;

  padding: 17px 24px;

  width: 50%;
  height: 100%;

  text-align: center;
  color: ${({ shouldView, theme }) =>
    shouldView
      ? '#ffffff'
      : theme.name === 'dark'
      ? '#ffffff'
      : theme.colorsThemed.text.tertiary};
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;

  cursor: pointer;

  &:active,
  &:focus {
    outline: none;
  }
`;

// Comments
const SCommentsHeadline = styled(Headline)`
  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 16px;
  }
`;

const SCommentsSection = styled.div``;
