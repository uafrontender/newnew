/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';

import isBrowser from '../../../../utils/isBrowser';
import { markPost } from '../../../../api/endpoints/post';
import { useAppSelector } from '../../../../redux-store/store';

import PostVideoSoundButton from '../../../atoms/decision/PostVideoSoundButton';

const PostBitmovinPlayer = dynamic(() => import('./PostBitmovinPlayer'), {
  ssr: false,
});

interface IPostVideo {
  postId: string;
  announcement: newnewapi.IVideoUrls;
  response?: newnewapi.IVideoUrls;
  responseViewed: boolean;
  handleSetResponseViewed: (newValue: boolean) => void;
  isMuted: boolean;
  handleToggleMuted: () => void;
}

const PostVideo: React.FunctionComponent<IPostVideo> = ({
  postId,
  announcement,
  response,
  responseViewed,
  handleSetResponseViewed,
  isMuted,
  handleToggleMuted,
}) => {
  const { t } = useTranslation('page-Post');
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
  const [soundBtnBottomOverriden, setSoundBtnBottomOverriden] = useState<
    number | undefined
  >(undefined);

  // Tabs
  const [openedTab, setOpenedTab] = useState<'announcement' | 'response'>(
    'announcement'
  );

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
        const delta = window.innerHeight - videoRect.bottom;
        if (delta < 0) {
          setSoundBtnBottomOverriden(Math.abs(delta) + 24);
        } else {
          setSoundBtnBottomOverriden(undefined);
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
        } else {
          setSoundBtnBottomOverriden(undefined);
        }
      }

      document?.addEventListener('scroll', handleScroll);
    }

    return () => {
      setSoundBtnBottomOverriden(undefined);

      if (isBrowser() && !isMobileOrTablet) {
        document?.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isMobileOrTablet, postId]);

  return (
    <SVideoWrapper>
      {openedTab === 'response' && response ? (
        <>
          <PostBitmovinPlayer
            key={`${postId}--${isMuted ? 'muted' : 'sound'}`}
            id={`video-${postId}`}
            resources={response}
            muted={isMuted}
            showPlayButton
          />
          <PostVideoSoundButton
            postId={postId}
            isMuted={isMuted}
            soundBtnBottomOverriden={soundBtnBottomOverriden}
            handleToggleMuted={handleToggleMuted}
          />
        </>
      ) : (
        <>
          <PostBitmovinPlayer
            id={postId}
            resources={announcement}
            muted={isMuted}
            showPlayButton
          />
          <PostVideoSoundButton
            postId={postId}
            isMuted={isMuted}
            soundBtnBottomOverriden={soundBtnBottomOverriden}
            handleToggleMuted={handleToggleMuted}
          />
        </>
      )}
      {response ? (
        <SToggleVideoWidget>
          {openedTab === 'response' ? (
            <SChangeTabBtn onClick={() => setOpenedTab('announcement')}>
              {t('postVideo.tabs.backToOriginalVideo')}
            </SChangeTabBtn>
          ) : (
            <SChangeTabBtn
              shouldView={!responseViewed}
              onClick={() => setOpenedTab('response')}
            >
              {t('postVideo.tabs.backToResponse')}
            </SChangeTabBtn>
          )}
        </SToggleVideoWidget>
      ) : null}
    </SVideoWrapper>
  );
};

PostVideo.defaultProps = {
  response: undefined,
};

export default PostVideo;

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

const SToggleVideoWidget = styled.div`
  position: absolute;
  bottom: 16px;
  left: calc(50% - 90px);

  width: 180px;

  overflow: hidden;
  border-radius: 16px;

  ${({ theme }) => theme.media.tablet} {
    bottom: 24px;
  }
`;

const SChangeTabBtn = styled.button<{
  shouldView?: boolean;
}>`
  background: ${({ shouldView }) =>
    shouldView ? '#FFFFFF' : 'rgba(11, 10, 19, 0.2)'};
  border: transparent;
  border-radius: 16px;

  padding: 12px 24px;

  width: 100%;

  color: ${({ shouldView }) => (shouldView ? '#2C2C33' : '#FFFFFF')};
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;

  cursor: pointer;

  &:active,
  &:focus {
    outline: none;
  }
`;
