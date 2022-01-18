/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';

import { useAppSelector } from '../../../redux-store/store';

import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';

import VolumeOff from '../../../public/images/svg/icons/filled/VolumeOFF1.svg';
import VolumeOn from '../../../public/images/svg/icons/filled/VolumeON.svg';

const PostBitmovinPlayer = dynamic(() => import('./PostBitmovinPlayer'), {
  ssr: false,
});

interface IPostVideo {
  postId: string;
  announcement: newnewapi.IVideoUrls;
  isMuted: boolean;
  handleToggleMuted: () => void;
}

const PostVideo: React.FunctionComponent<IPostVideo> = ({
  postId,
  announcement,
  isMuted,
  handleToggleMuted,
}) => {
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobileOrTablet = ['mobile', 'mobileS', 'mobileM', 'mobileL', 'tablet'].includes(resizeMode);

  return (
    <SVideoWrapper>
      {/* <video
        ref={(el) => {
          videoRef.current = el!!;
        }}
        src={videoSrc}
        muted={isMuted}
        playsInline
        autoPlay
        loop
      /> */}
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
    </SVideoWrapper>
  );
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
    right: initial;
    left: 16px;
  }

  ${({ theme }) => theme.media.laptop} {
    right: initial;
    left: 24px;
    bottom: 24px;

    padding: 12px;
    width: 48px;
    height: 48px;

    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }
`;
