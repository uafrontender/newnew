/* eslint-disable no-unneeded-ternary */
import React, {
  useRef,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import moment from 'moment';
import dynamic from 'next/dynamic';
import compact from 'lodash/compact';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { useUpdateEffect } from 'react-use';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';
import Headline from '../../../atoms/Headline';
import InlineSVG from '../../../atoms/InlineSVG';
import ReCaptchaV2 from '../../../atoms/ReCaptchaV2';
import LoadingView from '../../../atoms/ScrollRestorationAnimationContainer';
import PostTitleContent from '../../../atoms/PostTitleContent';

import { createPost } from '../../../../api/endpoints/post';
import { maxLength, minLength } from '../../../../utils/validation';
import { useAppSelector } from '../../../../redux-store/store';

import {
  CREATION_TITLE_MIN,
  CREATION_TITLE_MAX,
  OPTION_LENGTH_MIN,
  OPTION_LENGTH_MAX,
} from '../../../../constants/general';

import chevronLeftIcon from '../../../../public/images/svg/icons/outlined/ChevronLeft.svg';
import useLeavePageConfirm from '../../../../utils/hooks/useLeavePageConfirm';
import urltoFile from '../../../../utils/urlToFile';
import { getCoverImageUploadUrl } from '../../../../api/endpoints/upload';

import { Mixpanel } from '../../../../utils/mixpanel';
import useErrorToasts, {
  ErrorToastPredefinedMessage,
} from '../../../../utils/hooks/useErrorToasts';
import { I18nNamespaces } from '../../../../@types/i18next';
import useRecaptcha from '../../../../utils/hooks/useRecaptcha';
import { useAppState } from '../../../../contexts/appStateContext';
import { usePostCreationState } from '../../../../contexts/postCreationContext';
import { SocketContext } from '../../../../contexts/socketContext';
import waitResourceIsAvailable from '../../../../utils/checkResourceAvailable';
import useGoBackOrRedirect from '../../../../utils/useGoBackOrRedirect';
import isBrowser from '../../../../utils/isBrowser';

const VideojsPlayer = dynamic(() => import('../../../atoms/VideojsPlayer'), {
  ssr: false,
});
const PublishedModal = dynamic(
  () => import('../../../molecules/creation/PublishedModal')
);

interface IPreviewContent {}

export const PreviewContent: React.FC<IPreviewContent> = () => {
  const { t: tCommon } = useTranslation();
  const { t } = useTranslation('page-Creation');
  const { showErrorToastCustom } = useErrorToasts();
  const theme = useTheme();
  const router = useRouter();
  const { goBackOrRedirect } = useGoBackOrRedirect();
  const playerRef: any = useRef(null);
  const { showErrorToastPredefined } = useErrorToasts();

  const [showModal, setShowModal] = useState(false);

  // Socket
  const { socketConnection } = useContext(SocketContext);

  const {
    postInCreation,
    setPostData,
    setCreationStartDate,
    clearCreation,
    setCreationFileUploadError,
    setCreationFileProcessingETA,
    setCreationFileProcessingProgress,
    setCreationFileProcessingLoading,
  } = usePostCreationState();

  const {
    post,
    auction,
    crowdfunding,
    multiplechoice,
    videoProcessing,
    fileProcessing,
    customCoverImageUrl,
  } = useMemo(() => postInCreation, [postInCreation]);

  const { userData } = useAppSelector((state) => state.user);

  const validateText = useCallback(
    (text: string, min: number, max: number) => {
      let error = minLength(tCommon, text.trim(), min);

      if (!error) {
        error = maxLength(tCommon, text.trim(), max);
      }

      return error;
    },
    [tCommon]
  );
  const { resizeMode } = useAppState();
  const {
    query: { tab },
  } = router;
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);
  const isDesktop = !isMobile && !isTablet;

  const [isDisabledAdditionally, setIsDisabledAdditionally] = useState(false);
  const [isGoingToHomepage, setIsGoingToHomepage] = useState(false);

  const allowedRoutes = useMemo(
    () => [
      '/creation',
      '/creation/auction',
      '/creation/multiple-choice',
      '/creation/crowdfunding',
      '/creation/auction/preview',
      '/creation/multiple-choice/preview',
      '/creation/crowdfunding/preview',
      '/creation/auction/published',
      '/creation/multiple-choice/published',
      '/creation/crowdfunding/published',
      ...(isDesktop ? ['/'] : []),
    ],
    [isDesktop]
  );

  useLeavePageConfirm(
    showModal || !post.title ? false : true,
    t('secondStep.modal.leave.message'),
    allowedRoutes
  );

  const titleIsValid = !validateText(
    post.title,
    CREATION_TITLE_MIN,
    CREATION_TITLE_MAX
  );

  const optionsAreValid =
    tab !== 'multiple-choice' ||
    multiplechoice.choices.findIndex(
      (item: newnewapi.CreateMultipleChoiceBody.IOption) =>
        validateText(item.text as string, OPTION_LENGTH_MIN, OPTION_LENGTH_MAX)
    ) === -1;

  const formatStartsAt: () => any = useCallback(() => {
    const time = moment(
      `${post.startsAt.time} ${post.startsAt['hours-format']}`,
      ['hh:mm a']
    );

    return moment(post.startsAt.date)
      .hours(time.hours())
      .minutes(time.minutes());
  }, [post.startsAt]);

  const formatExpiresAt: (inSeconds?: boolean) => any = useCallback(
    (inSeconds = false) => {
      const time = moment(
        `${post.startsAt.time} ${post.startsAt['hours-format']}`,
        ['hh:mm a']
      );
      const dateValue = moment(post.startsAt.date)
        .hours(time.hours())
        .minutes(time.minutes());
      let seconds = 0;

      if (post.expiresAt === '1-hour') {
        dateValue.add(1, 'h');
        seconds = 3600;
      } else if (post.expiresAt === '3-hours') {
        dateValue.add(3, 'h');
        seconds = 10800;
      } else if (post.expiresAt === '6-hours') {
        seconds = 21600;
        dateValue.add(6, 'h');
      } else if (post.expiresAt === '12-hours') {
        seconds = 43200;
        dateValue.add(12, 'h');
      } else if (post.expiresAt === '1-day') {
        seconds = 86400;
        dateValue.add(1, 'd');
      } else if (post.expiresAt === '3-days') {
        seconds = 259200;
        dateValue.add(3, 'd');
      } else if (post.expiresAt === '5-days') {
        seconds = 432000;
        dateValue.add(5, 'd');
      } else if (post.expiresAt === '7-days') {
        seconds = 604800;
        dateValue.add(7, 'd');
      } else if (post.expiresAt === '2-minutes') {
        seconds = 120;
        dateValue.add(2, 'm');
      } else if (post.expiresAt === '5-minutes') {
        seconds = 300;
        dateValue.add(5, 'm');
      } else if (post.expiresAt === '10-minutes') {
        seconds = 600;
        dateValue.add(10, 'm');
      }

      return inSeconds ? seconds : dateValue;
    },
    [post.expiresAt, post.startsAt]
  );

  const handleClose = useCallback(() => {
    Mixpanel.track('Post Edit', { _stage: 'Creation' });
    goBackOrRedirect('/creation');
  }, [goBackOrRedirect]);

  const handleCloseModal = useCallback(() => {
    setIsGoingToHomepage(true);
    setShowModal(false);
    router.push('/');
    clearCreation();
  }, [router, clearCreation]);

  const handleSubmit = useCallback(async () => {
    Mixpanel.track('Publish Post', { _stage: 'Creation' });
    try {
      let hasCoverImage = false;

      if (customCoverImageUrl) {
        const coverImageFile = await urltoFile(
          customCoverImageUrl,
          'coverImage',
          'image/jpeg'
        );
        const videoFileSubdirectory = post.announcementVideoUrl
          .split('/')
          .slice(-2, -1)
          .join('');

        const imageUrlPayload = new newnewapi.GetCoverImageUploadUrlRequest({
          videoFileSubdirectory,
          videoTargetType: newnewapi.VideoTargetType.ANNOUNCEMENT,
        });

        const res = await getCoverImageUploadUrl(imageUrlPayload);

        if (!res?.data || res.error) {
          throw new Error(res?.error?.message ?? 'An error occurred');
        }

        const uploadResponse = await fetch(res.data.uploadUrl, {
          method: 'PUT',
          body: coverImageFile,
          headers: {
            'Content-Type': 'image/jpeg',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload failed');
        }

        // Set hasCoverImage to true
        hasCoverImage = true;
      }

      const body: Omit<newnewapi.CreatePostRequest, 'toJSON'> = {
        post: {
          title: post.title,
          settings: post.options,
          startsAt:
            post.startsAt.type === 'right-away'
              ? null
              : {
                  seconds: formatStartsAt().unix(),
                },
          expiresAfter: {
            seconds: formatExpiresAt(true),
          },
          thumbnailParameters: {
            startTime: {
              seconds: post.thumbnailParameters.startTime,
            },
            endTime: {
              seconds: post.thumbnailParameters.endTime,
            },
          },
          announcementVideoUrl: post.announcementVideoUrl,
          hasCoverImage,
        },
      };

      if (tab === 'auction') {
        body.auction = {
          minimalBid: {
            usdCents: auction.minimalBid * 100,
          },
        };
      } else if (tab === 'multiple-choice') {
        body.multiplechoice = {
          options: multiplechoice.choices.map(
            (choice: newnewapi.CreateMultipleChoiceBody.IOption) => ({
              text: choice.text,
            })
          ),
          // TODO: remove as unused
          isSuggestionsAllowed: userData?.options?.isOfferingBundles,
        };
      } else if (tab === 'crowdfunding') {
        body.crowdfunding = {
          targetBackerCount: crowdfunding.targetBackerCount,
        };
      }

      const payload = new newnewapi.CreatePostRequest(body);

      const { data, error } = await createPost(payload);

      if (
        !data ||
        !data.post ||
        error ||
        data?.createPostStatus ===
          newnewapi.CreatePostResponse.CreatePostStatus.INVALID_VALUE
      ) {
        throw new Error(error?.message ?? 'Request failed');
      }

      setPostData(data.post);

      if (isMobile) {
        setIsDisabledAdditionally(true);
        router.push(`/creation/${tab}/published`);
      } else {
        playerRef?.current?.pause();
        setShowModal(true);
      }
    } catch (err: any) {
      if (err.message === 'Processing limit reached') {
        showErrorToastPredefined(
          ErrorToastPredefinedMessage.ProcessingLimitReachedError
        );
      } else if (err.message === 'Invalid date') {
        showErrorToastPredefined(ErrorToastPredefinedMessage.InvalidDateError);
      } else {
        showErrorToastCustom(err);
      }
    }
  }, [
    customCoverImageUrl,
    post.title,
    post.options,
    post.startsAt.type,
    post.thumbnailParameters.startTime,
    post.thumbnailParameters.endTime,
    post.announcementVideoUrl,
    formatStartsAt,
    formatExpiresAt,
    tab,
    setPostData,
    isMobile,
    auction.minimalBid,
    multiplechoice.choices,
    userData?.options?.isOfferingBundles,
    crowdfunding.targetBackerCount,
    router,
    showErrorToastPredefined,
    showErrorToastCustom,
  ]);

  const recaptchaRef = useRef(null);

  const {
    onChangeRecaptchaV2,
    isRecaptchaV2Required,
    submitWithRecaptchaProtection: handleSubmitWithRecaptchaProtection,
    errorMessage: recaptchaErrorMessage,
    isSubmitting,
  } = useRecaptcha(handleSubmit, recaptchaRef);

  useEffect(() => {
    if (recaptchaErrorMessage) {
      showErrorToastPredefined(recaptchaErrorMessage);
    }
  }, [recaptchaErrorMessage, showErrorToastPredefined]);

  const userTimezone = useMemo(() => {
    if (userData?.countryCode) {
      if (userData?.countryCode.toLocaleLowerCase() === 'us') {
        if (!userData.timeZone || !userData.timeZone.includes('America')) {
          return '';
        }
      }
    }

    return new Date()
      .toLocaleString('en', { timeZoneName: 'short' })
      .split(' ')
      .pop();
  }, [userData]);

  const disabled =
    isSubmitting ||
    !titleIsValid ||
    !post.title ||
    !post.announcementVideoUrl ||
    !optionsAreValid;

  const settings: any = useMemo(
    () =>
      compact([
        tab === 'auction' && {
          key: 'minimalBid',
          value: t('preview.values.minimalBid', { value: auction.minimalBid }),
        },
        tab === 'crowdfunding' && {
          key: 'targetBackerCount',
          value: crowdfunding.targetBackerCount,
        },
        {
          key: 'startsAt',
          value: `${formatStartsAt()
            .locale(router.locale || 'en-US')
            .format(`MMM DD YYYY[${t('at')}]hh:mm A`)} ${userTimezone}`,
        },
        {
          key: 'expiresAt',
          value: `${formatExpiresAt(false)
            .locale(router.locale || 'en-US')
            .format(`MMM DD YYYY[${t('at')}]hh:mm A`)} ${userTimezone}`,
        },
        {
          key: 'comments',
          value: t(
            `preview.values.${
              post.options.commentsEnabled
                ? 'comments-allowed'
                : 'comments-forbidden'
            }`
          ),
        },
        tab === 'multiple-choice' &&
          userData?.options?.isOfferingBundles && {
            key: 'allowSuggestions',
            value: t(`preview.values.allowSuggestions-allowed`),
          },
      ]),
    [
      t,
      tab,
      formatStartsAt,
      post.options.commentsEnabled,
      auction.minimalBid,
      crowdfunding.targetBackerCount,
      userData?.options?.isOfferingBundles,
      router.locale,
      formatExpiresAt,
      userTimezone,
    ]
  );
  const handleGoBack = useCallback(() => {
    goBackOrRedirect('/creation');
  }, [goBackOrRedirect]);

  const renderSetting = (item: any) => (
    <SItem key={item.key}>
      <SItemTitle variant={2} weight={600}>
        {t(
          `preview.settings.${
            item.key as keyof I18nNamespaces['page-Creation']['preview']['settings']
          }`
        )}
      </SItemTitle>
      <SItemValue variant={2} weight={600}>
        {item.value}
      </SItemValue>
    </SItem>
  );
  const renderChoice = (item: any) => (
    <SChoiceItem key={item.id}>
      <SChoiceItemTitle variant={2} weight={500}>
        {item.text}
      </SChoiceItemTitle>
    </SChoiceItem>
  );

  useUpdateEffect(() => {
    if (!post.title && !isGoingToHomepage) {
      router?.push('/creation');
    }
  }, [post.title, router, isGoingToHomepage]);

  // This effect results in the form re-rendering every second
  // However, it re renders after every letter typed anyway
  // TODO: optimize this view
  useEffect(() => {
    const updateStartDate = setInterval(() => {
      if (post.startsAt.type === 'right-away') {
        const newStartAt = {
          type: post.startsAt.type,
          date: moment().format(),
          time: moment().format('hh:mm'),
          'hours-format': post.startsAt['hours-format'],
        };
        setCreationStartDate(newStartAt);
      } else {
        const time = moment(
          `${post.startsAt.time} ${post.startsAt['hours-format']}`,
          ['hh:mm a']
        );

        const startsAt = moment(post.startsAt.date)
          .hours(time.hours())
          .minutes(time.minutes());

        if (startsAt.startOf('minute').unix() <= moment().unix()) {
          const newStartAt = {
            type: 'right-away',
            date: moment().format(),
            time: moment().format('hh:mm'),
            'hours-format': post.startsAt['hours-format'] as 'am' | 'pm',
          };
          setCreationStartDate(newStartAt);
        }
      }
    }, 1000);

    return () => {
      clearInterval(updateStartDate);
    };
  }, [post.startsAt, setCreationStartDate]);

  const handlerSocketUpdated = useCallback(
    async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.VideoProcessingProgress.decode(arr);

      if (!decoded) {
        return;
      }

      if (decoded.taskUuid === videoProcessing?.taskUuid) {
        if (
          decoded?.estimatedTimeLeft?.seconds &&
          !Number.isNaN(decoded.estimatedTimeLeft.seconds as number)
        ) {
          setCreationFileProcessingETA(
            decoded.estimatedTimeLeft.seconds as number
          );
        }

        if (decoded.fractionCompleted > fileProcessing.progress) {
          setCreationFileProcessingProgress(decoded.fractionCompleted);
        }

        if (
          decoded.fractionCompleted === 100 &&
          decoded.status ===
            newnewapi.VideoProcessingProgress.Status.SUCCEEDED &&
          videoProcessing.targetUrls?.hlsStreamUrl
        ) {
          const available = await waitResourceIsAvailable(
            videoProcessing.targetUrls?.hlsStreamUrl,
            {
              maxAttempts: 60,
              retryTimeMs: 1000,
            }
          );

          if (available) {
            setCreationFileProcessingLoading(false);
          } else {
            setCreationFileUploadError(true);
            showErrorToastPredefined(undefined);
          }
        } else if (
          decoded.status === newnewapi.VideoProcessingProgress.Status.FAILED
        ) {
          setCreationFileUploadError(true);
          showErrorToastPredefined(undefined);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [videoProcessing, fileProcessing]
  );

  useEffect(() => {
    if (socketConnection) {
      socketConnection?.on('VideoProcessingProgress', handlerSocketUpdated);
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off('VideoProcessingProgress', handlerSocketUpdated);
      }
    };
  }, [socketConnection, handlerSocketUpdated]);

  // Redirect if post state is empty
  useEffect(() => {
    if (!post.title) {
      router.push('/profile/my-posts');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear creation on popstate after modal was shown
  useEffect(() => {
    const handlePopstate = () => {
      clearCreation();
    };

    if (isBrowser()) {
      if (showModal) {
        window?.addEventListener('popstate', handlePopstate);
      } else {
        window?.removeEventListener('popstate', handlePopstate);
      }
    }

    return () => {
      window?.removeEventListener('popstate', handlePopstate);
    };
  });

  if (!post.title) {
    return <LoadingView />;
  }

  if (isMobile) {
    return (
      <>
        {isGoingToHomepage && <LoadingView />}
        <PublishedModal open={showModal} handleClose={handleCloseModal} />
        <SContent>
          <STopLine>
            <SInlineSVG
              clickable
              svg={chevronLeftIcon}
              fill={theme.colorsThemed.text.secondary}
              width='20px'
              height='20px'
              onClick={handleGoBack}
            />
            <SHeadlineMobile variant={2} weight={600}>
              <PostTitleContent>{post.title}</PostTitleContent>
            </SHeadlineMobile>
          </STopLine>
          {tab === 'multiple-choice' && (
            <SChoices>{multiplechoice.choices.map(renderChoice)}</SChoices>
          )}
          <SSettings>{settings.map(renderSetting)}</SSettings>
          <SPlayerWrapper>
            {fileProcessing.progress === 100 ? (
              <VideojsPlayer
                id='preview-mobile'
                withMuteControl
                resources={videoProcessing?.targetUrls}
                showPlayButton
                withScrubber
              />
            ) : (
              <SText variant={2}>{t('videoBeingProcessedCaption')}</SText>
            )}
          </SPlayerWrapper>
        </SContent>
        <SButtonWrapper>
          {isRecaptchaV2Required && (
            <SReCaptchaV2 ref={recaptchaRef} onChange={onChangeRecaptchaV2} />
          )}
          <SButtonContent>
            <SButton
              view='primaryGrad'
              loading={isSubmitting}
              onClick={handleSubmitWithRecaptchaProtection}
              disabled={disabled || isDisabledAdditionally}
            >
              {t('preview.button.submit')}
            </SButton>
          </SButtonContent>
        </SButtonWrapper>
      </>
    );
  }

  return (
    <>
      {isGoingToHomepage && <LoadingView />}
      <PublishedModal open={showModal} handleClose={handleCloseModal} />
      <STabletContent>
        <SLeftPart>
          <STabletPlayer>
            {fileProcessing.progress === 100 ? (
              <VideojsPlayer
                withMuteControl
                id='preview'
                innerRef={playerRef}
                resources={videoProcessing?.targetUrls}
                mutePosition='left'
                borderRadius='16px'
                showPlayButton
                withScrubber
              />
            ) : (
              <SText variant={2}>{t('videoBeingProcessedCaption')}</SText>
            )}
          </STabletPlayer>
        </SLeftPart>
        <SRightPart>
          <SHeadLine variant={3} weight={600}>
            {t(`preview.title-${router?.query?.tab}` as any)}
          </SHeadLine>
          <SHeadline variant={5}>
            <PostTitleContent>{post.title}</PostTitleContent>
          </SHeadline>
          {tab === 'multiple-choice' && (
            <SChoices>{multiplechoice.choices.map(renderChoice)}</SChoices>
          )}
          <SSettings>{settings.map(renderSetting)}</SSettings>

          <SButtonsContainer>
            {isRecaptchaV2Required && (
              <SReCaptchaV2 ref={recaptchaRef} onChange={onChangeRecaptchaV2} />
            )}
            <SButtonsWrapper>
              <Button
                view='secondary'
                onClick={handleClose}
                disabled={isSubmitting}
              >
                {t('preview.button.edit')}
              </Button>
              <Button
                id='publish'
                view='primaryGrad'
                loading={isSubmitting}
                onClick={handleSubmitWithRecaptchaProtection}
                disabled={disabled}
              >
                {t('preview.button.submit')}
              </Button>
            </SButtonsWrapper>
          </SButtonsContainer>
        </SRightPart>
      </STabletContent>
    </>
  );
};

export default PreviewContent;

const SContent = styled.div`
  display: flex;
  margin-top: 20px;
  flex-direction: column;
`;

const STabletContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const SHeadLine = styled(Text)`
  text-align: start;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 26px 0;

  ${({ theme }) => theme.media.laptop} {
    padding: 8px 0;
    margin-bottom: 40px;
  }
`;

const SLeftPart = styled.div`
  flex: 1;
  max-width: calc(50% - 76px);
  margin-right: 76px;
  margin-top: 70px;

  ${({ theme }) => theme.media.laptop} {
    max-width: 352px;
    margin-right: 16px;
    margin-top: 86px;
  }
`;

const STabletPlayer = styled.div`
  width: 284px;
  height: 500px;
`;

const SRightPart = styled.div`
  flex: 1;
  display: flex;
  max-width: 50%;
  flex-direction: column;

  ${({ theme }) => theme.media.laptop} {
    max-width: 352px;
    margin-left: 16px;
  }
`;

const SButton = styled(Button)`
  width: 100%;
  padding: 16px 20px;

  &:disabled {
    cursor: default;
    opacity: 1;
    outline: none;

    :after {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: '';
      opacity: 1;
      z-index: 6;
      position: absolute;
      background: ${(props) => props.theme.colorsThemed.button.disabled};
    }
  }
`;

const SButtonWrapper = styled.div`
  left: 0;
  width: 100%;
  bottom: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: fixed;
  background: ${(props) => props.theme.gradients.creationSubmit};
`;

const SButtonContent = styled.div`
  width: 100%;
`;

const SHeadline = styled(Headline)`
  margin-bottom: 18px;
  word-break: break-word;
`;

const SHeadlineMobile = styled(Caption)`
  display: -webkit-box;
  overflow: hidden;
  position: relative;
  padding-left: 8px;
  white-space: pre-wrap;
  word-break: break-word;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

const SSettings = styled.div`
  display: flex;
  flex-direction: column;
`;

const SChoices = styled.div`
  display: flex;
  margin-bottom: 18px;
  flex-direction: column;
`;

const SItem = styled.div`
  display: flex;
  padding: 6px 0;
  align-items: center;
  justify-content: space-between;
`;

const SItemTitle = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.secondary};
  white-space: nowrap;
  flex-shrink: 0;
  margin-right: 8px;
`;

const SItemValue = styled(Text)`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const SChoiceItem = styled.div`
  margin: 6px 0;
  display: flex;
  padding: 12px;
  overflow: hidden;
  background: ${(props) => props.theme.colorsThemed.background.tertiary};
  align-items: center;
  border-radius: 16px;
`;

const SChoiceItemTitle = styled(Text)`
  margin-left: 12px;
`;

const SPlayerWrapper = styled.div`
  left: -16px;
  width: 100vw;
  height: 635px;
  position: relative;
  margin-top: 42px;
`;

const SButtonsContainer = styled.div`
  position: relative;
  margin-top: 26px;
`;

const SButtonsWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const STopLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  flex-direction: row;
`;

const SInlineSVG = styled(InlineSVG)`
  min-width: 20px;
  min-height: 20px;
`;

const SText = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  text-align: center;
`;

const SReCaptchaV2 = styled(ReCaptchaV2)`
  margin-bottom: 10px;
  position: relative;
  left: calc((100% - 304px) / 2);

  ${({ theme }) => theme.media.tablet} {
    left: 0;
  }
`;
