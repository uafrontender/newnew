/* eslint-disable no-nested-ternary */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { css } from 'styled-components';
import { Trans, useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import { getMcOption } from '../../../../api/endpoints/multiple_choice';
import { usePostInnerState } from '../../../../contexts/postInnerContext';

// Utils
import Headline from '../../../atoms/Headline';
import PostVideoSuccess from '../../../molecules/decision/success/PostVideoSuccess';
import { formatNumber } from '../../../../utils/format';
import secondsToDHMS from '../../../../utils/secondsToDHMS';
import PostTitleContent from '../../../atoms/PostTitleContent';
import { Mixpanel } from '../../../../utils/mixpanel';
import McWaitingOptionsSection from '../../../molecules/decision/waiting/multiple_choice/McWaitingOptionsSection';
import GoBackButton from '../../../molecules/GoBackButton';
import PostSuccessOrWaitingControls from '../../../molecules/decision/common/PostSuccessOrWaitingControls';
import isBrowser from '../../../../utils/isBrowser';
import usePageVisibility from '../../../../utils/hooks/usePageVisibility';
import { useAppState } from '../../../../contexts/appStateContext';
import WinningMcOptionSupporters from '../../../molecules/decision/common/WinningMcOptionSupporters';
import DisplayName from '../../../atoms/DisplayName';
import { useUiState } from '../../../../contexts/uiStateContext';

const WaitingForResponseBox = dynamic(
  () => import('../../../molecules/decision/waiting/WaitingForResponseBox')
);
const CommentsBottomSection = dynamic(
  () => import('../../../molecules/decision/common/CommentsBottomSection')
);
const McSuccessOptionsTab = dynamic(
  () =>
    import(
      '../../../molecules/decision/success/multiple_choice/McSuccessOptionsTab'
    )
);
interface IPostAwaitingResponseMC {
  post: newnewapi.MultipleChoice;
}

const PostAwaitingResponseMC: React.FunctionComponent<IPostAwaitingResponseMC> =
  React.memo(({ post }) => {
    const { t } = useTranslation('page-Post');
    const { mutedMode, toggleMutedMode } = useUiState();
    const { resizeMode } = useAppState();
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const { handleGoBackInsidePost } = usePostInnerState();

    const isPageVisible = usePageVisibility();

    const activitiesContainerRef = useRef<HTMLDivElement | null>(null);

    // Timer
    const interval = useRef<number>();
    const parsedResponseDeadline = useMemo(
      () => (post.responseUploadDeadline?.seconds as number) * 1000,
      [post.responseUploadDeadline?.seconds]
    );
    const [parsedTimeToDeadline, setParsedTimeToDeadliine] = useState(
      (parsedResponseDeadline - Date.now()) / 1000
    );
    const waitingTime = useMemo(() => {
      const dhms = secondsToDHMS(parsedTimeToDeadline);

      let countdownsrt = `${dhms.days} ${t(
        dhms.days === '1'
          ? 'mcPostAwaiting.hero.expires.days_singular'
          : 'mcPostAwaiting.hero.expires.days'
      )} ${dhms.hours !== '0' ? dhms.hours : ''} ${t(
        dhms.hours !== '0'
          ? dhms.hours === '1'
            ? 'mcPostAwaiting.hero.expires.hours_singular'
            : 'mcPostAwaiting.hero.expires.hours'
          : ('' as any)
      )}`;

      if (dhms.days === '0') {
        countdownsrt = `${dhms.hours} ${t(
          dhms.hours === '1'
            ? 'mcPostAwaiting.hero.expires.hours_singular'
            : 'mcPostAwaiting.hero.expires.hours'
        )} ${dhms.minutes} ${t(
          dhms.minutes === '1'
            ? 'mcPostAwaiting.hero.expires.minutes_singular'
            : 'mcPostAwaiting.hero.expires.minutes'
        )}`;
        if (dhms.hours === '0') {
          countdownsrt = `${dhms.minutes} ${t(
            dhms.minutes === '1'
              ? 'mcPostAwaiting.hero.expires.minutes_singular'
              : 'mcPostAwaiting.hero.expires.minutes'
          )} ${dhms.seconds} ${t(
            dhms.seconds === '1'
              ? 'mcPostAwaiting.hero.expires.seconds_singular'
              : 'mcPostAwaiting.hero.expires.seconds'
          )}`;
          if (dhms.minutes === '0') {
            countdownsrt = `${dhms.seconds} ${t(
              dhms.seconds === '1'
                ? 'mcPostAwaiting.hero.expires.seconds_singular'
                : 'mcPostAwaiting.hero.expires.seconds'
            )}`;
          }
        }
      }
      countdownsrt = `${countdownsrt} `;
      return countdownsrt;
    }, [parsedTimeToDeadline, t]);

    // Winninfg option
    const [winningOption, setWinningOption] = useState<
      newnewapi.MultipleChoice.Option | undefined
    >();

    // Video
    // Open video tab
    const [videoTab, setVideoTab] = useState<'announcement' | 'response'>(
      'announcement'
    );
    // Response viewed
    const [responseViewed, setResponseViewed] = useState(
      post.isResponseViewedByMe ?? false
    );
    // Muted mode
    const handleToggleMutedMode = useCallback(() => {
      toggleMutedMode();
    }, [toggleMutedMode]);

    // Main screen vs all options
    const [openedMainSection, setOpenedMainSection] = useState<
      'main' | 'options'
    >('main');

    const handleOpenOptionsSection = useCallback(() => {
      setOpenedMainSection('options');

      let top = activitiesContainerRef.current?.offsetTop;

      if (top) {
        top -= isMobile ? 16 : 84;

        if (top) {
          window?.scrollTo({
            top,
            behavior: 'smooth',
          });
        }
      }
    }, [isMobile]);

    // Update timer
    useEffect(() => {
      if (isBrowser() && isPageVisible) {
        interval.current = window.setInterval(() => {
          setParsedTimeToDeadliine(
            () => (parsedResponseDeadline - Date.now()) / 1000
          );
        }, 300);
      }
      return () => clearInterval(interval.current);
    }, [isPageVisible, parsedResponseDeadline]);

    // Scroll to comments if hash is present
    useEffect(() => {
      const handleCommentsInitialHash = () => {
        const { hash } = window.location;
        if (!hash) {
          return;
        }
        const parsedHash = hash.substring(1);

        if (parsedHash === 'comments') {
          setTimeout(() => {
            document.getElementById('comments')?.scrollIntoView();
          }, 100);
        }
      };

      handleCommentsInitialHash();
    }, []);

    // Load winning option
    useEffect(() => {
      async function fetchAndSetWinningOption(id: number) {
        try {
          const payload = new newnewapi.GetMcOptionRequest({
            optionId: id,
          });
          const res = await getMcOption(payload);
          if (res.data?.option) {
            setWinningOption(
              res.data.option as newnewapi.MultipleChoice.Option
            );
          }
        } catch (err) {
          console.error(err);
        }
      }

      if (post.winningOptionId) {
        fetchAndSetWinningOption(post.winningOptionId as number);
      }
    }, [post.winningOptionId]);

    return (
      <>
        <SWrapper>
          {isMobile && (
            <SGoBackMobileSection>
              <SGoBackButton onClick={handleGoBackInsidePost} />
            </SGoBackMobileSection>
          )}
          <PostVideoSuccess
            postUuid={post.postUuid}
            announcement={post.announcement!!}
            response={post.response ?? undefined}
            responseViewed={responseViewed}
            openedTab={videoTab}
            setOpenedTab={(tab) => setVideoTab(tab)}
            isMuted={mutedMode}
            handleToggleMuted={() => handleToggleMutedMode()}
            handleSetResponseViewed={(newValue) => setResponseViewed(newValue)}
          />
          {isMobile ? <PostSuccessOrWaitingControls /> : null}
          <SActivitiesContainer
            dimmedBackground={openedMainSection === 'main'}
            ref={activitiesContainerRef}
            openedTab={openedMainSection}
          >
            {openedMainSection === 'main' ? (
              <>
                <WaitingForResponseBox
                  title={t('mcPostAwaiting.hero.title')}
                  body={
                    <Trans
                      t={t}
                      i18nKey={
                        winningOption
                          ? 'mcPostAwaiting.hero.body'
                          : 'mcPostAwaiting.hero.bodyNoResponse'
                      }
                      // @ts-ignore
                      components={[
                        <DisplayName user={post.creator} inverted />,
                        { time: waitingTime },
                      ]}
                    />
                  }
                />
                <SMainSectionWrapper>
                  <SCreatorInfoDiv>
                    <SCreator>
                      <Link href={`/${post.creator?.username}`}>
                        <SLinkElement href={`/${post.creator?.username}`}>
                          <SCreatorImage src={post.creator?.avatarUrl ?? ''} />
                        </SLinkElement>
                      </Link>
                      <Link href={`/${post.creator?.username}`}>
                        <SLinkElement
                          shrinkable
                          href={`/${post.creator?.username}`}
                        >
                          <SWantsToKnow>
                            <Trans
                              t={t}
                              i18nKey='mcPostAwaiting.wantsToKnow'
                              components={[<DisplayName user={post.creator} />]}
                            />
                          </SWantsToKnow>
                        </SLinkElement>
                      </Link>
                    </SCreator>
                    {post.totalVotes && post.totalVotes > 0 ? (
                      <STotal>
                        {`${formatNumber(post.totalVotes ?? 0, true)}`}{' '}
                        <span>{t('mcPostSuccess.inTotalVotes')}</span>
                      </STotal>
                    ) : null}
                  </SCreatorInfoDiv>
                  <SPostTitle variant={4}>
                    <PostTitleContent>{post.title}</PostTitleContent>
                  </SPostTitle>
                  <SSeparator />
                  {winningOption ? (
                    <>
                      <WinningMcOptionSupporters
                        postCreator={post.creator!!}
                        winningOption={winningOption}
                      />
                      <SWinningOptionAmount variant={4}>
                        {`${formatNumber(winningOption.voteCount ?? 0, true)}`}{' '}
                        {winningOption.voteCount > 1
                          ? t('mcPostSuccess.votes')
                          : t('mcPostSuccess.vote')}
                        {` `}
                        {winningOption.totalAmount?.usdCents &&
                        winningOption.totalAmount?.usdCents > 0
                          ? `($${formatNumber(
                              winningOption.totalAmount.usdCents / 100 ?? 0,
                              true
                            )})`
                          : ''}
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
                          onClick={handleOpenOptionsSection}
                        >
                          {t('mcPostSuccess.seeAll')}
                        </SWinningOptionDetailsSeeAll>
                        <SWinningOptionDetailsTitle variant={4}>
                          {winningOption.text}
                        </SWinningOptionDetailsTitle>
                      </SWinningOptionDetails>
                    </>
                  ) : (
                    <McWaitingOptionsSection post={post} />
                  )}
                </SMainSectionWrapper>
                {/* {!winningOption ? (
                  <McWaitingOptionsSection post={post} />
                ) : null} */}
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
          </SActivitiesContainer>
        </SWrapper>
        {post.isCommentsAllowed && (
          <SCommentsSection id='comments'>
            <SCommentsHeadline variant={4}>
              {t('successCommon.comments.heading')}
            </SCommentsHeadline>
            <CommentsBottomSection
              postUuid={post.postUuid}
              postShortId={post.postShortId ?? ''}
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
    grid-column-gap: 32px;
  }
`;

const SActivitiesContainer = styled.div<{
  dimmedBackground: boolean;
  openedTab: 'main' | 'options';
}>`
  grid-area: activities;

  background-color: ${({ theme, dimmedBackground }) =>
    dimmedBackground ? theme.colorsThemed.background.secondary : 'transparent'};
  overflow: hidden;
  border-radius: 16px;

  margin-top: 16px;

  ${({ theme }) => theme.media.tablet} {
    display: flex;
    flex-direction: column;

    margin-top: 0px;
    min-height: 506px;
    ${({ openedTab }) =>
      openedTab === 'options'
        ? css`
            height: 506px;
          `
        : null}

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

    height: calc(100% - 260px);
    height: 100%;

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
  gap: 12px;

  margin-top: 32px;
  padding-left: 8px;
  padding-right: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 16px;
    padding-left: 0;
    padding-right: 0;

    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const SCreator = styled.div`
  display: flex;
  flex-shrink: 1;
  flex-direction: row;
  align-items: center;

  max-width: 100%;
  line-height: 24px;
  gap: 6px;

  overflow: hidden;
  white-space: nowrap;
`;

const SLinkElement = styled.a<{ shrinkable?: boolean }>`
  display: flex;
  flex-shrink: ${({ shrinkable }) => (shrinkable ? 1 : 0)};
  overflow: hidden;
`;

const SCreatorImage = styled.img`
  display: inline-block;

  width: 24px;
  height: 24px;

  border-radius: 50%;

  margin-right: 4px;
`;

const SWantsToKnow = styled.span`
  display: inline-flex;
  align-items: center;
  white-space: pre;
  max-width: 100%;

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
  flex-shrink: 0;

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
  white-space: pre-wrap;
  word-break: break-word;

  margin-top: 8px;
  ${({ theme }) => theme.media.tablet} {
    text-align: left;
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
  word-break: break-word;

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

// Go back mobile
const SGoBackMobileSection = styled.div`
  position: relative;

  display: flex;
  justify-content: flex-start;

  width: 100%;
  height: 56px;
  margin-bottom: 6px;
`;

const SGoBackButton = styled(GoBackButton)``;
