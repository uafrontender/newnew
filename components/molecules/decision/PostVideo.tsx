/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef } from 'react';
import styled from 'styled-components';

import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';

import VolumeOff from '../../../public/images/svg/icons/filled/VolumeOFF.svg';
import VolumeOn from '../../../public/images/svg/icons/filled/VolumeON.svg';

interface IPostVideo {
  videoSrc: string;
  isMuted: boolean;
  handleToggleMuted: () => void;
}

const PostVideo: React.FunctionComponent<IPostVideo> = ({
  videoSrc,
  isMuted,
  handleToggleMuted,
}) => {
  const videoRef = useRef<HTMLVideoElement>();

  return (
    <SVideoWrapper>
      <video
        ref={(el) => {
          videoRef.current = el!!;
        }}
        src={videoSrc}
        muted={isMuted}
        playsInline
        autoPlay
        loop
      />
      <SSoundButton
        iconOnly
        view="transparent"
        onClick={() => handleToggleMuted()}
      >
        <InlineSvg
          svg={isMuted ? VolumeOff : VolumeOn}
          width="24px"
          height="24px"
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
  right: 24px;
  bottom: 24px;

  padding: 12px;
  width: 48px;
  height: 48px;

`;
