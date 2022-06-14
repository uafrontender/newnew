/* eslint-disable no-nested-ternary */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';

import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';
import { formatNumber } from '../../../utils/format';
import secondsToDHMS from '../../../utils/secondsToDHMS';
import Headline from '../../atoms/Headline';
import PostVideoSuccess from '../../molecules/decision/success/PostVideoSuccess';

const WaitingForResponseBox = dynamic(
  () => import('../../molecules/decision/waiting/WaitingForResponseBox')
);
const AcWaitingOptionsSection = dynamic(
  () =>
    import('../../molecules/decision/auction/waiting/AcWaitingOptionsSection')
);
const CommentsSuccess = dynamic(
  () => import('../../molecules/decision/success/CommentsSuccess')
);

interface IPostAwaitingResponseAC {
  post: newnewapi.Auction;
}

const PostAwaitingResponseAC: React.FunctionComponent<IPostAwaitingResponseAC> =
  React.memo(({ post }) => {
    const { t } = useTranslation('decision');
    const dispatch = useAppDispatch();
    const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
    const isTablet = ['tablet'].includes(resizeMode);

    const waitingTime = useMemo(() => {
      const end = (post.responseUploadDeadline?.seconds as number) * 1000;
      const parsed = (end - Date.now()) / 1000;
      const dhms = secondsToDHMS(parsed, 'noTrim');

      let countdownsrt = `${dhms.days} ${t(
        'acPostAwaiting.hero.expires.days'
      )} ${dhms.hours} ${t('acPostAwaiting.hero.expires.hours')}`;

      if (dhms.days === '0') {
        countdownsrt = `${dhms.hours} ${t(
          'acPostAwaiting.hero.expires.hours'
        )} ${dhms.minutes} ${t('acPostAwaiting.hero.expires.minutes')}`;
        if (dhms.hours === '0') {
          countdownsrt = `${dhms.minutes} ${t(
            'acPostAwaiting.hero.expires.minutes'
          )} ${dhms.seconds} ${t('acPostAwaiting.hero.expires.seconds')}`;
          if (dhms.minutes === '0') {
            countdownsrt = `${dhms.seconds} ${t(
              'acPostAwaiting.hero.expires.seconds'
            )}`;
          }
        }
      }
      countdownsrt = `${countdownsrt} `;
      return countdownsrt;
    }, [post.responseUploadDeadline?.seconds, t]);

    // Video
    // Open video tab
    const [videoTab, setVideoTab] =
      useState<'announcement' | 'response'>('announcement');
    // Response viewed
    const [responseViewed, setResponseViewed] = useState(
      post.isResponseViewedByMe ?? false
    );
    // Muted mode
    const handleToggleMutedMode = useCallback(() => {
      dispatch(toggleMutedMode(''));
    }, [dispatch]);

    // Comments
    const { ref: commentsSectionRef, inView } = useInView({
      threshold: 0.8,
    });

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
        window.history.replaceState(
          {
            postId: post.postUuid,
          },
          'Post',
          `/post/${post.postUuid}#comments`
        );
      } else {
        window.history.replaceState(
          {
            postId: post.postUuid,
          },
          'Post',
          `/post/${post.postUuid}`
        );
      }
    }, [inView, post.postUuid]);

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
            <WaitingForResponseBox
              title={t('acPostAwaiting.hero.title')}
              body={t('acPostAwaiting.hero.body', {
                creator: post.creator?.nickname,
                time: waitingTime,
              })}
            />
            <SMainSectionWrapper>
              <SCreatorInfoDiv>
                <SCreator>
                  <a href={`/${post.creator?.username}`}>
                    <SCreatorImage src={post.creator?.avatarUrl ?? ''} />
                  </a>
                  <a href={`/${post.creator?.username}`}>
                    <SWantsToKnow>
                      {t('acPostAwaiting.wantsToKnow', {
                        creator: post.creator?.nickname,
                      })}
                    </SWantsToKnow>
                  </a>
                </SCreator>
                {post.totalAmount?.usdCents && (
                  <STotal>
                    {`$${formatNumber(
                      post.totalAmount.usdCents / 100 ?? 0,
                      true
                    )}`}{' '}
                    <span>{t('acPostAwaiting.inTotalBids')}</span>
                  </STotal>
                )}
              </SCreatorInfoDiv>
              <SPostTitle variant={4}>{post.title}</SPostTitle>
              <SSeparator />
              <AcWaitingOptionsSection
                post={post}
                heightDelta={isTablet ? 142 : 182}
              />
            </SMainSectionWrapper>
          </SActivitesContainer>
        </SWrapper>
        {post.isCommentsAllowed && (
          <SCommentsSection id='comments' ref={commentsSectionRef}>
            <SCommentsHeadline variant={4}>
              {t('successCommon.comments.heading')}
            </SCommentsHeadline>
            <CommentsSuccess
              postUuid={post.postUuid}
              commentsRoomId={post.commentsRoomId as number}
              handleGoBack={() => {}}
            />
          </SCommentsSection>
        )}
      </>
    );
  });

export default PostAwaitingResponseAC;

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

    height: 506px;

    background-color: ${({ theme }) =>
      theme.name === 'dark'
        ? theme.colorsThemed.background.secondary
        : 'transparent'};
  }

  ${({ theme }) => theme.media.laptop} {
    min-height: unset;
    height: 728px;
  }
`;

const SMainSectionWrapper = styled.div`
  padding-left: 16px;
  padding-right: 16px;

  ${({ theme }) => theme.media.tablet} {
    padding-left: 16px;
    padding-right: 16px;

    height: calc(100% - 160px);
  }
`;

const SSeparator = styled.div`
  margin: 16px auto;

  height: 1.5px;
  width: 100%;

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
    max-height: 96px;
  }

  ${({ theme }) => theme.media.laptop} {
    max-height: 120px;
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
