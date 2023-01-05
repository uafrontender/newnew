/* eslint-disable no-nested-ternary */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable arrow-body-style */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { Trans, useTranslation } from 'next-i18next';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import { toggleMutedMode } from '../../../../redux-store/slices/uiStateSlice';
import { getMcOption } from '../../../../api/endpoints/multiple_choice';

// Utils
import Headline from '../../../atoms/Headline';
import PostVideoSuccess from '../../../molecules/decision/success/PostVideoSuccess';

import { formatNumber } from '../../../../utils/format';
import getDisplayname from '../../../../utils/getDisplayname';
import assets from '../../../../constants/assets';
import { fetchPostByUUID } from '../../../../api/endpoints/post';
import PostTitleContent from '../../../atoms/PostTitleContent';
import { Mixpanel } from '../../../../utils/mixpanel';
import VerificationCheckmark from '../../../../public/images/svg/icons/filled/Verification.svg';
import InlineSvg from '../../../atoms/InlineSVG';

const McSuccessOptionsTab = dynamic(
  () =>
    import(
      '../../../molecules/decision/success/multiple_choice/McSuccessOptionsTab'
    )
);
const CommentsBottomSection = dynamic(
  () => import('../../../molecules/decision/common/CommentsBottomSection')
);
const DecisionEndedBox = dynamic(
  () => import('../../../molecules/decision/success/DecisionEndedBox')
);

interface IPostSuccessMC {
  post: newnewapi.MultipleChoice;
}

const PostSuccessMC: React.FunctionComponent<IPostSuccessMC> = React.memo(
  ({ post }) => {
    const { t } = useTranslation('page-Post');
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state);
    const { resizeMode, mutedMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
      resizeMode
    );

    const activitiesContainerRef = useRef<HTMLDivElement | null>(null);

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
    const fetchPostLatestData = useCallback(async () => {
      try {
        const fetchPostPayload = new newnewapi.GetPostRequest({
          postUuid: post.postUuid,
        });

        const res = await fetchPostByUUID(fetchPostPayload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'Request failed');

        if (res.data.multipleChoice?.isResponseViewedByMe) {
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

    // Main screen vs all options
    const [openedMainSection, setOpenedMainSection] = useState<
      'main' | 'options'
    >('main');

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
          <PostVideoSuccess
            postUuid={post.postUuid}
            announcement={post.announcement!!}
            response={post.response ?? undefined}
            additionalResponses={post.additionalResponses}
            responseViewed={responseViewed}
            openedTab={videoTab}
            setOpenedTab={(tab) => setVideoTab(tab)}
            isMuted={mutedMode}
            handleToggleMuted={() => handleToggleMutedMode()}
            handleSetResponseViewed={(newValue) => setResponseViewed(newValue)}
          />
          <SActivitiesContainer
            dimmedBackground={openedMainSection === 'main'}
            ref={activitiesContainerRef}
          >
            {openedMainSection === 'main' ? (
              <>
                <DecisionEndedBox
                  type='mc'
                  imgSrc={
                    theme.name === 'light'
                      ? assets.common.mc.lightMcAnimated()
                      : assets.common.mc.darkMcAnimated()
                  }
                >
                  {t('mcPostSuccess.heroText')}
                </DecisionEndedBox>
                <SMainSectionWrapper>
                  <SCreatorInfoDiv>
                    <SCreator>
                      <Link href={`/${post.creator?.username}`}>
                        <a href={`/${post.creator?.username}`}>
                          <SCreatorImage src={post.creator?.avatarUrl ?? ''} />
                        </a>
                      </Link>
                      <Link href={`/${post.creator?.username}`}>
                        <a href={`/${post.creator?.username}`}>
                          <SWantsToKnow>
                            <Trans
                              t={t}
                              i18nKey='mcPostSuccess.wantsToKnow'
                              // @ts-ignore
                              components={[
                                post.creator?.options?.isVerified ? (
                                  <SInlineSVG
                                    svg={VerificationCheckmark}
                                    width='16px'
                                    height='16px'
                                    fill='none'
                                  />
                                ) : null,
                                { creator: getDisplayname(post.creator) },
                              ]}
                            />
                          </SWantsToKnow>
                        </a>
                      </Link>
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
                              _component: 'PostSuccessMC',
                            });
                          }}
                          onClick={() => {
                            setOpenedMainSection('options');

                            if (activitiesContainerRef.current && isMobile) {
                              activitiesContainerRef.current.scrollIntoView({
                                behavior: 'smooth',
                              });
                            }
                          }}
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
                              _component: 'PostSuccessMC',
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
                              _component: 'PostSuccessMC',
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
                              _component: 'PostSuccessMC',
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
            ) : (
              <McSuccessOptionsTab
                post={post}
                handleGoBack={() => {
                  Mixpanel.track('Go Back', {
                    _stage: 'Post',
                    _postUuid: post.postUuid,
                    _component: 'PostSuccessMC',
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
              commentsRoomId={post.commentsRoomId as number}
            />
          </SCommentsSection>
        )}
      </>
    );
  }
);

export default PostSuccessMC;

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
  display: inline-flex;
  align-items: center;
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

const SInlineSVG = styled(InlineSvg)`
  margin-right: 2px;
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
  white-space: pre-wrap;
  word-break: break-word;

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
