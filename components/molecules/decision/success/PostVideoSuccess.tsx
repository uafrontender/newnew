/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';

import isBrowser from '../../../../utils/isBrowser';
import { Mixpanel } from '../../../../utils/mixpanel';
import { markPost } from '../../../../api/endpoints/post';

import PostVideoResponsesSlider from '../moderation/PostVideoResponsesSlider';
import PostVideoSoundButton from '../../../atoms/decision/PostVideoSoundButton';
import { useAppState } from '../../../../contexts/appStateContext';
import { useResponseUuidFromUrl } from '../../../../contexts/responseUuidFromUrlContext';

const PostVideojsPlayer = dynamic(() => import('../common/PostVideojsPlayer'), {
  ssr: false,
});

interface IPostVideoSuccess {
  postUuid: string;
  announcement: newnewapi.IVideoUrls;
  response?: newnewapi.IVideoUrls;
  responseViewed: boolean;
  additionalResponses?: newnewapi.IVideoUrls[];
  openedTab: 'announcement' | 'response';
  setOpenedTab: (tab: 'announcement' | 'response') => void;
  handleSetResponseViewed: (newValue: boolean) => void;
  isMuted: boolean;
  handleToggleMuted: () => void;
}

const PostVideoSuccess: React.FunctionComponent<IPostVideoSuccess> = ({
  postUuid,
  isMuted,
  announcement,
  response,
  responseViewed,
  additionalResponses,
  openedTab,
  setOpenedTab,
  handleSetResponseViewed,
  handleToggleMuted,
}) => {
  const { t } = useTranslation('page-Post');
  const { resizeMode, userLoggedIn } = useAppState();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const { responseFromUrl } = useResponseUuidFromUrl();

  const responseWithAdditionalVideos = useMemo(() => {
    if (additionalResponses && Array.isArray(additionalResponses)) {
      return [response, ...additionalResponses] as newnewapi.IVideoUrls[];
    }

    return [response] as newnewapi.IVideoUrls[];
  }, [additionalResponses, response]);

  // Show controls on shorter screens
  const [uiOffset, setUiOffset] = useState<number | undefined>(undefined);

  useEffect(
    () => {
      async function markResponseAsViewed() {
        try {
          const payload = new newnewapi.MarkPostRequest({
            postUuid,
            markAs: newnewapi.MarkPostRequest.Kind.RESPONSE_VIDEO_VIEWED,
          });

          const res = await markPost(payload);

          if (!res.error) {
            handleSetResponseViewed(true);
          }
        } catch (err) {
          console.error(err);
        }
      }

      if (openedTab === 'response' && userLoggedIn && !responseViewed) {
        markResponseAsViewed();
      } else if (openedTab === 'response' && !userLoggedIn && !responseViewed) {
        handleSetResponseViewed(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      openedTab,
      postUuid,
      userLoggedIn,
      responseViewed,
      // handleSetResponseViewed, - reason unknown
    ]
  );

  // Adjust sound button if needed
  useEffect(() => {
    const handleScroll = () => {
      const rect = document
        .getElementById('sound-button')
        ?.getBoundingClientRect();

      let videoRect: DOMRect | undefined;
      videoRect = document
        .getElementById(`${postUuid}`)
        ?.getBoundingClientRect();

      if (!videoRect) {
        videoRect = document
          .getElementById(`video-${postUuid}`)
          ?.getBoundingClientRect();
      }

      if (!videoRect) {
        videoRect = document
          .getElementById('responsesSlider')
          ?.getBoundingClientRect();
      }

      if (rect && videoRect) {
        const delta = window.innerHeight - videoRect.bottom;
        if (delta < 0) {
          setUiOffset(Math.abs(delta));
        } else {
          setUiOffset(undefined);
        }
      }
    };

    if (isBrowser() && !isMobileOrTablet) {
      const rect = document
        .getElementById('sound-button')
        ?.getBoundingClientRect();

      if (rect) {
        const isInViewPort =
          rect.bottom <=
          (window.innerHeight || document.documentElement?.clientHeight);

        if (!isInViewPort) {
          const delta = window.innerHeight - rect.bottom;
          setUiOffset(Math.abs(delta));
        } else {
          setUiOffset(undefined);
        }
      }

      handleScroll();
      document?.addEventListener('scroll', handleScroll);
    }

    return () => {
      setUiOffset(undefined);

      if (isBrowser() && !isMobileOrTablet) {
        document?.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isMobileOrTablet, postUuid, openedTab]);

  return (
    <SVideoWrapper>
      {openedTab === 'response' && response ? (
        <>
          {!additionalResponses || additionalResponses.length === 0 ? (
            <PostVideojsPlayer
              key={postUuid}
              id={`video-${postUuid}`}
              resources={response}
              muted={isMuted}
              showPlayButton
              videoDurationWithTime
            />
          ) : (
            <PostVideoResponsesSlider
              isDeletingAdditionalResponse={false}
              videos={responseWithAdditionalVideos}
              isMuted={isMuted}
              uiOffset={uiOffset}
              videoDurationWithTime
              autoscroll
              initialVideoFromUrl={responseFromUrl || undefined}
            />
          )}
          <PostVideoSoundButton
            postUuid={postUuid}
            isMuted={isMuted}
            uiOffset={uiOffset}
            handleToggleMuted={handleToggleMuted}
          />
        </>
      ) : (
        <>
          <PostVideojsPlayer
            id={postUuid}
            resources={announcement}
            muted={isMuted}
            showPlayButton
            videoDurationWithTime
          />
          <PostVideoSoundButton
            postUuid={postUuid}
            isMuted={isMuted}
            uiOffset={uiOffset}
            handleToggleMuted={handleToggleMuted}
          />
        </>
      )}
      {!responseViewed && openedTab === 'announcement' && response ? (
        <SWatchResponseWrapper>
          <SWatchResponseBtn
            shouldView={!responseViewed}
            onClickCapture={() => {
              Mixpanel.track('Set Opened Tab Response', {
                _stage: 'Post',
                _postUuid: postUuid,
                _component: 'PostVideoSuccess',
              });
            }}
            onClick={() => setOpenedTab('response')}
          >
            {t('postVideoSuccess.tabs.watchResponseFirstTime')}
          </SWatchResponseBtn>
        </SWatchResponseWrapper>
      ) : null}
      {responseViewed ? (
        <SToggleVideoWidget>
          <SChangeTabBtn
            shouldView={openedTab === 'announcement'}
            onClickCapture={() => {
              Mixpanel.track('Set Opened Tab Announcement', {
                _stage: 'Post',
                _postUuid: postUuid,
                _component: 'PostVideoSuccess',
              });
            }}
            onClick={() => setOpenedTab('announcement')}
          >
            {t('postVideoSuccess.tabs.announcement')}
          </SChangeTabBtn>
          <SChangeTabBtn
            shouldView={openedTab === 'response'}
            onClickCapture={() => {
              Mixpanel.track('Set Opened Tab Response', {
                _stage: 'Post',
                _postUuid: postUuid,
                _component: 'PostVideoSuccess',
              });
            }}
            onClick={() => setOpenedTab('response')}
          >
            {t('postVideoSuccess.tabs.response')}
          </SChangeTabBtn>
        </SToggleVideoWidget>
      ) : null}
    </SVideoWrapper>
  );
};

PostVideoSuccess.defaultProps = {
  response: undefined,
};

export default PostVideoSuccess;

const SVideoWrapper = styled.div`
  grid-area: video;

  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;

  overflow: hidden;

  /* width: calc(100vw - 32px); */
  width: 100vw;
  height: calc(100vh - 72px);
  margin-left: -16px;

  video {
    display: block;
    width: 100%;
  }

  ${({ theme }) => theme.media.tablet} {
    width: 284px;
    height: 506px;
    margin-left: initial;

    flex-shrink: 0;

    border-radius: ${({ theme }) => theme.borderRadius.medium};

    video {
      width: initial;
      height: 100%;
    }
  }

  ${({ theme }) => theme.media.laptop} {
    width: 410px;
    height: 728px;
  }
`;

// Watch response for the first time
const SWatchResponseWrapper = styled.div`
  position: absolute;
  bottom: 16px;
  left: calc(50% - 120px);

  width: 240px;

  overflow: hidden;
  border-radius: 16px;

  ${({ theme }) => theme.media.tablet} {
    display: none;
  }
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

  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  cursor: pointer;

  &:active,
  &:focus {
    outline: none;
  }
`;

const SToggleVideoWidget = styled.div`
  position: absolute;
  bottom: 16px;
  left: calc(50% - 120px);

  display: flex;

  width: 240px;

  overflow: hidden;
  border-radius: 16px;

  ${({ theme }) => theme.media.tablet} {
    display: none;
  }
`;

const SChangeTabBtn = styled.button<{
  shouldView?: boolean;
}>`
  background: ${({ shouldView, theme }) =>
    shouldView ? theme.colorsThemed.accent.blue : 'rgba(11, 10, 19, 0.2)'};
  border: transparent;

  padding: 17px 24px;

  width: 50%;

  text-align: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  cursor: pointer;

  &:active,
  &:focus {
    outline: none;
  }
`;
