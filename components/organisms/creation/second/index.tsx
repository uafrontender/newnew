/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-expressions */
import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';
import FileUpload from '../../../molecules/creation/FileUpload';
import Tabs, { Tab } from '../../../molecules/Tabs';
import TabletStartDate from '../../../molecules/creation/TabletStartDate';

import useDebounce from '../../../../utils/hooks/useDebounce';
import { validateText } from '../../../../api/endpoints/infrastructure';
import { SocketContext } from '../../../../contexts/socketContext';
import { minLength, maxLength } from '../../../../utils/validation';
import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
import { useGetAppConstants } from '../../../../contexts/appConstantsContext';
import {
  getVideoUploadUrl,
  removeUploadedFile,
  stopVideoProcessing,
  startVideoProcessing,
} from '../../../../api/endpoints/upload';
import {
  setCreationVideo,
  setCreationTitle,
  setCreationMinBid,
  setCreationChoices,
  setCreationComments,
  setCreationStartDate,
  setCreationExpireDate,
  setCreationFileUploadETA,
  setCreationFileUploadError,
  setCreationVideoThumbnails,
  setCreationVideoProcessing,
  setCreationTargetBackerCount,
  setCreationFileUploadLoading,
  setCreationFileUploadProgress,
  setCreationFileProcessingETA,
  setCreationFileProcessingProgress,
  setCreationFileProcessingError,
  setCreationFileProcessingLoading,
} from '../../../../redux-store/slices/creationStateSlice';

import {
  CREATION_TITLE_MIN,
  CREATION_TITLE_MAX,
  CREATION_OPTION_MIN,
} from '../../../../constants/general';

import closeIcon from '../../../../public/images/svg/icons/outlined/Close.svg';
import { markTutorialStepAsCompleted } from '../../../../api/endpoints/user';
import { setUserTutorialsProgress } from '../../../../redux-store/slices/userStateSlice';
import waitResourceIsAvailable from '../../../../utils/checkResourceAvailable';
import getChunks from '../../../../utils/getChunks/getChunks';
import { Mixpanel } from '../../../../utils/mixpanel';
import { useOverlayMode } from '../../../../contexts/overlayModeContext';
import VerificationCheckmark from '../../../../public/images/svg/icons/filled/Verification.svg';
import InlineSvg from '../../../atoms/InlineSVG';
import useErrorToasts, {
  ErrorToastPredefinedMessage,
} from '../../../../utils/hooks/useErrorToasts';
import getDisplayname from '../../../../utils/getDisplayname';
import RichTextInput from '../../../atoms/creation/RichTextInput';

const BitmovinPlayer = dynamic(() => import('../../../atoms/BitmovinPlayer'), {
  ssr: false,
});
const HeroPopup = dynamic(
  () => import('../../../molecules/creation/HeroPopup')
);
const InlineSVG = dynamic(() => import('../../../atoms/InlineSVG'));
const DraggableMobileOptions = dynamic(
  () => import('../DraggableMobileOptions')
);
const TabletFieldBlock = dynamic(
  () => import('../../../molecules/creation/TabletFieldBlock')
);
const MobileFieldBlock = dynamic(
  () => import('../../../molecules/creation/MobileFieldBlock')
);
const MobileField = dynamic(
  () => import('../../../molecules/creation/MobileField')
);
const UserAvatar = dynamic(() => import('../../../molecules/UserAvatar'));

interface ICreationSecondStepContent {}

export const CreationSecondStepContent: React.FC<
  ICreationSecondStepContent
> = () => {
  const { t: tCommon } = useTranslation();
  const { t } = useTranslation('page-Creation');
  const { showErrorToastPredefined } = useErrorToasts();
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const playerRef: any = useRef(null);
  const xhrRef = useRef<XMLHttpRequest>();
  const {
    post,
    auction,
    fileUpload,
    fileProcessing,
    crowdfunding,
    multiplechoice,
    videoProcessing,
  } = useAppSelector((state) => state.creation);
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const { overlayModeEnabled } = useOverlayMode();

  const { appConstants } = useGetAppConstants();

  const cfFormattedDescription = useMemo(() => {
    if (
      appConstants?.standardPledgeAmounts?.length > 0 &&
      appConstants.standardPledgeAmounts[0].usdCents
    ) {
      return Math.round(appConstants.standardPledgeAmounts[0].usdCents / 100);
    }
    return Math.round(appConstants.minCfPledge / 100);
  }, [appConstants.standardPledgeAmounts, appConstants.minCfPledge]);

  const {
    query: { tab },
  } = router;
  const tabs: Tab[] = useMemo(
    () => [
      {
        nameToken: 'auction',
        url: '/creation/auction',
      },
      {
        nameToken: 'multiple-choice',
        url: '/creation/multiple-choice',
      },
      /* {
        nameToken: 'crowdfunding',
        url: '/creation/crowdfunding',
      }, */
    ],
    []
  );
  const [titleError, setTitleError] = useState('');

  const [isTutorialVisible, setIsTutorialVisible] = useState(false);
  const [tutorialType, setTutorialType] = useState<'AC' | 'MC' | 'CF'>('AC');

  // Socket
  const socketConnection = useContext(SocketContext);

  const validateTextAPI = useCallback(
    async (text: string, kind: newnewapi.ValidateTextRequest.Kind) => {
      if (!text) {
        return '';
      }

      try {
        const payload = new newnewapi.ValidateTextRequest({
          kind,
          text,
        });

        const res = await validateText(payload);

        if (!res?.data?.status) throw new Error('An error occurred');

        switch (res.data.status) {
          case newnewapi.ValidateTextResponse.Status.TOO_SHORT:
            return tCommon('error.text.min');
          case newnewapi.ValidateTextResponse.Status.TOO_LONG:
            return tCommon('error.text.max');
          case newnewapi.ValidateTextResponse.Status.INAPPROPRIATE:
            return tCommon('error.text.badWords');
          case newnewapi.ValidateTextResponse.Status.ATTEMPT_AT_REDIRECTION:
            return tCommon('error.text.containsLinks');
          case newnewapi.ValidateTextResponse.Status.OK:
          default:
            break;
        }

        return '';
      } catch (err) {
        return '';
      }
    },
    [tCommon]
  );
  const validateT = useCallback(
    async (
      text: string,
      min: number,
      max: number,
      type: newnewapi.ValidateTextRequest.Kind
    ) => {
      let error = minLength(tCommon, text, min);

      if (!error) {
        error = maxLength(tCommon, text, max);
      }

      if (!error) {
        error = await validateTextAPI(text, type);
      }

      return error;
    },
    [tCommon, validateTextAPI]
  );

  const validateMcOption = useCallback(
    async (
      text: string,
      min: number,
      max: number,
      type: newnewapi.ValidateTextRequest.Kind,
      index: number
    ) => {
      const error = await validateT(text, min, max, type);

      if (error) {
        setInvalidMcOptionsIndicies((curr) => {
          const newSet = new Set([...curr]);

          newSet.add(index);

          return newSet;
        });
      } else {
        setInvalidMcOptionsIndicies((curr) => {
          const newSet = new Set([...curr]);

          newSet.delete(index);

          return newSet;
        });
      }

      return error;
    },
    [validateT]
  );

  const activeTabIndex = tabs.findIndex((el) => el.nameToken === tab);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);
  const isDesktop = !isMobile && !isTablet;

  const [invalidMcOptionsIndicies, setInvalidMcOptionsIndicies] = useState<
    Set<number>
  >(new Set());
  const optionsAreValid = useMemo(
    () =>
      tab !== 'multiple-choice' ||
      (invalidMcOptionsIndicies.size === 0 &&
        multiplechoice.choices.filter(
          (o) => o.text.length < CREATION_OPTION_MIN
        ).length === 0),
    [tab, invalidMcOptionsIndicies.size, multiplechoice.choices]
  );

  const targetBackersValid =
    tab !== 'crowdfunding' ||
    (crowdfunding.targetBackerCount && crowdfunding?.targetBackerCount >= 1);

  const validateTitleDebounced = useDebounce(post.title, 500);
  const formatStartsAt = useCallback(() => {
    const time = moment(
      `${post.startsAt.time} ${post.startsAt['hours-format']}`,
      ['hh:mm a']
    );

    return moment(post.startsAt.date)
      .hours(time.hours())
      .minutes(time.minutes());
  }, [post.startsAt]);

  const formatExpiresAt = useCallback(() => {
    const time = moment(
      `${post.startsAt.time} ${post.startsAt['hours-format']}`,
      ['hh:mm a']
    );
    const dateValue = moment(post.startsAt.date)
      .hours(time.hours())
      .minutes(time.minutes());

    if (post.expiresAt === '1-hour') {
      dateValue.add(1, 'h');
    } else if (post.expiresAt === '3-hours') {
      dateValue.add(3, 'h');
    } else if (post.expiresAt === '6-hours') {
      dateValue.add(6, 'h');
    } else if (post.expiresAt === '12-hours') {
      dateValue.add(12, 'h');
    } else if (post.expiresAt === '1-day') {
      dateValue.add(1, 'd');
    } else if (post.expiresAt === '3-days') {
      dateValue.add(3, 'd');
    } else if (post.expiresAt === '5-days') {
      dateValue.add(5, 'd');
    } else if (post.expiresAt === '7-days') {
      dateValue.add(7, 'd');
    } else if (post.expiresAt === '2-minutes') {
      dateValue.add(2, 'm');
    } else if (post.expiresAt === '5-minutes') {
      dateValue.add(5, 'm');
    } else if (post.expiresAt === '10-minutes') {
      dateValue.add(10, 'm');
    }

    return dateValue;
  }, [post.expiresAt, post.startsAt]);

  const disabled = useMemo(
    () =>
      !!titleError ||
      !post.title ||
      !post.announcementVideoUrl ||
      !optionsAreValid ||
      !targetBackersValid ||
      formatExpiresAt().unix() < moment().unix() ||
      (post.startsAt.type !== 'right-away' &&
        formatStartsAt().unix() < moment().unix()),
    [
      formatExpiresAt,
      formatStartsAt,
      optionsAreValid,
      post.announcementVideoUrl,
      post.startsAt.type,
      post.title,
      targetBackersValid,
      titleError,
    ]
  );

  const formatExpiresAtNoStartsAt = useCallback(() => {
    const dateValue = moment();

    if (post.expiresAt === '1-hour') {
      dateValue.add(1, 'h');
    } else if (post.expiresAt === '3-hours') {
      dateValue.add(3, 'h');
    } else if (post.expiresAt === '6-hours') {
      dateValue.add(6, 'h');
    } else if (post.expiresAt === '12-hours') {
      dateValue.add(12, 'h');
    } else if (post.expiresAt === '1-day') {
      dateValue.add(1, 'd');
    } else if (post.expiresAt === '3-days') {
      dateValue.add(3, 'd');
    } else if (post.expiresAt === '5-days') {
      dateValue.add(5, 'd');
    } else if (post.expiresAt === '7-days') {
      dateValue.add(7, 'd');
    } else if (post.expiresAt === '2-minutes') {
      dateValue.add(2, 'm');
    } else if (post.expiresAt === '5-minutes') {
      dateValue.add(5, 'm');
    } else if (post.expiresAt === '10-minutes') {
      dateValue.add(10, 'm');
    }

    return dateValue;
  }, [post.expiresAt]);

  const handleSubmit = useCallback(async () => {
    Mixpanel.track('Creation Preview Button Click', { _stage: 'Creation' });

    // Validate title as the previous validation might be outdated due to debounce,
    // or title input being focused
    const errorText = await validateT(
      post?.title,
      CREATION_TITLE_MIN,
      CREATION_TITLE_MAX,
      newnewapi.ValidateTextRequest.Kind.POST_TITLE
    );

    if (errorText) {
      setTitleError(errorText);
      return;
    }

    router.push(`/creation/${tab}/preview`);
  }, [tab, router, post?.title, validateT]);

  const handleCloseClick = useCallback(() => {
    Mixpanel.track('Creation Close', { _stage: 'Creation' });
    router?.push('/');
  }, [router]);

  const handleVideoDelete = useCallback(async () => {
    Mixpanel.track('Video Deleting', { _stage: 'Creation' });
    try {
      const payload = new newnewapi.RemoveUploadedFileRequest({
        publicUrl: post?.announcementVideoUrl,
      });

      const res = await removeUploadedFile(payload);

      if (res?.error) {
        throw new Error(res.error?.message ?? 'An error occurred');
      }

      const payloadProcessing = new newnewapi.StopVideoProcessingRequest({
        taskUuid: videoProcessing?.taskUuid,
      });

      const resProcessing = await stopVideoProcessing(payloadProcessing);

      if (!resProcessing.data || resProcessing.error) {
        throw new Error(resProcessing.error?.message ?? 'An error occurred');
      }

      dispatch(setCreationVideo(''));
      dispatch(setCreationVideoProcessing({}));
      dispatch(setCreationFileUploadError(false));
      dispatch(setCreationFileUploadLoading(false));
      dispatch(setCreationFileUploadProgress(0));
      dispatch(setCreationFileProcessingError(false));
      dispatch(setCreationFileProcessingLoading(false));
      dispatch(setCreationFileProcessingProgress(0));
    } catch (error: any) {
      showErrorToastPredefined(undefined);
    }
  }, [
    dispatch,
    post?.announcementVideoUrl,
    showErrorToastPredefined,
    videoProcessing?.taskUuid,
  ]);

  const handleVideoUpload = useCallback(
    async (value: File) => {
      Mixpanel.track('Video Uploading', {
        _stage: 'Creation',
        _filename: value.name,
      });
      try {
        dispatch(setCreationFileUploadETA(100));
        dispatch(setCreationFileUploadProgress(1));
        dispatch(setCreationFileUploadLoading(true));
        dispatch(setCreationFileUploadError(false));

        const payload = new newnewapi.GetVideoUploadUrlRequest({
          filename: value.name,
        });

        const res = await getVideoUploadUrl(payload);

        if (!res.data || res.error) {
          throw new Error(res.error?.message ?? 'An error occurred');
        }

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        let uploadStartTimestamp: number;
        const uploadResponse = await new Promise((resolve, reject) => {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const uploadProgress = Math.round(
                (event.loaded / event.total) * 100
              );
              const percentageLeft = 100 - uploadProgress;
              const secondsPassed = Math.round(
                (event.timeStamp - uploadStartTimestamp) / 1000
              );
              const factor = secondsPassed / uploadProgress;
              const eta = Math.round(factor * percentageLeft);
              dispatch(setCreationFileUploadProgress(uploadProgress));
              dispatch(setCreationFileUploadETA(eta));
            }
          });
          xhr.addEventListener('loadstart', (event) => {
            uploadStartTimestamp = event.timeStamp;
          });
          xhr.addEventListener('loadend', () => {
            dispatch(setCreationFileUploadProgress(100));
            resolve(xhr.readyState === 4 && xhr.status === 200);
          });
          xhr.addEventListener('error', () => {
            dispatch(setCreationFileUploadProgress(0));
            reject(new Error('Upload failed'));
          });
          xhr.addEventListener('abort', () => {
            // console.log('Aborted');
            dispatch(setCreationFileUploadProgress(0));
            reject(new Error('Upload aborted'));
          });
          xhr.open('PUT', res.data!.uploadUrl, true);
          xhr.setRequestHeader('Content-Type', value.type);
          xhr.send(value);
        });

        if (!uploadResponse) {
          throw new Error('Upload failed');
        }

        const payloadProcessing = new newnewapi.StartVideoProcessingRequest({
          publicUrl: res.data.publicUrl,
        });

        const resProcessing = await startVideoProcessing(payloadProcessing);

        if (!resProcessing.data || resProcessing.error) {
          throw new Error(resProcessing.error?.message ?? 'An error occurred');
        }

        dispatch(
          setCreationVideoProcessing({
            taskUuid: resProcessing.data.taskUuid,
            targetUrls: {
              thumbnailUrl: resProcessing?.data?.targetUrls?.thumbnailUrl,
              hlsStreamUrl: resProcessing?.data?.targetUrls?.hlsStreamUrl,
              dashStreamUrl: resProcessing?.data?.targetUrls?.dashStreamUrl,
              originalVideoUrl:
                resProcessing?.data?.targetUrls?.originalVideoUrl,
              thumbnailImageUrl:
                resProcessing?.data?.targetUrls?.thumbnailImageUrl,
            },
          })
        );

        dispatch(setCreationFileUploadLoading(false));

        dispatch(setCreationFileProcessingProgress(10));
        dispatch(setCreationFileProcessingETA(80));
        dispatch(setCreationFileProcessingLoading(true));
        dispatch(setCreationFileProcessingError(false));
        dispatch(setCreationVideo(res.data.publicUrl ?? ''));
        xhrRef.current = undefined;
      } catch (error: any) {
        if (error.message === 'Upload failed') {
          dispatch(setCreationFileUploadError(true));
          showErrorToastPredefined(undefined);
        } else if (error.message === 'Processing limit reached') {
          dispatch(setCreationFileUploadError(true));
          showErrorToastPredefined(
            ErrorToastPredefinedMessage.ProcessingLimitReachedError
          );
        } else {
          console.log('Upload aborted');
        }
        xhrRef.current = undefined;
        dispatch(setCreationFileUploadLoading(false));
      }
    },
    [dispatch, showErrorToastPredefined]
  );

  const handleItemFocus = useCallback((key: string) => {
    if (key === 'title') {
      setTitleError('');
    }
  }, []);

  const handleItemBlur = useCallback(
    async (key: string, value: string) => {
      if (key === 'title' && value.length > 0) {
        Mixpanel.track('Title Text Change', {
          _stage: 'Creation',
          _text: value,
        });
        setTitleError(
          await validateT(
            value,
            CREATION_TITLE_MIN,
            CREATION_TITLE_MAX,
            newnewapi.ValidateTextRequest.Kind.POST_TITLE
          )
        );
      }
    },
    [validateT]
  );

  const handleItemChange = useCallback(
    async (key: string, value: any) => {
      if (key === 'title') {
        // Mixpanel.track('Post Title Change', {
        //   _stage: 'Creation',
        //   _value: value,
        // });
        dispatch(setCreationTitle(value.trim() ? value : ''));
      } else if (key === 'minimalBid') {
        Mixpanel.track('Minimal Big Change', {
          _stage: 'Creation',
          _value: value,
        });
        dispatch(setCreationMinBid(value));
      } else if (key === 'comments') {
        Mixpanel.track('Post Creation Comments Change', {
          _stage: 'Creation',
          _value: value,
        });
        dispatch(setCreationComments(value));
      } else if (key === 'expiresAt') {
        Mixpanel.track('Post expiresAt Change', {
          _stage: 'Creation',
          _value: value,
        });
        dispatch(setCreationExpireDate(value));
      } else if (key === 'startsAt') {
        Mixpanel.track('Post startsAt Change', {
          _stage: 'Creation',
          _value: value,
        });
        dispatch(setCreationStartDate(value));
      } else if (key === 'targetBackerCount') {
        Mixpanel.track('Backer Count Change', {
          _stage: 'Creation',
          _value: value,
        });
        dispatch(setCreationTargetBackerCount(value));
      } else if (key === 'choices') {
        Mixpanel.track('Post Creation Choices Change', {
          _stage: 'Creation',
          _value: value,
        });
        dispatch(setCreationChoices(value));
      } else if (key === 'video') {
        if (value) {
          await handleVideoUpload(value);
        } else {
          await handleVideoDelete();
        }
      } else if (key === 'thumbnailParameters') {
        dispatch(setCreationVideoThumbnails(value));
      }
    },
    [dispatch, handleVideoUpload, handleVideoDelete]
  );
  const expireOptions = useMemo(
    () => [
      ...(process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production'
        ? [
            {
              id: '2-minutes',
              title: t('secondStep.field.expiresAt.options.2-minutes'),
            },
            {
              id: '5-minutes',
              title: t('secondStep.field.expiresAt.options.5-minutes'),
            },
            {
              id: '10-minutes',
              title: t('secondStep.field.expiresAt.options.10-minutes'),
            },
          ]
        : []),
      {
        id: '1-hour',
        title: t('secondStep.field.expiresAt.options.1-hour'),
      },
      {
        id: '3-hours',
        title: t('secondStep.field.expiresAt.options.3-hours'),
      },
      {
        id: '6-hours',
        title: t('secondStep.field.expiresAt.options.6-hours'),
      },
      {
        id: '12-hours',
        title: t('secondStep.field.expiresAt.options.12-hours'),
      },
      {
        id: '1-day',
        title: t('secondStep.field.expiresAt.options.1-day'),
      },
      {
        id: '3-days',
        title: t('secondStep.field.expiresAt.options.3-days'),
      },
      {
        id: '5-days',
        title: t('secondStep.field.expiresAt.options.5-days'),
      },
    ],
    [t]
  );

  const getDecisionPart = useCallback(
    () => (
      <>
        <SItemWrapper>
          {/* TODO: move to locales */}
          <SInputLabel htmlFor='title'>
            {t('secondStep.input.label')}
          </SInputLabel>
          <RichTextInput
            id='title'
            value={post?.title}
            error={titleError}
            onBlur={handleItemBlur}
            onFocus={handleItemFocus}
            onChange={handleItemChange}
            placeholder={t('secondStep.input.placeholder')}
          />
        </SItemWrapper>
        {tab === 'multiple-choice' && (
          <>
            <SSeparator margin='16px 0' />
            <DraggableMobileOptions
              id='choices'
              min={2}
              options={multiplechoice.choices}
              onChange={handleItemChange}
              validation={validateMcOption}
            />
            {isMobile && <SSeparator margin='16px 0' />}
          </>
        )}
        {tab === 'auction' && !isMobile && (
          <>
            <SSeparator margin='16px 0' />
            <SItemWrapper>
              <TabletFieldBlock
                id='minimalBid'
                type='input'
                value={auction.minimalBid}
                onChange={handleItemChange}
                formattedDescription={(appConstants.minAcBid / 100).toFixed(0)}
                inputProps={{
                  min: appConstants.minAcBid ? appConstants.minAcBid / 100 : 2,
                  max: 10000,
                  type: 'number',
                  pattern: '[0-9]*',
                  customPlaceholder: (appConstants.minAcBid / 100).toFixed(0),
                }}
              />
            </SItemWrapper>
          </>
        )}
        {tab === 'crowdfunding' && !isMobile && (
          <>
            <SSeparator margin='16px 0' />
            <SItemWrapper>
              <TabletFieldBlock
                id='targetBackerCount'
                type='input'
                value={crowdfunding.targetBackerCount}
                onChange={handleItemChange}
                formattedDescription={cfFormattedDescription}
                inputProps={{
                  min: 1,
                  max: 999999,
                  type: 'number',
                  pattern: '[0-9]*',
                }}
              />
            </SItemWrapper>
          </>
        )}
      </>
    ),
    [
      post?.title,
      titleError,
      handleItemBlur,
      handleItemFocus,
      handleItemChange,
      t,
      tab,
      multiplechoice.choices,
      validateMcOption,
      isMobile,
      auction.minimalBid,
      appConstants.minAcBid,
      crowdfunding.targetBackerCount,
      cfFormattedDescription,
    ]
  );
  const getAdvancedPart = useCallback(
    () => (
      <>
        {isMobile ? (
          <>
            <SListWrapper>
              {tab === 'auction' && (
                <SFieldWrapper>
                  <MobileFieldBlock
                    id='minimalBid'
                    type='input'
                    value={auction.minimalBid}
                    onChange={handleItemChange}
                    formattedDescription={(appConstants.minAcBid / 100).toFixed(
                      0
                    )}
                    inputProps={{
                      min: appConstants.minAcBid
                        ? appConstants.minAcBid / 100
                        : 2,
                      max: 10000,
                      type: 'number',
                      pattern: '[0-9]*',
                      customPlaceholder: (appConstants.minAcBid / 100).toFixed(
                        0
                      ),
                    }}
                  />
                </SFieldWrapper>
              )}
              {tab === 'crowdfunding' && (
                <SFieldWrapper>
                  <MobileFieldBlock
                    id='targetBackerCount'
                    type='input'
                    value={crowdfunding.targetBackerCount}
                    onChange={handleItemChange}
                    formattedDescription={cfFormattedDescription}
                    inputProps={{
                      min: 1,
                      type: 'number',
                      pattern: '[0-9]*',
                    }}
                  />
                </SFieldWrapper>
              )}
              <SFieldWrapper>
                <MobileFieldBlock
                  id='expiresAt'
                  type='select'
                  value={post.expiresAt}
                  options={expireOptions}
                  onChange={handleItemChange}
                  formattedValue={t(
                    `secondStep.field.expiresAt.options.${post.expiresAt}` as any
                  )}
                  formattedDescription={formatExpiresAt().format(
                    'DD MMM [at] hh:mm A'
                  )}
                />
              </SFieldWrapper>
              <SFieldWrapper>
                <MobileFieldBlock
                  id='startsAt'
                  type='date'
                  value={post.startsAt}
                  onChange={handleItemChange}
                  formattedValue={t(
                    `secondStep.field.startsAt.modal.type.${post.startsAt?.type}` as any
                  )}
                  formattedDescription={formatStartsAt().format(
                    'DD MMM [at] hh:mm A'
                  )}
                />
              </SFieldWrapper>
            </SListWrapper>
            <SSeparator />
          </>
        ) : (
          <>
            <SItemWrapper style={{ marginBottom: 16 }}>
              <TabletFieldBlock
                id='expiresAt'
                type='select'
                value={post.expiresAt}
                options={expireOptions}
                maxItems={5}
                onChange={handleItemChange}
                formattedValue={t(
                  `secondStep.field.expiresAt.options.${post.expiresAt}` as any
                )}
                formattedDescription={formatExpiresAt().format(
                  'DD MMM [at] hh:mm A'
                )}
              />
            </SItemWrapper>
            <TabletStartDate
              id='startsAt'
              value={post.startsAt}
              onChange={handleItemChange}
            />
            <SSeparator margin='16px 0' />
          </>
        )}
        <MobileField
          id='comments'
          type='toggle'
          value={post.options.commentsEnabled}
          onChange={handleItemChange}
        />
      </>
    ),
    [
      isMobile,
      tab,
      auction.minimalBid,
      handleItemChange,
      appConstants.minAcBid,
      crowdfunding.targetBackerCount,
      cfFormattedDescription,
      post.expiresAt,
      post.startsAt,
      post.options.commentsEnabled,
      expireOptions,
      t,
      formatExpiresAt,
      formatStartsAt,
    ]
  );

  const handlerSocketUpdated = useCallback(
    async (data: any) => {
      const arr = new Uint8Array(data);
      const decoded = newnewapi.VideoProcessingProgress.decode(arr);

      if (!decoded) return;

      if (decoded.taskUuid === videoProcessing?.taskUuid) {
        dispatch(
          setCreationFileProcessingETA(decoded.estimatedTimeLeft?.seconds)
        );

        if (decoded.fractionCompleted > fileProcessing.progress) {
          dispatch(
            setCreationFileProcessingProgress(decoded.fractionCompleted)
          );
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
            dispatch(setCreationFileProcessingLoading(false));
          } else {
            dispatch(setCreationFileUploadError(true));
            showErrorToastPredefined(undefined);
          }
        } else if (
          decoded.status === newnewapi.VideoProcessingProgress.Status.FAILED
        ) {
          dispatch(setCreationFileUploadError(true));
          showErrorToastPredefined(undefined);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [videoProcessing, fileProcessing, dispatch]
  );

  // Video processing fallback
  useEffect(() => {
    async function videoProcessingFallback(hlsUrl: string) {
      const available = await waitResourceIsAvailable(hlsUrl, {
        maxAttempts: 720,
        retryTimeMs: 5000,
      });

      if (available) {
        dispatch(setCreationFileProcessingLoading(false));
        setCreationFileProcessingProgress(100);
      } else {
        dispatch(setCreationFileUploadError(true));
        showErrorToastPredefined(undefined);
      }
    }

    if (fileProcessing.loading && videoProcessing?.targetUrls?.hlsStreamUrl) {
      videoProcessingFallback(videoProcessing?.targetUrls?.hlsStreamUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileProcessing.loading, videoProcessing?.targetUrls?.hlsStreamUrl]);

  useEffect(() => {
    const func = async () => {
      if (validateTitleDebounced) {
        setTitleError(
          await validateT(
            validateTitleDebounced,
            CREATION_TITLE_MIN,
            CREATION_TITLE_MAX,
            newnewapi.ValidateTextRequest.Kind.POST_TITLE
          )
        );
      }
    };
    func();
  }, [validateT, validateTextAPI, validateTitleDebounced]);

  useEffect(() => {
    if (socketConnection) {
      socketConnection?.on('VideoProcessingProgress', handlerSocketUpdated);
    }

    return () => {
      if (socketConnection && socketConnection?.connected) {
        socketConnection?.off('VideoProcessingProgress', handlerSocketUpdated);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection, handlerSocketUpdated]);

  useEffect(() => {
    if (playerRef.current && isDesktop) {
      if (overlayModeEnabled) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
  }, [overlayModeEnabled, isDesktop]);

  useEffect(() => {
    switch (activeTabIndex) {
      case 1:
        tutorialType !== 'MC' && setTutorialType('MC');
        break;
      case 2:
        tutorialType !== 'CF' && setTutorialType('CF');
        break;
      default:
        tutorialType !== 'AC' && setTutorialType('AC');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabIndex]);

  useEffect(() => {
    if (user.userTutorialsProgressSynced) {
      switch (tutorialType) {
        case 'MC':
          user.userTutorialsProgress.remainingMcCrCurrentStep &&
            user.userTutorialsProgress.remainingMcCrCurrentStep[0] ===
              newnewapi.McCreationTutorialStep.MC_CR_HERO &&
            setIsTutorialVisible(true);
          break;
        case 'CF':
          user.userTutorialsProgress.remainingCfCrCurrentStep &&
            user.userTutorialsProgress.remainingCfCrCurrentStep[0] ===
              newnewapi.CfCreationTutorialStep.CF_CR_HERO &&
            setIsTutorialVisible(true);
          break;
        default:
          user.userTutorialsProgress.remainingAcCrCurrentStep &&
            user.userTutorialsProgress.remainingAcCrCurrentStep[0] ===
              newnewapi.AcCreationTutorialStep.AC_CR_HERO &&
            setIsTutorialVisible(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorialType, user.userTutorialsProgressSynced]);

  const goToNextStep = () => {
    let payload = null;
    switch (tutorialType) {
      case 'MC':
        if (
          user.userTutorialsProgress.remainingMcCrCurrentStep &&
          user.userTutorialsProgress.remainingMcCrCurrentStep[0]
        ) {
          payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
            mcCrCurrentStep:
              user.userTutorialsProgress.remainingMcCrCurrentStep[0],
          });
          dispatch(
            setUserTutorialsProgress({
              remainingMcCrCurrentStep: [
                ...user.userTutorialsProgress.remainingMcCrCurrentStep,
              ].slice(1),
            })
          );
        }
        break;
      case 'CF':
        if (
          user.userTutorialsProgress.remainingCfCrCurrentStep &&
          user.userTutorialsProgress.remainingCfCrCurrentStep[0]
        ) {
          payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
            cfCrCurrentStep:
              user.userTutorialsProgress.remainingCfCrCurrentStep[0],
          });
          dispatch(
            setUserTutorialsProgress({
              remainingCfCrCurrentStep: [
                ...user.userTutorialsProgress.remainingCfCrCurrentStep,
              ].slice(1),
            })
          );
        }
        break;
      default:
        if (
          user.userTutorialsProgress.remainingAcCrCurrentStep &&
          user.userTutorialsProgress.remainingAcCrCurrentStep[0]
        ) {
          payload = new newnewapi.MarkTutorialStepAsCompletedRequest({
            acCrCurrentStep:
              user.userTutorialsProgress.remainingAcCrCurrentStep[0],
          });
          dispatch(
            setUserTutorialsProgress({
              remainingAcCrCurrentStep: [
                ...user.userTutorialsProgress.remainingAcCrCurrentStep,
              ].slice(1),
            })
          );
        }
    }
    if (payload) markTutorialStepAsCompleted(payload);
    setIsTutorialVisible(false);
  };

  // This effect results in the form re-rendering every second
  // However, it re renders after every letter typed anyway
  // TODO: optimize this view
  useEffect(() => {
    let updateStartDate: any;

    if (post.startsAt.type === 'right-away') {
      updateStartDate = setInterval(() => {
        const newStartAt = {
          type: post.startsAt.type,
          date: moment().format(),
          time: moment().format('hh:mm'),
          'hours-format': post.startsAt['hours-format'] as 'am' | 'pm',
        };
        dispatch(setCreationStartDate(newStartAt));
      }, 1000);
    }

    return () => {
      clearInterval(updateStartDate);
    };
  }, [post.startsAt, dispatch]);

  return (
    <>
      <div>
        <STabsWrapper>
          <Tabs
            t={t}
            tabs={tabs}
            draggable={false}
            activeTabIndex={activeTabIndex}
            withTabIndicator={isDesktop}
          />
          {isMobile && (
            <SCloseIconWrapper>
              <InlineSVG
                clickable
                svg={closeIcon}
                fill={theme.colorsThemed.text.secondary}
                width='24px'
                height='24px'
                onClick={handleCloseClick}
              />
            </SCloseIconWrapper>
          )}
        </STabsWrapper>
        <SContent>
          <SLeftPart>
            <SItemWrapper noMargin={isDesktop}>
              {!isMobile && (
                <STabletBlockTitle variant={1} weight={700}>
                  {t('secondStep.block.title.file')}
                </STabletBlockTitle>
              )}
              <FileUpload
                id='video'
                value={videoProcessing?.targetUrls}
                thumbnails={post.thumbnailParameters}
                etaUpload={fileUpload.eta}
                errorUpload={fileUpload.error}
                loadingUpload={fileUpload.loading}
                progressUpload={fileUpload.progress}
                etaProcessing={fileProcessing.eta}
                errorProcessing={fileProcessing.error}
                loadingProcessing={fileProcessing.loading}
                progressProcessing={fileProcessing.progress}
                onChange={handleItemChange}
                handleCancelVideoUpload={() => xhrRef.current?.abort()}
              />
            </SItemWrapper>
            {isMobile ? (
              getDecisionPart()
            ) : (
              <SItemWrapper>
                <TabletFieldWrapper>
                  <STabletBlockTitle variant={1} weight={700}>
                    {t('secondStep.block.title.decision')}
                  </STabletBlockTitle>
                  {getDecisionPart()}
                </TabletFieldWrapper>
              </SItemWrapper>
            )}
            {!isMobile && tab === 'multiple-choice' && (
              <SItemWrapper>
                <TabletFieldWrapper>
                  <STabletBlockSubTitle variant={3} weight={600}>
                    {t('secondStep.block.subTitle.votesInfo')}
                  </STabletBlockSubTitle>
                </TabletFieldWrapper>
              </SItemWrapper>
            )}
            {isMobile ? (
              getAdvancedPart()
            ) : (
              <SItemWrapper>
                <TabletFieldWrapper>
                  <STabletBlockTitle variant={1} weight={700}>
                    {t('secondStep.block.title.advanced')}
                  </STabletBlockTitle>
                  {getAdvancedPart()}
                </TabletFieldWrapper>
              </SItemWrapper>
            )}

            {isMobile ? (
              <SButtonWrapper>
                <SButtonContent>
                  <SButton
                    view='primaryGrad'
                    onClick={handleSubmit}
                    disabled={disabled}
                  >
                    {t('secondStep.button.preview')}
                  </SButton>
                </SButtonContent>
              </SButtonWrapper>
            ) : (
              <SItemWrapper>
                <STabletButtonsWrapper>
                  <div>
                    <SButton view='secondary' onClick={handleCloseClick}>
                      {t('secondStep.button.cancel')}
                    </SButton>
                  </div>
                  <div>
                    <SButton
                      id='review'
                      view='primaryGrad'
                      onClick={handleSubmit}
                      disabled={disabled}
                    >
                      {t('secondStep.button.preview')}
                    </SButton>
                  </div>
                </STabletButtonsWrapper>
              </SItemWrapper>
            )}
          </SLeftPart>
          {isDesktop && (
            <SRightPart>
              <SFloatingPart>
                <SItemWrapper noMargin={isDesktop}>
                  <STabletBlockPreviewTitle variant={1} weight={700}>
                    {t('secondStep.block.title.floating')}
                  </STabletBlockPreviewTitle>
                </SItemWrapper>
                {fileUpload?.progress === 100 ? (
                  fileProcessing?.progress === 100 &&
                  !fileProcessing.loading ? (
                    <SFloatingSubSectionWithPlayer>
                      <SFloatingSubSectionPlayer>
                        <BitmovinPlayer
                          withMuteControl
                          id='floating-preview'
                          innerRef={playerRef}
                          resources={videoProcessing?.targetUrls}
                          borderRadius='16px'
                          mutePosition='left'
                          showPlayButton
                        />
                      </SFloatingSubSectionPlayer>
                      <SFloatingSubSectionUser>
                        <SUserAvatar avatarUrl={user.userData?.avatarUrl} />
                        <SUserTitleContainer>
                          <SUserTitle variant={3} weight={600}>
                            {getDisplayname(user.userData)}
                          </SUserTitle>
                          {user.userData?.options?.isVerified && (
                            <SInlineSvg
                              svg={VerificationCheckmark}
                              width='20px'
                              height='20px'
                              fill='none'
                            />
                          )}
                        </SUserTitleContainer>
                        <SCaption variant={2} weight={700}>
                          {t('secondStep.card.left', {
                            time: formatExpiresAtNoStartsAt().fromNow(true),
                          })}
                        </SCaption>
                      </SFloatingSubSectionUser>
                      <SBottomEnd>
                        <SBottomEndPostTitle variant={3} weight={600}>
                          {getChunks(post.title).map((chunk) => {
                            if (chunk.type === 'hashtag') {
                              return (
                                <SBottomEndPostTitleHashtag>
                                  #{chunk.text}
                                </SBottomEndPostTitleHashtag>
                              );
                            }

                            return chunk.text;
                          })}
                        </SBottomEndPostTitle>
                      </SBottomEnd>
                    </SFloatingSubSectionWithPlayer>
                  ) : (
                    <SFloatingSubSection>
                      <SFloatingSubSectionDescription variant={3} weight={600}>
                        {t('secondStep.block.subTitle.floatingProcessing')}
                      </SFloatingSubSectionDescription>
                    </SFloatingSubSection>
                  )
                ) : (
                  <SFloatingSubSection>
                    <SFloatingSubSectionDescription variant={3} weight={600}>
                      {t('secondStep.block.subTitle.floating')}
                    </SFloatingSubSectionDescription>
                  </SFloatingSubSection>
                )}
              </SFloatingPart>
            </SRightPart>
          )}
        </SContent>
      </div>
      {isTutorialVisible && (
        <HeroPopup
          isPopupVisible={isTutorialVisible}
          postType={tutorialType}
          closeModal={goToNextStep}
        />
      )}
    </>
  );
};

export default CreationSecondStepContent;

const SContent = styled.div`
  display: flex;
  flex-direction: row;

  ${({ theme }) => theme.media.tablet} {
    margin-top: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    margin-top: 0;
  }
`;

const SLeftPart = styled.div`
  flex: 1;

  ${({ theme }) => theme.media.laptop} {
    max-width: 480px;
  }
`;

const SRightPart = styled.div`
  position: relative;
`;

const SFloatingPart = styled.div`
  top: 16px;
  left: 0;
  position: sticky;
  padding-left: 32px;
`;

const SFloatingSubSection = styled.div`
  width: 224px;
  height: 396px;
  padding: 25px;
  display: flex;
  background: ${(props) => props.theme.colorsThemed.background.secondary};
  align-items: center;
  border-radius: 16px;
  justify-content: center;
`;

const SFloatingSubSectionWithPlayer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SFloatingSubSectionUser = styled.div`
  width: 224px;

  display: grid;
  margin-top: 12px;
  align-items: center;
  flex-direction: row;

  grid-template-columns: 24px 1fr max-content;
`;

const SFloatingSubSectionPlayer = styled.div`
  width: 224px;
  height: 396px;
`;

const SFloatingSubSectionDescription = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  opacity: 0.33;
  text-align: center;
`;

const STabsWrapper = styled.div`
  width: 100%;
  display: flex;
  padding: 16px 0;
  position: relative;
  justify-content: center;

  ${({ theme }) => theme.media.tablet} {
    padding: 24px 0;
  }

  ${({ theme }) => theme.media.laptop} {
    padding: 40px 0;
    justify-content: flex-start;
  }
`;

interface ISItemWrapper {
  noMargin?: boolean;
}

const SItemWrapper = styled.div<ISItemWrapper>`
  margin-top: ${(props) => (props.noMargin ? 0 : 16)}px;

  ${({ theme }) => theme.media.laptop} {
    margin-top: ${(props) => (props.noMargin ? 0 : 24)}px;
  }
`;

const TabletFieldWrapper = styled.div`
  border: 1px solid
    ${(props) =>
      props.theme.name === 'light'
        ? props.theme.colorsThemed.background.outlines1
        : 'transparent'};
  padding: 23px;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.secondary};
  border-radius: 16px;
`;

interface ISSeparator {
  margin?: string;
}

const SSeparator = styled.div<ISSeparator>`
  width: 100%;
  border: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};
  margin: ${(props) => props.margin || '8px 0 16px 0'};
`;

const SButton = styled(Button)`
  width: 100%;
  padding: 16px 20px;

  ${({ theme }) => theme.media.tablet} {
    padding: 12px 24px;
  }

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

const SListWrapper = styled.div`
  left: -8px;
  width: calc(100% + 16px);
  display: flex;
  position: relative;
  flex-wrap: wrap;
  margin-top: 8px;
  flex-direction: row;
`;

const SFieldWrapper = styled.div`
  width: calc(50% - 16px);
  margin: 8px;
`;

const SButtonWrapper = styled.div`
  left: 0;
  width: 100%;
  bottom: 0;
  z-index: 5;
  display: flex;
  padding: 24px 16px;
  position: fixed;
  background: ${(props) => props.theme.gradients.creationSubmit};
`;

const SButtonContent = styled.div`
  width: 100%;
`;

const SCloseIconWrapper = styled.div`
  top: 50%;
  right: 0;
  z-index: 10;
  position: absolute;
  transform: translateY(-50%);
`;

const STabletButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  justify-content: space-between;
`;

const STabletBlockTitle = styled(Caption)`
  margin-bottom: 8px;

  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 16px;
  }
`;

const STabletBlockPreviewTitle = styled(Caption)`
  margin-bottom: 8px;
  text-align: center;
  ${({ theme }) => theme.media.tablet} {
    margin-bottom: 16px;
  }
`;

const STabletBlockSubTitle = styled(Text)``;

const SUserAvatar = styled(UserAvatar)`
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  min-height: 24px !important;
`;

const SUserTitleContainer = styled.div`
  display: flex;
  overflow: hidden;
`;

const SUserTitle = styled(Text)`
  padding-left: 12px;
  margin-right: 2px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SInlineSvg = styled(InlineSvg)`
  flex-shrink: 0;
`;

const SBottomEnd = styled.div`
  width: 224px;
  display: flex;
  margin-top: 12px;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
`;

const SBottomEndPostTitle = styled(Text)`
  display: inline;
  max-width: 100%;
  line-break: loose;
  white-space: pre-wrap;
  word-break: break-word;
`;

const SBottomEndPostTitleHashtag = styled.span`
  display: inline;
  word-spacing: normal;
  overflow-wrap: break-word;
  color: ${(props) => props.theme.colorsThemed.accent.blue};
`;

const SCaption = styled(Caption)`
  margin-left: 4px;
  justify-self: flex-end;
  line-break: strict;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SInputLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;
