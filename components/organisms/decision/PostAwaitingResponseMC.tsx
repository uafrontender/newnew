/* eslint-disable no-nested-ternary */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from '../../../redux-store/store';
import { toggleMutedMode } from '../../../redux-store/slices/uiStateSlice';
import { getMcOption } from '../../../api/endpoints/multiple_choice';

// Utils
import Headline from '../../atoms/Headline';
import PostVideoSuccess from '../../molecules/decision/success/PostVideoSuccess';
import { formatNumber } from '../../../utils/format';
import getDisplayname from '../../../utils/getDisplayname';
import secondsToDHMS from '../../../utils/secondsToDHMS';
import useSynchronizedHistory from '../../../utils/hooks/useSynchronizedHistory';
import PostTitleContent from '../../atoms/PostTitleContent';
import { Mixpanel } from '../../../utils/mixpanel';

const WaitingForResponseBox = dynamic(
  () => import('../../molecules/decision/waiting/WaitingForResponseBox')
);
const CommentsBottomSection = dynamic(
  () => import('../../molecules/decision/success/CommentsBottomSection')
);
const McSuccessOptionsTab = dynamic(
  () =>
    import(
      '../../molecules/decision/multiple_choice/success/McSuccessOptionsTab'
    )
);
interface IPostAwaitingResponseMC {
  post: newnewapi.MultipleChoice;
}

const PostAwaitingResponseMC: React.FunctionComponent<IPostAwaitingResponseMC> =
  React.memo(({ post }) => {
    const { t } = useTranslation('modal-Post');
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state);
    const { mutedMode } = useAppSelector((state) => state.ui);
    const router = useRouter();

    const { syncedHistoryReplaceState } = useSynchronizedHistory();

    const waitingTime = useMemo(() => {
      const end = (post.responseUploadDeadline?.seconds as number) * 1000;
      const parsed = (end - Date.now()) / 1000;
      const dhms = secondsToDHMS(parsed);

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

    // Winninfg option
    const [winningOption, setWinningOption] =
      useState<newnewapi.MultipleChoice.Option | undefined>();

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

    // Main screen vs all options
    const [openedMainSection, setOpenedMainSection] =
      useState<'main' | 'options'>('main');

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

    // Load winning option
    useEffect(() => {
      async function fetchAndSetWinningOption(id: number) {
        try {
          const payload = new newnewapi.GetMcOptionRequest({
            optionId: id,
          });

          const res = await getMcOption(payload);

          console.log(res);

          if (res.data?.option) {
            setWinningOption(
              res.data.option as newnewapi.MultipleChoice.Option
            );
          }
        } catch (err) {
          console.log(err);
        }
      }

      console.log(post.winningOptionId);

      if (post.winningOptionId) {
        fetchAndSetWinningOption(post.winningOptionId as number);
      }
    }, [post.winningOptionId]);

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
          <SActivitesContainer dimmedBackground={openedMainSection === 'main'}>
            {openedMainSection === 'main' ? (
              <>
                <WaitingForResponseBox
                  title={t('mcPostAwaiting.hero.title')}
                  body={t('mcPostAwaiting.hero.body', {
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
                          {t('mcPostSuccess.wantsToKnow', {
                            creator: post.creator?.nickname,
                          })}
                        </SWantsToKnow>
                      </a>
                    </SCreator>
                    <STotal>
                      {`${formatNumber(post.totalVotes ?? 0, true)}`}{' '}
                      <span>{t('mcPostSuccess.inTotalVotes')}</span>
                    </STotal>
                  </SCreatorInfoDiv>
                  <SPostTitle variant={4}>
                    <PostTitleContent>{post.title}</PostTitleContent>
                  </SPostTitle>
                  <SSeparator />
                  {winningOption && (
                    <>
                      <SWinningBidCreator>
                        <SCreator>
                          <Link
                            href={`/${
                              winningOption.creator?.uuid !== post.creator?.uuid
                                ? winningOption.creator?.username!!
                                : winningOption.firstVoter?.username!!
                            }`}
                          >
                            <SCreatorImage
                              src={
                                winningOption.creator?.uuid !==
                                post.creator?.uuid
                                  ? winningOption.creator?.avatarUrl!!
                                  : winningOption.firstVoter?.avatarUrl!!
                              }
                            />
                          </Link>
                          <SWinningBidCreatorText>
                            <SSpan>
                              <Link
                                href={`/${
                                  winningOption.creator?.uuid !==
                                  post.creator?.uuid
                                    ? winningOption.creator?.username!!
                                    : winningOption.firstVoter?.username!!
                                }`}
                              >
                                {winningOption.creator?.uuid ===
                                  user.userData?.userUuid ||
                                winningOption.isSupportedByMe
                                  ? winningOption.supporterCount > 1
                                    ? t('me')
                                    : t('I')
                                  : getDisplayname(
                                      winningOption.creator?.uuid !==
                                        post.creator?.uuid
                                        ? winningOption.creator!!
                                        : winningOption.firstVoter!!
                                    )}
                              </Link>
                            </SSpan>
                            {winningOption.supporterCount > 1 ? (
                              <>
                                {' & '}
                                {formatNumber(
                                  winningOption.supporterCount,
                                  true
                                )}{' '}
                                {t('mcPostSuccess.others')}
                              </>
                            ) : null}{' '}
                            {t('mcPostSuccess.voted')}
                          </SWinningBidCreatorText>
                        </SCreator>
                      </SWinningBidCreator>
                      <SWinningOptionAmount variant={4}>
                        {`${formatNumber(winningOption.voteCount ?? 0, true)}`}{' '}
                        {winningOption.voteCount > 1
                          ? t('mcPostSuccess.votes')
                          : t('mcPostSuccess.vote')}
                      </SWinningOptionAmount>
                      <SSeparator />
                      <SWinningOptionDetails>
                        <SWinningOptionDetailsBidChosen>
                          {t('mcPostSuccess.optionChosen')}
                        </SWinningOptionDetailsBidChosen>
                        <SWinningOptionDetailsSeeAll
                          onClickCapture={() => {
                            Mixpanel.track('Winning Option Details See All', {
                              _stage: 'Post',
                              _postUuid: post.postUuid,
                              _component: 'PostAwaitingResponseMC',
                            });
                          }}
                          onClick={() => setOpenedMainSection('options')}
                        >
                          {t('mcPostSuccess.seeAll')}
                        </SWinningOptionDetailsSeeAll>
                        <SWinningOptionDetailsTitle variant={4}>
                          {winningOption.text}
                        </SWinningOptionDetailsTitle>
                      </SWinningOptionDetails>
                    </>
                  )}
                </SMainSectionWrapper>
              </>
            ) : (
              <McSuccessOptionsTab
                post={post}
                handleGoBack={() => {
                  Mixpanel.track('Go Back', {
                    _stage: 'Post',
                    _postUuid: post.postUuid,
                    _component: 'PostAwaitingResponseMC',
                  });
                  setOpenedMainSection('main');
                }}
              />
            )}
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
  });

export default PostAwaitingResponseMC;

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

const SActivitesContainer = styled.div<{
  dimmedBackground: boolean;
}>`
  grid-area: activities;

  background-color: ${({ theme, dimmedBackground }) =>
    dimmedBackground ? theme.colorsThemed.background.secondary : 'transparent'};
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
    /* justify-content: space-between; */
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
    justify-content: flex-start;
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

// Winning option info
const SWinningBidCreator = styled.div`
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
  }
`;

const SWinningBidCreatorText = styled.span`
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

// Winning option
const SWinningOptionAmount = styled(Headline)`
  text-align: center;

  margin-top: 8px;
  ${({ theme }) => theme.media.tablet} {
    text-align: left;
  }
`;

const SWinningOptionDetails = styled.div`
  display: grid;

  grid-template-areas:
    'bidchosen'
    'title'
    'see_all';

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    grid-template-areas:
      'bidchosen see_all'
      'title title';
    grid-template-columns: 1fr 1fr;

    margin-bottom: initial;
  }
`;

const SWinningOptionDetailsBidChosen = styled.div`
  grid-area: bidchosen;

  text-align: center;
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  ${({ theme }) => theme.media.tablet} {
    text-align: left;
  }

  ${({ theme }) => theme.media.laptop} {
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
  }
`;

const SWinningOptionDetailsSeeAll = styled.button`
  grid-area: see_all;

  text-align: center;
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};

  background: transparent;
  border: none;

  margin-top: 8px;

  cursor: pointer;

  &:focus,
  &:hover,
  &:active {
    outline: none;
    color: ${({ theme }) => theme.colorsThemed.text.primary};
  }

  ${({ theme }) => theme.media.tablet} {
    margin-top: 0px;
    text-align: right;
    justify-self: right;
    width: fit-content;
  }

  ${({ theme }) => theme.media.laptop} {
    font-weight: 700;
    font-size: 16px;
    line-height: 24px;
  }
`;

const SWinningOptionDetailsTitle = styled(Headline)`
  grid-area: title;

  text-align: center;
  ${({ theme }) => theme.media.tablet} {
    text-align: left;
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

const SSpan = styled.span`
  a {
    cursor: pointer;

    color: ${({ theme }) => theme.colorsThemed.text.secondary};

    &:hover {
      outline: none;
      color: ${({ theme }) => theme.colorsThemed.text.primary};
    }
  }
`;
