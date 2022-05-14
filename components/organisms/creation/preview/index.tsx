/* eslint-disable no-unneeded-ternary */
import React, { useRef, useMemo, useState, useCallback } from 'react';
import moment from 'moment';
import dynamic from 'next/dynamic';
import _compact from 'lodash/compact';
import { toast } from 'react-toastify';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Caption from '../../../atoms/Caption';
import Headline from '../../../atoms/Headline';
import InlineSVG from '../../../atoms/InlineSVG';

import { createPost } from '../../../../api/endpoints/post';
import { maxLength, minLength } from '../../../../utils/validation';
import {
  clearCreation,
  setPostData,
} from '../../../../redux-store/slices/creationStateSlice';
import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';

import {
  CREATION_TITLE_MIN,
  CREATION_TITLE_MAX,
  CREATION_OPTION_MIN,
  CREATION_OPTION_MAX,
} from '../../../../constants/general';

import chevronLeftIcon from '../../../../public/images/svg/icons/outlined/ChevronLeft.svg';
import useLeavePageConfirm from '../../../../utils/hooks/useLeavePageConfirm';

const BitmovinPlayer = dynamic(() => import('../../../atoms/BitmovinPlayer'), {
  ssr: false,
});
const PublishedModal = dynamic(
  () => import('../../../molecules/creation/PublishedModal')
);

interface IPreviewContent {}

export const PreviewContent: React.FC<IPreviewContent> = () => {
  const { t: tCommon } = useTranslation();
  const { t } = useTranslation('creation');
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const playerRef: any = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const {
    post,
    auction,
    crowdfunding,
    multiplechoice,
    videoProcessing,
    fileProcessing,
  } = useAppSelector((state) => state.creation);
  const { userData } = useAppSelector((state) => state.user);
  const validateText = useCallback(
    (text: string, min: number, max: number) => {
      let error = minLength(tCommon, text, min);

      if (!error) {
        error = maxLength(tCommon, text, max);
      }

      return error;
    },
    [tCommon]
  );
  const { resizeMode } = useAppSelector((state) => state.ui);
  const {
    query: { tab },
  } = router;
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const isTablet = ['tablet'].includes(resizeMode);
  const isDesktop = !isMobile && !isTablet;

  const allowedRoutes = [
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
  ];

  if (isDesktop) {
    allowedRoutes.push('/');
  }

  useLeavePageConfirm(
    showModal ? false : true,
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
    multiplechoice.choices.findIndex((item) =>
      validateText(item.text, CREATION_OPTION_MIN, CREATION_OPTION_MAX)
    ) === -1;
  const disabled =
    loading ||
    !titleIsValid ||
    !post.title ||
    !post.announcementVideoUrl ||
    !optionsAreValid;

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
      }

      return inSeconds ? seconds : dateValue;
    },
    [post.expiresAt, post.startsAt]
  );
  const handleClose = useCallback(() => {
    router.back();
  }, [router]);
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    router.push('/');
    dispatch(clearCreation({}));
  }, [dispatch, router]);
  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
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
          options: multiplechoice.choices.map((choice) => ({
            text: choice.text,
          })),
          isSuggestionsAllowed: multiplechoice.options.allowSuggestions,
        };
      } else if (tab === 'crowdfunding') {
        body.crowdfunding = {
          targetBackerCount: crowdfunding.targetBackerCount,
        };
      }

      const payload = new newnewapi.CreatePostRequest(body);

      const { data, error } = await createPost(payload);

      if (!data || error) {
        throw new Error(error?.message ?? 'Request failed');
      }

      dispatch(setPostData(data));
      setLoading(false);

      if (isMobile) {
        router.push(`/creation/${tab}/published`);
      } else {
        playerRef?.current?.pause();
        setShowModal(true);
      }
    } catch (err: any) {
      toast.error(err);
      setLoading(false);
    }
  }, [
    tab,
    post,
    router,
    auction,
    isMobile,
    dispatch,
    crowdfunding,
    multiplechoice,
    formatStartsAt,
    formatExpiresAt,
  ]);
  const settings: any = useMemo(
    () =>
      _compact([
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
          value: formatStartsAt().format('DD MMM [at] hh:mm A'),
        },
        {
          key: 'expiresAt',
          value: formatExpiresAt(false).format('DD MMM [at] hh:mm A'),
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
          userData?.options?.isOfferingSubscription && {
            key: 'allowSuggestions',
            value: t(
              `preview.values.${
                multiplechoice.options.allowSuggestions
                  ? 'allowSuggestions-allowed'
                  : 'allowSuggestions-forbidden'
              }`
            ),
          },
      ]),
    [
      t,
      tab,
      formatStartsAt,
      post.options.commentsEnabled,
      auction.minimalBid,
      crowdfunding.targetBackerCount,
      multiplechoice?.options?.allowSuggestions,
      userData?.options?.isOfferingSubscription,
      formatExpiresAt,
    ]
  );
  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const renderSetting = (item: any) => (
    <SItem key={item.key}>
      <SItemTitle variant={2} weight={600}>
        {t(`preview.settings.${item.key}`)}
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

  if (isMobile) {
    return (
      <>
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
              {post.title}
            </SHeadlineMobile>
          </STopLine>
          {tab === 'multiple-choice' && (
            <SChoices>{multiplechoice.choices.map(renderChoice)}</SChoices>
          )}
          <SSettings>{settings.map(renderSetting)}</SSettings>
          <SPlayerWrapper>
            {fileProcessing.progress === 100 ? (
              <BitmovinPlayer
                id='preview-mobile'
                muted={false}
                resources={videoProcessing?.targetUrls}
              />
            ) : (
              <SText variant={2}>{t('video-being-processed-caption')}</SText>
            )}
          </SPlayerWrapper>
        </SContent>
        <SButtonWrapper>
          <SButtonContent>
            <SButton
              view='primaryGrad'
              loading={loading}
              onClick={handleSubmit}
              disabled={disabled}
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
      {showModal && (
        <PublishedModal open={showModal} handleClose={handleCloseModal} />
      )}
      <SHeadLine variant={3} weight={600}>
        {t(`preview.title-${router?.query?.tab}`)}
      </SHeadLine>
      <STabletContent>
        <SLeftPart>
          <STabletPlayer>
            {fileProcessing.progress === 100 ? (
              <BitmovinPlayer
                withMuteControl
                id='preview'
                innerRef={playerRef}
                resources={videoProcessing?.targetUrls}
                mutePosition='left'
                borderRadius='16px'
              />
            ) : (
              <SText variant={2}>{t('video-being-processed-caption')}</SText>
            )}
          </STabletPlayer>
        </SLeftPart>
        <SRightPart>
          <SHeadline variant={5}>{post.title}</SHeadline>
          {tab === 'multiple-choice' && (
            <SChoices>{multiplechoice.choices.map(renderChoice)}</SChoices>
          )}
          <SSettings>{settings.map(renderSetting)}</SSettings>
          <SButtonsWrapper>
            <Button view='secondary' onClick={handleClose} disabled={loading}>
              {t('preview.button.edit')}
            </Button>
            <Button
              view='primaryGrad'
              loading={loading}
              onClick={handleSubmit}
              disabled={disabled}
            >
              {t('preview.button.submit')}
            </Button>
          </SButtonsWrapper>
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
  padding: 26px 0;
  text-align: center;

  ${({ theme }) => theme.media.laptop} {
    padding: 8px 0;
    margin-bottom: 40px;
  }
`;

const SLeftPart = styled.div`
  flex: 1;
  max-width: calc(50% - 76px);
  margin-right: 76px;

  ${({ theme }) => theme.media.laptop} {
    max-width: 352px;
    margin-right: 16px;
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
  padding: 24px 16px;
  position: fixed;
  background: ${(props) => props.theme.gradients.creationSubmit};
`;

const SButtonContent = styled.div`
  width: 100%;
`;

const SHeadline = styled(Headline)`
  margin-bottom: 18px;
`;

const SHeadlineMobile = styled(Caption)`
  display: -webkit-box;
  overflow: hidden;
  position: relative;
  padding-left: 8px;
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
`;

const SItemValue = styled(Text)``;

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

const SButtonsWrapper = styled.div`
  width: 100%;
  display: flex;
  margin-top: 26px;
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
  text-align: left;

  ${({ theme }) => theme.media.tablet} {
    text-align: center;
  }
`;
