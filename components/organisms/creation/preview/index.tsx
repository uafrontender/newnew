import React, { useState, useMemo, useCallback } from 'react';
import moment from 'moment';
import styled from 'styled-components';
import _compact from 'lodash/compact';
import { newnewapi } from 'newnew-api';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import Text from '../../../atoms/Text';
import Button from '../../../atoms/Button';
import Headline from '../../../atoms/Headline';

import { createPost } from '../../../../api/endpoints/post';
import { setPostData } from '../../../../redux-store/slices/creationStateSlice';
import { getVideoUploadUrl } from '../../../../api/endpoints/upload';
import { useAppDispatch, useAppSelector } from '../../../../redux-store/store';

interface IPreviewContent {
  video: any;
}

export const PreviewContent: React.FC<IPreviewContent> = (props) => {
  const { video } = props;
  const { t } = useTranslation('creation');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const {
    post,
    auction,
    crowdfunding,
    multiplechoice,
  } = useAppSelector((state) => state.creation);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const { query: { tab } } = router;
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(resizeMode);
  const titleIsValid = post.title.length > 5 && post.title.length < 70;
  const disabled = loading || !titleIsValid;

  const formatStartsAt = useCallback(() => {
    const time = moment(`${post.startsAt.time} ${post.startsAt['hours-format']}`, ['hh:mm a']);

    return moment(post.startsAt.date)
      .hours(time.hours())
      .minutes(time.minutes());
  }, [post.startsAt]);
  const formatExpiresAt: (inSeconds?: boolean) => any = useCallback((inSeconds = false) => {
    const time = moment(`${post.startsAt.time} ${post.startsAt['hours-format']}`, ['hh:mm a']);
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
  }, [post.expiresAt, post.startsAt]);
  const handleVideoUpload = useCallback(async () => {
    const payload = new newnewapi.GetVideoUploadUrlRequest({
      filename: video.name,
    });

    const res = await getVideoUploadUrl(payload);

    if (!res.data || res.error) throw new Error(res.error?.message ?? 'An error occured');

    const uploadResponse = await fetch(
      res.data.uploadUrl,
      {
        method: 'PUT',
        body: video,
        headers: {
          'Content-Type': video.type,
        },
      },
    );

    if (!uploadResponse.ok) throw new Error('Upload failed');

    return res.data;
  }, [video]);
  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const videoResp: any = await handleVideoUpload();
      const body: any = {
        post: {
          title: post.title,
          settings: post.options,
          startsAt: post.startsAt.type === 'right-away' ? null : formatStartsAt()
            .format(),
          expiresAfter: formatExpiresAt(true),
          announcementVideoUrl: videoResp.publicUrl,
        },
      };

      if (tab === 'auction') {
        body.auction = {
          minimalBid: auction.minimalBid,
        };
      } else if (tab === 'multiple-choice') {
        body.multiplechoice = {
          options: multiplechoice.choices.map((choice) => ({ text: choice.text })),
          isSuggestionsAllowed: multiplechoice.options.allowSuggestions,
        };
      } else if (tab === 'crowdfunding') {
        body.crowdfunding = {
          targetBackerCount: crowdfunding.targetBackerCount,
        };
      }

      const payload = new newnewapi.CreatePostRequest(body);

      const {
        data,
        error,
      } = await createPost(payload);

      if (!data || error) {
        throw new Error(error?.message ?? 'Request failed');
      }

      dispatch(setPostData(data));
      setLoading(false);
      router.push(`/creation/${tab}/published`);
    } catch (err: any) {
      setLoading(false);
    }
  }, [
    tab,
    router,
    dispatch,
    formatStartsAt,
    handleVideoUpload,
    post.title,
    post.options,
    post.startsAt.type,
    auction.minimalBid,
    crowdfunding.targetBackerCount,
    multiplechoice.choices,
    multiplechoice.options.allowSuggestions,
    formatExpiresAt,
  ]);
  const settings: any = useMemo(() => _compact([
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
      value: t(`preview.values.${post.options.commentsEnabled ? 'comments-allowed' : 'comments-forbidden'}`),
    },
    tab === 'multiple-choice' && {
      key: 'allowSuggestions',
      value: t(`preview.values.${multiplechoice.options.allowSuggestions ? 'allowSuggestions-allowed' : 'allowSuggestions-forbidden'}`),
    },
  ]), [
    t,
    tab,
    formatStartsAt,
    post.options.commentsEnabled,
    auction.minimalBid,
    crowdfunding.targetBackerCount,
    multiplechoice.options.allowSuggestions,
    formatExpiresAt,
  ]);
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
  const renderChoice = (item: any, index: number) => (
    <SChoiceItem key={item.id}>
      <SChoiceItemValue>
        <Text variant={2} weight={600}>
          {index + 1}
        </Text>
      </SChoiceItemValue>
      <SChoiceItemTitle variant={2} weight={500}>
        {item.text}
      </SChoiceItemTitle>
    </SChoiceItem>
  );

  return (
    <>
      <SContent>
        <SHeadline variant={5}>
          {post.title}
        </SHeadline>
        {tab === 'multiple-choice' && (
          <SChoices>
            {multiplechoice.choices.map(renderChoice)}
          </SChoices>
        )}
        <SSettings>
          {settings.map(renderSetting)}
        </SSettings>
        <SVideo
          loop
          autoPlay
          src={video.url}
        />
      </SContent>
      {isMobile && (
        <SButtonWrapper>
          <SButtonContent>
            <SButton
              view="primaryGrad"
              loading={loading}
              onClick={handleSubmit}
              disabled={disabled}
            >
              {t('preview.button.submit')}
            </SButton>
          </SButtonContent>
        </SButtonWrapper>
      )}
    </>
  );
};

export default PreviewContent;

const SContent = styled.div`
  display: flex;
  margin-top: 16px;
  flex-direction: column;
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

const SChoiceItemValue = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  overflow: hidden;
  min-width: 28px;
  min-height: 28px;
  background: ${(props) => props.theme.colorsThemed.background.outlines1};
  align-items: center;
  border-radius: 14px;
  justify-content: center;
`;

const SVideo = styled.video`
  left: -16px;
  width: 100vw;
  height: auto;
  position: relative;
  margin-top: 42px;
`;
