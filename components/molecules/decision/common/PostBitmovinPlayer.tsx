/* eslint-disable no-multi-assign */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import addsfadsf from 'video.js/dist/types/';

import Lottie from '../../../atoms/Lottie';
import InlineSvg from '../../../atoms/InlineSVG';

import logoAnimation from '../../../../public/animations/mobile_logo.json';
import PlayIcon from '../../../../public/images/svg/icons/filled/Play.svg';
import PlayerScrubber from '../../../atoms/PlayerScrubber';

interface IPostBitmovinPlayer {
  id: string;
  muted?: boolean;
  resources?: newnewapi.IVideoUrls;
  videoDurationWithTime?: boolean;
  showPlayButton?: boolean;
}

export const PostBitmovinPlayer: React.FC<IPostBitmovinPlayer> = ({
  id,
  muted,
  resources,
  videoDurationWithTime,
  showPlayButton,
}) => {
  const videoRef = React.useRef(null);
  const playerRef = React.useRef<Player>(null);

  const [isPaused, setIsPaused] = useState(false);
  const handleSetIsPaused = useCallback((stateValue: boolean) => {
    setIsPaused(stateValue);
  }, []);

  const [isHovered, setIsHovered] = useState(false);

  const [playbackTime, setPlaybackTime] = useState(0);
  const handlePlayerScrubberChangeTime = useCallback((v: number) => {
    setPlaybackTime(v);

    playerRef.current?.pause();
    playerRef.current?.currentTime(v);
    setTimeout(() => {
      playerRef.current?.play();
    }, 100);
  }, []);

  const options = useMemo(
    () => ({
      autoplay: true,
      loop: true,
      controls: false,
      responsive: false,
      fluid: true,
      sources: [
        {
          src: resources?.hlsStreamUrl,
          type: 'application/x-mpegURL',
        },
      ],
    }),
    [resources?.hlsStreamUrl]
  );

  const handlePlayerReady = useCallback(
    (p: Player) => {
      // @ts-ignore
      playerRef.current = p;

      // You can handle player events here, for example:
      // @ts-ignore
      p.on('waiting', () => {
        videojs.log('player is waiting');
      });
      // @ts-ignore
      p.on('dispose', () => {
        videojs.log('player will dispose');
      });

      // @ts-ignore
      p.on('play', () => {
        videojs.log('player is playing');
        handleSetIsPaused(false);
      });
      // @ts-ignore
      p.on('pause', () => {
        videojs.log('player is paused');
        handleSetIsPaused(true);
      });
      // @ts-ignore
      p.on('timeupdate', (e) => {
        console.log(p.currentTime());
        setPlaybackTime(p.currentTime());
      });
    },
    [handleSetIsPaused]
  );

  React.useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement('video-js');

      videoElement.classList.add('vjs-big-play-centered');
      // @ts-ignore
      videoRef.current?.appendChild(videoElement);
      // @ts-ignore
      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        handlePlayerReady && handlePlayerReady(player);
      }));

      // You could update an existing player in the `else` block here
      // on prop change, for example:
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        // @ts-ignore
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current?.muted(muted);
    }
  }, [muted]);

  return (
    <SContent
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <SImageBG src={resources?.thumbnailImageUrl ?? ''} />
      <SVideoWrapper data-vjs-player>
        <SWrapper
          id={id}
          onClick={() => {
            if (!playerRef.current?.paused()) {
              playerRef.current?.pause();
            } else {
              playerRef.current?.play()?.catch(() => {
                handleSetIsPaused(true);
              });
            }
          }}
          ref={videoRef}
        />
        {showPlayButton && isPaused && (
          <SPlayPseudoButton
            onClick={() => {
              if (!playerRef.current?.paused()) {
                playerRef.current?.pause();
              } else {
                playerRef.current?.play()?.catch(() => {
                  handleSetIsPaused(true);
                });
              }
            }}
          >
            <InlineSvg
              svg={PlayIcon}
              width='32px'
              height='32px'
              fill='#FFFFFF'
            />
          </SPlayPseudoButton>
        )}
      </SVideoWrapper>
      {/* {isLoading && (
        <SLoader>
          <Lottie
            width={65}
            height={60}
            options={{
              loop: false,
              autoplay: true,
              animationData: logoAnimation,
            }}
            isStopped={!isLoading}
          />
        </SLoader>
      )} */}
      <PlayerScrubber
        isHovered={isHovered}
        currentTime={playbackTime}
        videoDuration={playerRef?.current?.duration() || 10}
        withTime={videoDurationWithTime}
        handleChangeTime={handlePlayerScrubberChangeTime}
      />
    </SContent>
  );
};

export default PostBitmovinPlayer;

PostBitmovinPlayer.defaultProps = {
  muted: true,
  resources: {},
  showPlayButton: false,
};

const SContent = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  ${({ theme }) => theme.media.tablet} {
    border-radius: 16px;
  }
`;

const SVideoWrapper = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
  min-width: 100%;
  min-height: 100%;
  background: transparent;

  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);

  ${({ theme }) => theme.media.tablet} {
    border-radius: 16px;
  }
`;

const SWrapper = styled.div`
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
  position: relative !important;
  min-width: 100% !important;
  min-height: 100% !important;
  background: transparent !important;

  &:before {
    display: none !important;
  }

  video {
    width: 100% !important;
    height: 100% !important;
  }
`;

const SImageBG = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.1);

  @supports not ((-webkit-backdrop-filter: none) or (backdrop-filter: none)) {
    filter: blur(32px);
  }
`;

const SLoader = styled.div`
  position: absolute;
  top: calc(50% - 30px);
  left: calc(50% - 32.5px);
  z-index: 1;
`;

const SPlayPseudoButton = styled.button`
  position: absolute;
  top: calc(50% - 32px);
  left: calc(50% - 32px);

  display: flex;
  justify-content: center;
  align-items: center;

  width: 64px;
  height: 64px;
  background: rgba(11, 10, 19, 0.65);
  border-radius: 21px;
  border: transparent;

  cursor: pointer;

  &:focus,
  &:active {
    outline: none;
  }
`;
