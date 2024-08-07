/* eslint-disable no-nested-ternary */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { Trans, useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import { formatNumber } from '../../../../utils/format';
import secondsToDHMS from '../../../../utils/secondsToDHMS';
import { usePostInnerState } from '../../../../contexts/postInnerContext';

import Headline from '../../../atoms/Headline';
import PostVideoSuccess from '../../../molecules/decision/success/PostVideoSuccess';
import PostTitleContent from '../../../atoms/PostTitleContent';
import GoBackButton from '../../../molecules/GoBackButton';
import PostSuccessOrWaitingControls from '../../../molecules/decision/common/PostSuccessOrWaitingControls';
import usePageVisibility from '../../../../utils/hooks/usePageVisibility';
import isBrowser from '../../../../utils/isBrowser';
import { useAppState } from '../../../../contexts/appStateContext';
import DisplayName from '../../../atoms/DisplayName';
import { useUiState } from '../../../../contexts/uiStateContext';

const WaitingForResponseBox = dynamic(
  () => import('../../../molecules/decision/waiting/WaitingForResponseBox')
);
const AcWaitingOptionsSection = dynamic(
  () =>
    import(
      '../../../molecules/decision/waiting/auction/AcWaitingOptionsSection'
    )
);
const CommentsBottomSection = dynamic(
  () => import('../../../molecules/decision/common/CommentsBottomSection')
);

interface IPostAwaitingResponseAC {
  post: newnewapi.Auction;
}

const PostAwaitingResponseAC: React.FunctionComponent<IPostAwaitingResponseAC> =
  React.memo(({ post }) => {
    const { t } = useTranslation('page-Post');
    const { mutedMode, toggleMutedMode } = useUiState();
    const { resizeMode } = useAppState();
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const { handleGoBackInsidePost } = usePostInnerState();

    const isPageVisible = usePageVisibility();

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
          ? 'acPostAwaiting.hero.expires.days_singular'
          : 'acPostAwaiting.hero.expires.days'
      )} ${dhms.hours !== '0' ? dhms.hours : ''} ${t(
        dhms.hours !== '0'
          ? dhms.hours === '1'
            ? 'acPostAwaiting.hero.expires.hours_singular'
            : 'acPostAwaiting.hero.expires.hours'
          : ('' as any)
      )}`;

      if (dhms.days === '0') {
        countdownsrt = `${dhms.hours} ${t(
          dhms.hours === '1'
            ? 'acPostAwaiting.hero.expires.hours_singular'
            : 'acPostAwaiting.hero.expires.hours'
        )} ${dhms.minutes} ${t(
          dhms.minutes === '1'
            ? 'acPostAwaiting.hero.expires.minutes_singular'
            : 'acPostAwaiting.hero.expires.minutes'
        )}`;
        if (dhms.hours === '0') {
          countdownsrt = `${dhms.minutes} ${t(
            dhms.minutes === '1'
              ? 'acPostAwaiting.hero.expires.minutes_singular'
              : 'acPostAwaiting.hero.expires.minutes'
          )} ${dhms.seconds} ${t(
            dhms.seconds === '1'
              ? 'acPostAwaiting.hero.expires.seconds_singular'
              : 'acPostAwaiting.hero.expires.seconds'
          )}`;
          if (dhms.minutes === '0') {
            countdownsrt = `${dhms.seconds} ${t(
              dhms.seconds === '1'
                ? 'acPostAwaiting.hero.expires.seconds_singular'
                : 'acPostAwaiting.hero.expires.seconds'
            )}`;
          }
        }
      }
      countdownsrt = `${countdownsrt} `;
      return countdownsrt;
    }, [parsedTimeToDeadline, t]);

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
          <SActivitiesContainer>
            <WaitingForResponseBox
              title={t('acPostAwaiting.hero.title')}
              body={
                <Trans
                  t={t}
                  i18nKey='acPostAwaiting.hero.body'
                  // @ts-ignore
                  components={[
                    <DisplayName user={post.creator} inverted />,
                    { time: waitingTime },
                  ]}
                />
              }
            />
            <SCreatorInfoDiv>
              <SCreator>
                <Link href={`/${post.creator?.username}`}>
                  <SLinkElement href={`/${post.creator?.username}`}>
                    <SCreatorImage src={post.creator?.avatarUrl ?? ''} />
                  </SLinkElement>
                </Link>
                <Link href={`/${post.creator?.username}`}>
                  <SLinkElement shrinkable href={`/${post.creator?.username}`}>
                    <SWantsToKnow>
                      <Trans
                        t={t}
                        i18nKey='acPostAwaiting.wantsToKnow'
                        components={[<DisplayName user={post.creator} />]}
                      />
                    </SWantsToKnow>
                  </SLinkElement>
                </Link>
              </SCreator>
              {post.totalAmount?.usdCents && post.totalAmount?.usdCents > 0 ? (
                <STotal>
                  {`$${formatNumber(
                    post.totalAmount.usdCents / 100 ?? 0,
                    true
                  )}`}{' '}
                  <span>{t('acPostAwaiting.inTotalBids')}</span>
                </STotal>
              ) : null}
            </SCreatorInfoDiv>
            <SPostTitle variant={4}>
              <PostTitleContent>{post.title}</PostTitleContent>
            </SPostTitle>
            <SSeparator />
            <AcWaitingOptionsSection post={post} />
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

export default PostAwaitingResponseAC;

const SWrapper = styled.div`
  width: 100%;

  margin-bottom: 32px;

  ${({ theme }) => theme.media.tablet} {
    display: flex;
    gap: 16px;

    height: 648px;
    min-height: 0;
    align-items: flex-start;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 728px;

    display: flex;
    gap: 32px;
  }
`;

const SActivitiesContainer = styled.div`
  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};
  overflow: hidden;
  border-radius: 16px;

  margin-top: 16px;

  ${({ theme }) => theme.media.tablet} {
    display: flex;
    flex-direction: column;

    margin-top: 0px;
    min-height: 506px;

    height: 506px;

    background-color: transparent;
  }

  ${({ theme }) => theme.media.laptop} {
    height: 728px;
    max-height: 728px;
    width: 100%;
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

// Go back mobile
const SGoBackMobileSection = styled.div`
  position: relative;

  display: flex;
  justify-content: flex-start;

  width: 100%;
  height: 56px;
`;

const SGoBackButton = styled(GoBackButton)``;
