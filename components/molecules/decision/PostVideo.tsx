/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { newnewapi } from 'newnew-api';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';

import { useAppSelector } from '../../../redux-store/store';

import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';

import VolumeOff from '../../../public/images/svg/icons/filled/VolumeOFF1.svg';
import VolumeOn from '../../../public/images/svg/icons/filled/VolumeON.svg';
import { markPost } from '../../../api/endpoints/post';

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
  const { t } = useTranslation('decision');
  const user = useAppSelector((state) => state.user);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  // Tabs
  const [openedTab, setOpenedTab] = useState<'announcement' | 'response'>('announcement');

  useEffect(() => {
    async function markResponseAsViewed() {
      try {
        const payload = new newnewapi.MarkPostRequest({
          postUuid: postId,
          markAs: newnewapi.MarkPostRequest.Kind.RESPONSE_VIDEO_VIEWED,
        });

        const res = await markPost(payload);

        console.log(res)

        if (!res.error) {
          handleSetResponseViewed(true);
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (openedTab === 'response'
      && user.loggedIn
      && !responseViewed
    ) {
      markResponseAsViewed();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedTab, postId, user.loggedIn, responseViewed]);

  return (
    <SVideoWrapper>
      {openedTab === 'response' && response ? (
        <>
          <PostBitmovinPlayer
            id={postId}
            resources={response}
            muted={isMuted}
          />
          <SSoundButton
            iconOnly
            view="transparent"
            onClick={() => handleToggleMuted()}
          >
            <InlineSvg
              svg={isMuted ? VolumeOff : VolumeOn}
              width={isMobileOrTablet ? '20px' : '24px'}
              height={isMobileOrTablet ? '20px' : '24px'}
              fill="#FFFFFF"
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
            iconOnly
            view="transparent"
            onClick={() => handleToggleMuted()}
          >
            <InlineSvg
              svg={isMuted ? VolumeOff : VolumeOn}
              width={isMobileOrTablet ? '20px' : '24px'}
              height={isMobileOrTablet ? '20px' : '24px'}
              fill="#FFFFFF"
            />
          </SSoundButton>
        </>
      )}
      {response ? (
        <SToggleVideoWidget>
          {openedTab === 'response' ? (
            <SChangeTabBtn
              onClick={() => setOpenedTab('announcement')}
            >
              { t('PostVideo.tabs.back_to_original') }
            </SChangeTabBtn>
          ) : (
            <SChangeTabBtn
              shouldView={!responseViewed}
              onClick={() => setOpenedTab('response')}
            >
              { t('PostVideo.tabs.back_to_response') }
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
  bottom: 16px;

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
  background: ${({ shouldView }) => (shouldView ? '#FFFFFF' : 'rgba(11, 10, 19, 0.2)')};
  border: transparent;
  border-radius: 16px;

  padding: 12px 24px;

  width: 100%;

  color: ${({ shouldView }) => (shouldView ? '#2C2C33' : '#FFFFFF')};
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;

  cursor: pointer;

  &:active, &:focus {
    outline: none;
  }
`;
