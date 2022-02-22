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
import { toast } from 'react-toastify';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';
import TextArea from '../../../atoms/creation/TextArea';
import InlineSVG from '../../../atoms/InlineSVG';
import UserAvatar from '../../../molecules/UserAvatar';
import FileUpload from '../../../molecules/creation/FileUpload';
import MobileField from '../../../molecules/creation/MobileField';
import Tabs, { Tab } from '../../../molecules/Tabs';
import TabletStartDate from '../../../molecules/creation/TabletStartDate';
import MobileFieldBlock from '../../../molecules/creation/MobileFieldBlock';
import TabletFieldBlock from '../../../molecules/creation/TabletFieldBlock';
import DraggableMobileOptions from '../DraggableMobileOptions';

import useDebounce from '../../../../utils/hooks/useDebounce';
import { validateText } from '../../../../api/endpoints/infrastructure';
import { SocketContext } from '../../../../contexts/socketContext';
import { ChannelsContext } from '../../../../contexts/channelsContext';
import { minLength, maxLength } from '../../../../utils/validation';
import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';
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
  setCreationAllowSuggestions,
  setCreationTargetBackerCount,
  setCreationFileUploadLoading,
  setCreationFileUploadProgress,
} from '../../../../redux-store/slices/creationStateSlice';

import {
  CREATION_TITLE_MIN,
  CREATION_TITLE_MAX,
  CREATION_OPTION_MAX,
  CREATION_OPTION_MIN,
} from '../../../../constants/general';

import closeIcon from '../../../../public/images/svg/icons/outlined/Close.svg';

const BitmovinPlayer = dynamic(() => import('../../../atoms/BitmovinPlayer'), {
  ssr: false,
});

interface ICreationSecondStepContent {
}

type CardType = 'ac' | 'mc' | 'cf';

export const CreationSecondStepContent: React.FC<ICreationSecondStepContent> = () => {
  const { t: tCommon } = useTranslation();
  const { t } = useTranslation('creation');
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const playerRef: any = useRef(null);
  const {
    post,
    auction,
    fileUpload,
    crowdfunding,
    multiplechoice,
    videoProcessing,
  } = useAppSelector((state) => state.creation);
  const user = useAppSelector((state) => state.user);
  const {
    resizeMode,
    overlay,
  } = useAppSelector((state) => state.ui);
  const { query: { tab } } = router;
  const tabs: Tab[] = useMemo(() => [
    {
      nameToken: 'auction',
      url: '/creation/auction',
    },
    {
      nameToken: 'multiple-choice',
      url: '/creation/multiple-choice',
    },
    {
      nameToken: 'crowdfunding',
      url: '/creation/crowdfunding',
    },
  ], []);
  const typesOfPost: any = useMemo(() => ({
    auction: 'ac',
    'multiple-choice': 'mc',
    crowdfunding: 'cf',
  }), []);
  const typeOfPost: CardType = typesOfPost[tab as string];
  const [titleError, setTitleError] = useState('');

  // Socket
  const socketConnection = useContext(SocketContext);
  const {
    addChannel,
    removeChannel,
  } = useContext(ChannelsContext);

  const validateTextAPI = useCallback(async (
    text: string,
    kind: newnewapi.ValidateTextRequest.Kind,
  ) => {
    if (!text) {
      return '';
    }

    try {
      const payload = new newnewapi.ValidateTextRequest({
        kind,
        text,
      });

      const res = await validateText(payload);

      if (!res?.data?.status) throw new Error('An error occured');

      if (res?.data?.status !== newnewapi.ValidateTextResponse.Status.OK) {
        return tCommon('error.text.badWords');
      }

      return '';
    } catch (err) {
      return '';
    }
  }, [tCommon]);
  const validateT = useCallback(async (
    text: string,
    min: number,
    max: number,
    type: newnewapi.ValidateTextRequest.Kind,
  ) => {
    let error = minLength(tCommon, text, min);

    if (!error) {
      error = maxLength(tCommon, text, max);
    }

    if (!error) {
      error = await validateTextAPI(text, type);
    }

    return error;
  }, [tCommon, validateTextAPI]);
  const activeTabIndex = tabs.findIndex((el) => el.nameToken === tab);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const isTablet = ['tablet'].includes(resizeMode);
  const isDesktop = !isMobile && !isTablet;
  const optionsAreValid = tab !== 'multiple-choice'
    || multiplechoice.choices.findIndex((item) => validateT(item.text, CREATION_OPTION_MIN, CREATION_OPTION_MAX, newnewapi.ValidateTextRequest.Kind.POST_OPTION)) !== -1;
  const disabled = !!titleError
    || !post.title
    || !post.announcementVideoUrl
    || fileUpload.progress !== 100
    || !optionsAreValid;

  const validateTitleDebounced = useDebounce(post.title, 500);
  const formatStartsAt = useCallback(() => {
    const time = moment(`${post.startsAt.time} ${post.startsAt['hours-format']}`, ['hh:mm a']);

    return moment(post.startsAt.date)
      .hours(time.hours())
      .minutes(time.minutes());
  }, [post.startsAt]);
  const formatExpiresAt = useCallback(() => {
    const time = moment(`${post.startsAt.time} ${post.startsAt['hours-format']}`, ['hh:mm a']);
    const dateValue = moment(post.startsAt.date)
      .hours(time.hours())
      .minutes(time.minutes());

    if (post.expiresAt === '1-hour') {
      dateValue.add(1, 'h');
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
    }

    return dateValue;
  }, [post.expiresAt, post.startsAt]);
  const handleSubmit = useCallback(async () => {
    router.push(`/creation/${tab}/preview`);
  }, [tab, router]);
  const handleCloseClick = useCallback(() => {
    if (router.query?.referer) {
      router.push(router.query.referer as string);
    } else {
      router.push('/');
    }
  }, [router]);
  const handleVideoDelete = useCallback(async () => {
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

      removeChannel(videoProcessing?.taskUuid as string);

      dispatch(setCreationVideo(''));
      dispatch(setCreationFileUploadError(false));
      dispatch(setCreationVideoProcessing({}));
      dispatch(setCreationFileUploadLoading(false));
      dispatch(setCreationFileUploadProgress(0));
    } catch (error: any) {
      toast.error(error?.message);
    }
  }, [dispatch, post?.announcementVideoUrl, removeChannel, videoProcessing?.taskUuid]);
  const handleVideoUpload = useCallback(async (value) => {
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

      const uploadResponse = await fetch(
        res.data.uploadUrl,
        {
          method: 'PUT',
          body: value,
          headers: {
            'Content-Type': value.type,
          },
        },
      );

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      dispatch(setCreationFileUploadProgress(5));
      dispatch(setCreationFileUploadETA(90));

      const payloadProcessing = new newnewapi.StartVideoProcessingRequest({
        publicUrl: res.data.publicUrl,
      });

      const resProcessing = await startVideoProcessing(payloadProcessing);

      if (!resProcessing.data || resProcessing.error) {
        throw new Error(resProcessing.error?.message ?? 'An error occurred');
      }

      addChannel(
        resProcessing.data.taskUuid,
        {
          processingProgress: {
            taskUuid: resProcessing.data.taskUuid,
          },
        },
      );

      dispatch(setCreationVideoProcessing({
        taskUuid: resProcessing.data.taskUuid,
        targetUrls: {
          thumbnailUrl: resProcessing?.data?.targetUrls?.thumbnailUrl,
          hlsStreamUrl: resProcessing?.data?.targetUrls?.hlsStreamUrl,
          dashStreamUrl: resProcessing?.data?.targetUrls?.dashStreamUrl,
          originalVideoUrl: resProcessing?.data?.targetUrls?.originalVideoUrl,
          thumbnailImageUrl: resProcessing?.data?.targetUrls?.thumbnailImageUrl,
        },
      }));
      dispatch(setCreationFileUploadProgress(10));
      dispatch(setCreationFileUploadETA(80));
      dispatch(setCreationVideo(res.data.publicUrl ?? ''));
    } catch (error: any) {
      dispatch(setCreationFileUploadError(true));
      dispatch(setCreationFileUploadLoading(false));
      toast.error(error?.message);
    }
  }, [addChannel, dispatch]);
  const handleItemFocus = useCallback((key: string) => {
    if (key === 'title') {
      setTitleError('');
    }
  }, []);
  const handleItemBlur = useCallback(async (key: string, value: string) => {
    if (key === 'title') {
      setTitleError(await validateT(
        value,
        CREATION_TITLE_MIN,
        CREATION_TITLE_MAX,
        newnewapi.ValidateTextRequest.Kind.POST_TITLE,
      ));
    }
  }, [validateT]);
  const handleItemChange = useCallback(async (key: string, value: any) => {
    if (key === 'title') {
      dispatch(setCreationTitle(value));
    } else if (key === 'minimalBid') {
      dispatch(setCreationMinBid(value));
    } else if (key === 'comments') {
      dispatch(setCreationComments(value));
    } else if (key === 'allowSuggestions') {
      dispatch(setCreationAllowSuggestions(value));
    } else if (key === 'expiresAt') {
      dispatch(setCreationExpireDate(value));
    } else if (key === 'startsAt') {
      dispatch(setCreationStartDate(value));
    } else if (key === 'targetBackerCount') {
      dispatch(setCreationTargetBackerCount(value));
    } else if (key === 'choices') {
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
  }, [dispatch, handleVideoUpload, handleVideoDelete]);
  const expireOptions = useMemo(() => [
    {
      id: '1-hour',
      title: t('secondStep.field.expiresAt.options.1-hour'),
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
    {
      id: '7-days',
      title: t('secondStep.field.expiresAt.options.7-days'),
    },
  ], [t]);

  const getDecisionPart = useCallback(() => (
    <>
      <SItemWrapper>
        <TextArea
          id="title"
          value={post?.title}
          error={titleError}
          onBlur={handleItemBlur}
          onFocus={handleItemFocus}
          onChange={handleItemChange}
          placeholder={t('secondStep.input.placeholder')}
        />
      </SItemWrapper>
      {
        tab === 'multiple-choice' && (
          <>
            <SSeparator margin="16px 0" />
            <DraggableMobileOptions
              id="choices"
              min={2}
              options={multiplechoice.choices}
              onChange={handleItemChange}
              validation={validateT}
            />
            {isMobile && (
              <SSeparator margin="16px 0" />
            )}
          </>
        )
      }
      {
        tab === 'auction' && !isMobile && (
          <>
            <SSeparator margin="16px 0" />
            <SItemWrapper>
              <TabletFieldBlock
                id="minimalBid"
                type="input"
                value={auction.minimalBid}
                onChange={handleItemChange}
                formattedDescription={auction.minimalBid}
                inputProps={{
                  min: 5,
                  type: 'number',
                  pattern: '[0-9]*',
                }}
              />
            </SItemWrapper>
          </>
        )
      }
      {
        tab === 'crowdfunding' && !isMobile && (
          <>
            <SSeparator margin="16px 0" />
            <SItemWrapper>
              <TabletFieldBlock
                id="targetBackerCount"
                type="input"
                value={crowdfunding.targetBackerCount}
                onChange={handleItemChange}
                formattedDescription={crowdfunding.targetBackerCount}
                inputProps={{
                  min: 1,
                  type: 'number',
                  pattern: '[0-9]*',
                }}
              />
            </SItemWrapper>
          </>
        )
      }
    </>
  ), [
    t,
    tab,
    isMobile,
    titleError,
    post?.title,
    auction?.minimalBid,
    crowdfunding?.targetBackerCount,
    validateT,
    handleItemBlur,
    handleItemFocus,
    handleItemChange,
    multiplechoice.choices,
  ]);
  const getAdvancedPart = useCallback(() => (
    <>
      {isMobile ? (
        <>
          <SListWrapper>
            {
              tab === 'auction' && (
                <SFieldWrapper>
                  <MobileFieldBlock
                    id="minimalBid"
                    type="input"
                    value={auction.minimalBid}
                    onChange={handleItemChange}
                    formattedDescription={auction.minimalBid}
                    inputProps={{
                      min: 5,
                      type: 'number',
                      pattern: '[0-9]*',
                    }}
                  />
                </SFieldWrapper>
              )
            }
            {
              tab === 'crowdfunding' && (
                <SFieldWrapper>
                  <MobileFieldBlock
                    id="targetBackerCount"
                    type="input"
                    value={crowdfunding.targetBackerCount}
                    onChange={handleItemChange}
                    formattedDescription={crowdfunding.targetBackerCount}
                    inputProps={{
                      min: 1,
                      type: 'number',
                      pattern: '[0-9]*',
                    }}
                  />
                </SFieldWrapper>
              )
            }
            <SFieldWrapper>
              <MobileFieldBlock
                id="expiresAt"
                type="select"
                value={post.expiresAt}
                options={expireOptions}
                onChange={handleItemChange}
                formattedValue={t(`secondStep.field.expiresAt.options.${post.expiresAt}`)}
                formattedDescription={formatExpiresAt()
                  .format('DD MMM [at] hh:mm A')}
              />
            </SFieldWrapper>
            <SFieldWrapper>
              <MobileFieldBlock
                id="startsAt"
                type="date"
                value={post.startsAt}
                onChange={handleItemChange}
                formattedValue={t(`secondStep.field.startsAt.modal.type.${post.startsAt?.type}`)}
                formattedDescription={formatStartsAt()
                  .format('DD MMM [at] hh:mm A')}
              />
            </SFieldWrapper>
          </SListWrapper>
          <SSeparator />
        </>
      ) : (
        <>
          <SItemWrapper>
            <TabletFieldBlock
              id="expiresAt"
              type="select"
              value={post.expiresAt}
              options={expireOptions}
              maxItems={5}
              onChange={handleItemChange}
              formattedValue={t(`secondStep.field.expiresAt.options.${post.expiresAt}`)}
              formattedDescription={formatExpiresAt()
                .format('DD MMM [at] hh:mm A')}
            />
          </SItemWrapper>
          <SSeparator margin="16px 0" />
          <STabletBlockTitle variant={1} weight={700}>
            {t('secondStep.field.startsAt.tablet.title')}
          </STabletBlockTitle>
          <TabletStartDate
            id="startsAt"
            value={post.startsAt}
            onChange={handleItemChange}
          />
          <SSeparator margin="16px 0" />
        </>
      )}
      {tab === 'multiple-choice' && (
        <SMobileFieldWrapper>
          <MobileField
            id="allowSuggestions"
            type="toggle"
            value={multiplechoice.options.allowSuggestions}
            onChange={handleItemChange}
          />
        </SMobileFieldWrapper>
      )}
      <MobileField
        id="comments"
        type="toggle"
        value={post.options.commentsEnabled}
        onChange={handleItemChange}
      />
    </>
  ), [
    t,
    tab,
    isMobile,
    post.startsAt,
    post.expiresAt,
    post.options.commentsEnabled,
    auction.minimalBid,
    crowdfunding.targetBackerCount,
    multiplechoice.options.allowSuggestions,
    expireOptions,
    formatStartsAt,
    formatExpiresAt,
    handleItemChange,
  ]);
  const handlerSocketUpdated = useCallback((data: any) => {
    const arr = new Uint8Array(data);
    const decoded = newnewapi.VideoProcessingProgress.decode(arr);

    if (!decoded) return;

    if (decoded.taskUuid === videoProcessing?.taskUuid) {
      dispatch(setCreationFileUploadETA(decoded.estimatedTimeLeft?.seconds));

      if (decoded.fractionCompleted > fileUpload.progress) {
        dispatch(setCreationFileUploadProgress(decoded.fractionCompleted));
      }

      if (decoded.fractionCompleted === 100) {
        removeChannel(videoProcessing?.taskUuid);
        dispatch(setCreationFileUploadLoading(false));
      }
    }
  }, [videoProcessing, fileUpload, dispatch, removeChannel]);

  useEffect(() => {
    const func = async () => {
      if (validateTitleDebounced) {
        setTitleError(await validateT(
          validateTitleDebounced,
          CREATION_TITLE_MIN,
          CREATION_TITLE_MAX,
          newnewapi.ValidateTextRequest.Kind.POST_TITLE,
        ));
      }
    };
    func();
  }, [validateT, validateTextAPI, validateTitleDebounced]);
  useEffect(() => {
    if (socketConnection) {
      socketConnection.on('VideoProcessingProgress', handlerSocketUpdated);
    }

    return () => {
      if (socketConnection && socketConnection.connected) {
        socketConnection.off('VideoProcessingProgress', handlerSocketUpdated);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketConnection, handlerSocketUpdated]);
  useEffect(() => {
    if (playerRef.current && isDesktop) {
      if (overlay) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
  }, [overlay, isDesktop]);

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
                width="24px"
                height="24px"
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
                {...fileUpload}
                id="video"
                value={videoProcessing?.targetUrls}
                onChange={handleItemChange}
                thumbnails={post.thumbnailParameters}
              />
            </SItemWrapper>
            {isMobile ? getDecisionPart() : (
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
            {isMobile ? getAdvancedPart() : (
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
                    view="primaryGrad"
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
                    <SButton
                      view="secondary"
                      onClick={handleCloseClick}
                    >
                      {t('secondStep.button.cancel')}
                    </SButton>
                  </div>
                  <div>
                    <SButton
                      view="primaryGrad"
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
                  <STabletBlockTitle variant={1} weight={700}>
                    {t('secondStep.block.title.floating')}
                  </STabletBlockTitle>
                </SItemWrapper>
                {fileUpload?.progress === 100 ? (
                  <SFloatingSubSectionWithPlayer>
                    <SFloatingSubSectionPlayer>
                      <BitmovinPlayer
                        withMuteControl
                        id="floating-preview"
                        innerRef={playerRef}
                        resources={videoProcessing?.targetUrls}
                        borderRadius="16px"
                        mutePosition="left"
                      />
                    </SFloatingSubSectionPlayer>
                    <SFloatingSubSectionUser>
                      <SUserAvatar
                        avatarUrl={user.userData?.avatarUrl}
                      />
                      <SUserTitle variant={3} weight={600}>
                        {post?.title}
                      </SUserTitle>
                    </SFloatingSubSectionUser>
                    <SBottomEnd>
                      <SButtonUser
                        view="primary"
                      >
                        {t(`secondStep.button.card.${typeOfPost}`)}
                      </SButtonUser>
                      <SCaption variant={2} weight={700}>
                        {t('secondStep.card.left', {
                          time: formatExpiresAt()
                            .fromNow(true),
                        })}
                      </SCaption>
                    </SBottomEnd>
                  </SFloatingSubSectionWithPlayer>
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
`;

const SFloatingSubSectionUser = styled.div`
  display: flex;
  margin-top: 12px;
  align-items: center;
  flex-direction: row;
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
  border: 1px solid ${(props) => (props.theme.name === 'light' ? props.theme.colorsThemed.background.outlines1 : 'transparent')};
  padding: 23px;
  background: ${(props) => (props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.secondary)};
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

const SMobileFieldWrapper = styled.div`
  margin-bottom: 16px;
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

const STabletBlockSubTitle = styled(Text)``;

const SUserAvatar = styled(UserAvatar)`
  width: 36px;
  height: 36px;
  min-width: 36px;
  min-height: 36px;
`;

const SUserTitle = styled(Text)`
  width: 188px;
  display: -webkit-box;
  overflow: hidden;
  position: relative;
  padding-left: 12px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const SBottomEnd = styled.div`
  display: flex;
  margin-top: 12px;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
`;

const SButtonUser = styled(Button)`
  padding: 12px;
  border-radius: 12px;

  span {
    font-size: 12px;
    font-weight: 700;
    line-height: 16px;
  }

  ${(props) => props.theme.media.tablet} {
    padding: 8px 12px;
  }
`;

const SCaption = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;
