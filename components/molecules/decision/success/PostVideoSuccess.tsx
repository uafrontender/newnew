/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';

import { markPost } from '../../../../api/endpoints/post';
import { useAppSelector } from '../../../../redux-store/store';

import Button from '../../../atoms/Button';
import InlineSvg from '../../../atoms/InlineSVG';

import VolumeOff from '../../../../public/images/svg/icons/filled/VolumeOFF1.svg';
import VolumeOn from '../../../../public/images/svg/icons/filled/VolumeON.svg';
import isSafari from '../../../../utils/isSafari';
import isBrowser from '../../../../utils/isBrowser';

const PostBitmovinPlayer = dynamic(() => import('../PostBitmovinPlayer'), {
  ssr: false,
});

interface IPostVideoSuccess {
  postId: string;
  announcement: newnewapi.IVideoUrls;
  response?: newnewapi.IVideoUrls;
  responseViewed: boolean;
  openedTab: 'announcement' | 'response';
  setOpenedTab: (tab: 'announcement' | 'response') => void;
  handleSetResponseViewed: (newValue: boolean) => void;
  isMuted: boolean;
  handleToggleMuted: () => void;
}

const PostVideoSuccess: React.FunctionComponent<IPostVideoSuccess> = ({
  postId,
  isMuted,
  announcement,
  response,
  responseViewed,
  openedTab,
  setOpenedTab,
  handleSetResponseViewed,
  handleToggleMuted,
}) => {
  const { t } = useTranslation('decision');
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  // Show controls on shorter screens
  const [soundBtnBottomOverriden, setSoundBtnBottomOverriden] =
    useState<number | undefined>(undefined);

  useEffect(() => {
    async function markResponseAsViewed() {
      try {
        const payload = new newnewapi.MarkPostRequest({
          postUuid: postId,
          markAs: newnewapi.MarkPostRequest.Kind.RESPONSE_VIDEO_VIEWED,
        });

        const res = await markPost(payload);

        console.log(res);

        if (!res.error) {
          handleSetResponseViewed(true);
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (openedTab === 'response' && user.loggedIn && !responseViewed) {
      markResponseAsViewed();
    } else if (openedTab === 'response' && !user.loggedIn && !responseViewed) {
      handleSetResponseViewed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedTab, postId, user.loggedIn, responseViewed]);

  // Adjust sound button if needed
  useEffect(() => {
    const handleScroll = () => {
      const rect = document
        .getElementById('sound-button')
        ?.getBoundingClientRect();

      const videoRect = document
        .getElementById(`${postId}`)
        ?.getBoundingClientRect();

      if (rect && videoRect) {
        const delta2 = window.innerHeight - videoRect.bottom;
        if (delta2 < 0) {
          setSoundBtnBottomOverriden(Math.abs(delta2) + 24);
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
          setSoundBtnBottomOverriden(Math.abs(delta) + 24);
        }
      }

      document
        ?.getElementById('post-modal-container')
        ?.addEventListener('scroll', handleScroll);
    }

    return () => {
      setSoundBtnBottomOverriden(undefined);

      if (isBrowser() && !isMobileOrTablet) {
        document
          ?.getElementById('post-modal-container')
          ?.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isMobileOrTablet, postId]);

  return (
    <SVideoWrapper>
      {openedTab === 'response' && response ? (
        <>
          <PostBitmovinPlayer
            // key={`${postId}--${isMuted ? 'muted' : 'sound'}`}
            key={postId}
            id={`video-${postId}`}
            resources={response}
            muted={isMuted}
          />
          <SSoundButton
            id='sound-button'
            iconOnly
            view='transparent'
            onClick={(e) => {
              e.stopPropagation();
              handleToggleMuted();
              if (isSafari()) {
                (
                  document?.getElementById(
                    `bitmovinplayer-video-${postId}`
                  ) as HTMLVideoElement
                )?.play();
              }
            }}
            style={{
              ...(soundBtnBottomOverriden
                ? {
                    bottom: soundBtnBottomOverriden,
                  }
                : {}),
            }}
          >
            <InlineSvg
              svg={isMuted ? VolumeOff : VolumeOn}
              width={isMobileOrTablet ? '20px' : '24px'}
              height={isMobileOrTablet ? '20px' : '24px'}
              fill='#FFFFFF'
            />
          </SSoundButton>
        </>
      ) : (
        <>
          <PostBitmovinPlayer
            id={postId}
            resources={announcement}
            muted={isMuted}
          />
          <SSoundButton
            id='sound-button'
            iconOnly
            view='transparent'
            onClick={(e) => {
              e.stopPropagation();
              handleToggleMuted();
              if (isSafari()) {
                (
                  document?.getElementById(
                    `bitmovinplayer-video-${postId}`
                  ) as HTMLVideoElement
                )?.play();
              }
            }}
            style={{
              ...(soundBtnBottomOverriden
                ? {
                    bottom: soundBtnBottomOverriden,
                  }
                : {}),
            }}
          >
            <InlineSvg
              svg={isMuted ? VolumeOff : VolumeOn}
              width={isMobileOrTablet ? '20px' : '24px'}
              height={isMobileOrTablet ? '20px' : '24px'}
              fill='#FFFFFF'
            />
          </SSoundButton>
        </>
      )}
      {!responseViewed && openedTab === 'announcement' && response ? (
        <SWatchResponseWrapper>
          <SWatchResponseBtn
            shouldView={!responseViewed}
            onClick={() => setOpenedTab('response')}
          >
            {t('PostVideoSuccess.tabs.watch_reponse_first_time')}
          </SWatchResponseBtn>
        </SWatchResponseWrapper>
      ) : null}
      {responseViewed ? (
        <SToggleVideoWidget>
          <SChangeTabBtn
            shouldView={openedTab === 'announcement'}
            onClick={() => setOpenedTab('announcement')}
          >
            {t('PostVideoSuccess.tabs.announcement')}
          </SChangeTabBtn>
          <SChangeTabBtn
            shouldView={openedTab === 'response'}
            onClick={() => setOpenedTab('response')}
          >
            {t('PostVideoSuccess.tabs.response')}
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

const SSoundButton = styled(Button)`
  position: absolute;
  right: 16px;
  bottom: 24px;

  padding: 8px;
  width: 36px;
  height: 36px;

  border-radius: ${({ theme }) => theme.borderRadius.small};

  ${({ theme }) => theme.media.tablet} {
    width: 36px;
    height: 36px;
  }

  ${({ theme }) => theme.media.laptop} {
    padding: 12px;
    width: 48px;
    height: 48px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
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
