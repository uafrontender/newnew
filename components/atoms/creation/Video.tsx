import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import styled, { useTheme } from 'styled-components';
import Button from '../Button';
import InlineSVG from '../InlineSVG';

import volumeOn from '../../../public/images/svg/icons/filled/VolumeON.svg';
import volumeOff from '../../../public/images/svg/icons/filled/VolumeOff.svg';

interface IVideo {
  src: string;
  play: boolean;
  loop?: boolean;
  muted: boolean;
  thumbnails?: any;
}

export const Video: React.FC<IVideo> = (props) => {
  const {
    src,
    play,
    loop,
    muted,
    thumbnails,
  } = props;
  const videoRef: any = useRef();
  const [isMuted, setIsMuted] = useState(muted);
  const theme = useTheme();

  const handleVideoProgress = useCallback(() => {
    if (play) {
      if (videoRef.current.currentTime >= thumbnails?.endTime) {
        videoRef.current.pause();
        videoRef.current.currentTime = thumbnails?.startTime;
        videoRef.current.play();
      }
    }
  }, [play, thumbnails]);
  const toggleThumbnailVideoMuted = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  useEffect(() => {
    if (videoRef?.current && thumbnails) {
      videoRef.current.ontimeupdate = handleVideoProgress;
    }
  }, [handleVideoProgress, thumbnails, videoRef]);
  useEffect(() => {
    if (videoRef?.current) {
      if (play) {
        videoRef.current.currentTime = thumbnails?.startTime || 0;
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [play, videoRef, thumbnails]);

  return (
    <SWrapper>
      <SVideo
        src={src}
        ref={videoRef}
        loop={loop}
        muted={isMuted}
      />
      <SModalSoundIcon>
        <Button
          iconOnly
          view="transparent"
          onClick={toggleThumbnailVideoMuted}
        >
          <InlineSVG
            svg={isMuted ? volumeOff : volumeOn}
            fill={theme.colors.white}
            width="20px"
            height="20px"
          />
        </Button>
      </SModalSoundIcon>
    </SWrapper>
  );
};

export default Video;

Video.defaultProps = {
  loop: false,
  thumbnails: null,
};

const SWrapper = styled.div`
  width: 100%;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
`;

const SVideo = styled.video`
  width: 100%;
  height: auto;

  ${({ theme }) => theme.media.mobileL} {
    overflow: hidden;
    border-radius: 16px;
  }
`;

const SModalSoundIcon = styled.div`
  right: 16px;
  bottom: 16px;
  position: absolute;

  button {
    width: 36px;
    height: 36px;
    border-radius: 12px;
  }
`;
