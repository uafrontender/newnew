/* eslint-disable no-unused-expressions */
/* eslint-disable no-multi-assign */
import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import styled, { css, useTheme } from 'styled-components';
import hlsParser from 'hls-parser';
import videojs from 'video.js';
import 'videojs-contrib-quality-levels';

import Button from './Button';
import Lottie from './Lottie';
import InlineSVG from './InlineSVG';
import PlayerScrubber from './PlayerScrubber';

import PlayIcon from '../../public/images/svg/icons/filled/Play.svg';
import volumeOn from '../../public/images/svg/icons/filled/VolumeON.svg';
import volumeOff from '../../public/images/svg/icons/filled/VolumeOFF1.svg';
import logoAnimation from '../../public/animations/mobile_logo.json';

interface IVideojsPlayer {
  id: string;
  muted?: boolean;
  innerRef?: any;
  resources?: any;
  borderRadius?: string;
  mutePosition?: 'left' | 'right';
  withMuteControl?: boolean;
  showPlayButton?: boolean;
  playButtonSize?: 'default' | 'small';
  withScrubber?: boolean;
}

export const VideojsPlayer: React.FC<IVideojsPlayer> = (props) => {
  const {
    id,
    muted,
    innerRef,
    resources,
    mutePosition,
    borderRadius,
    withMuteControl,
    showPlayButton,
    playButtonSize,
    withScrubber,
  } = props;
  const theme = useTheme();
  const [isMuted, setIsMuted] = useState(muted);
  const toggleThumbnailVideoMuted = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const videoRef = useRef(null);
  const playerRef = useRef<videojs.Player>();

  const [isLoading, setIsLoading] = useState(false);

  const [isPaused, setIsPaused] = useState(false);

  const handleSetIsPaused = useCallback((stateValue: boolean) => {
    setIsPaused(stateValue);
  }, []);

  const [videoOrientation, setVideoOrientation] = useState<
    'vertical' | 'horizontal'
  >('vertical');

  const [isHovered, setIsHovered] = useState(false);

  const [playbackTime, setPlaybackTime] = useState(0);
  const [isScrubberTimeChanging, setIsScrubberTimeChanging] = useState(false);

  const handlePlayerScrubberChangeTime = useCallback(
    (newValue: number) => {
      // Pause the player when scrubbing
      // to avoid double playback start
      setIsScrubberTimeChanging(true);
      playerRef.current?.pause();
      setPlaybackTime(newValue);
      playerRef.current?.currentTime(newValue);

      setTimeout(() => {
        setIsScrubberTimeChanging(false);
        playerRef.current?.play()?.catch(() => {
          handleSetIsPaused(true);
        });
      }, 100);
    },
    [handleSetIsPaused]
  );

  const options: videojs.PlayerOptions = useMemo(
    () => ({
      loop: true,
      controls: false,
      responsive: false,
      playsinline: true,
      disablePictureInPicture: true,
      autoplay: true,
      sources: [
        {
          src: resources!!.hlsStreamUrl as string,
          type: 'application/x-mpegURL',
        },
      ],
    }),
    [resources]
  );

  // playerRef is set here, as well as all the listeners
  // List of video.js events
  // https://gist.github.com/alexrqs/a6db03bade4dc405a61c63294a64f97a
  const handlePlayerReady = useCallback(
    async (p: videojs.Player) => {
      playerRef.current = p;

      if (innerRef) {
        innerRef.current = p;
      }

      // Load manifest and determine vertical/horizontal orientation
      if (resources!!.hlsStreamUrl) {
        const loadedManifestRaw = await fetch(resources!!.hlsStreamUrl).then(
          (r) => r.text()
        );
        const parsedManifest = hlsParser.parse(loadedManifestRaw);

        if (parsedManifest && parsedManifest.isMasterPlaylist) {
          const v1 = parsedManifest?.variants?.[0];

          if (
            v1 &&
            v1.resolution &&
            v1.resolution?.height &&
            v1.resolution?.width
          ) {
            setVideoOrientation(
              v1.resolution?.height >= v1.resolution?.width
                ? 'vertical'
                : 'horizontal'
            );
          }
        }
      }

      // Autoplay
      p.on('ready', (e) => {
        playerRef.current?.play()?.catch(() => {
          handleSetIsPaused(true);
        });
      });

      // Paused state
      p.on('play', () => {
        handleSetIsPaused(false);
      });
      p.on('pause', () => {
        handleSetIsPaused(true);
      });

      p.on('timeupdate', (e) => {
        setPlaybackTime(p.currentTime());
      });

      // Loading state & Autoplay
      p.on('loadstart', (e) => {
        setIsLoading(true);
        playerRef.current?.play()?.catch(() => {
          handleSetIsPaused(true);
        });
      });
      p.on('canplay', (e) => {
        setIsLoading(false);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleSetIsPaused, innerRef]
  );

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement('video-js');

      videoElement.classList.add('vjs-big-play-centered');
      // @ts-ignore
      videoRef.current?.appendChild(videoElement);
      // @ts-ignore
      const player = (playerRef.current = videojs(videoElement, options, () => {
        handlePlayerReady && handlePlayerReady(player);
      }));
    }
  }, [handlePlayerReady, options]);

  // Dispose the Video.js player when the functional component unmounts
  // NB! From official example video.js
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        // @ts-ignore
        playerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current?.muted(!!isMuted);
    }
  }, [isMuted]);

  return (
    <SContent
      borderRadius={borderRadius}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <SImageBG src={resources.thumbnailImageUrl} />
      <SVideoWrapper borderRadius={borderRadius}>
        <SWrapper
          id={id}
          ref={videoRef}
          videoOrientation={videoOrientation}
          onClick={() => {
            if (!playerRef.current?.paused()) {
              playerRef.current?.pause();
            } else {
              playerRef.current?.play()?.catch(() => {
                handleSetIsPaused(true);
              });
            }
          }}
        />
        {showPlayButton && isPaused && !isScrubberTimeChanging && (
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
            size={playButtonSize}
          >
            <InlineSVG
              svg={PlayIcon}
              width='32px'
              height='32px'
              fill='#FFFFFF'
            />
          </SPlayPseudoButton>
        )}
      </SVideoWrapper>
      {isLoading && (
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
      )}
      {withMuteControl && (
        <SModalSoundIcon position={mutePosition}>
          <Button
            iconOnly
            view='transparent'
            onClick={toggleThumbnailVideoMuted}
          >
            <InlineSVG
              svg={isMuted ? volumeOff : volumeOn}
              fill={theme.colors.white}
              width='20px'
              height='20px'
            />
          </Button>
        </SModalSoundIcon>
      )}
      {withScrubber ? (
        <PlayerScrubber
          isHovered={isHovered}
          currentTime={playbackTime}
          videoDuration={playerRef?.current?.duration() || 10}
          withTime={false}
          handleChangeTime={handlePlayerScrubberChangeTime}
        />
      ) : null}
    </SContent>
  );
};

export default VideojsPlayer;

VideojsPlayer.defaultProps = {
  muted: true,
  innerRef: undefined,
  resources: {},
  borderRadius: '0px',
  mutePosition: 'right',
  withMuteControl: false,
  showPlayButton: false,
  playButtonSize: 'default',
};

interface ISContent {
  borderRadius?: string;
}

const SContent = styled.div<ISContent>`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: ${(props) => props.borderRadius};
`;

interface ISVideoWrapper {
  borderRadius?: string;
}

const SVideoWrapper = styled.div<ISVideoWrapper>`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
  min-width: 100%;
  min-height: 100%;
  background: transparent;
  border-radius: ${(props) => props.borderRadius};
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
`;

const SWrapper = styled.div<{
  videoOrientation: 'vertical' | 'horizontal';
}>`
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
    object-fit: ${({ videoOrientation }) =>
      videoOrientation === 'vertical' ? 'cover' : 'contain'};
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

interface ISModalSoundIcon {
  position?: string;
}

const SModalSoundIcon = styled.div<ISModalSoundIcon>`
  ${(props) =>
    props.position === 'left'
      ? css`
          left: 16px;
        `
      : css`
          right: 16px;
        `}
  bottom: 16px;
  position: absolute;

  button {
    width: 36px;
    height: 36px;
    border-radius: 12px;
  }
`;

const SPlayPseudoButton = styled.button<{ size?: 'default' | 'small' }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  display: flex;
  justify-content: center;
  align-items: center;

  width: ${({ size }) => (size === 'small' ? '40px' : '64px')};
  height: ${({ size }) => (size === 'small' ? '40px' : '64px')};
  background: rgba(11, 10, 19, 0.65);
  border-radius: ${({ size }) => (size === 'small' ? '10px' : '21px')};
  border: transparent;

  cursor: pointer;

  &:focus,
  &:active {
    outline: none;
  }
`;

const SLoader = styled.div`
  position: absolute;
  top: calc(50% - 30px);
  left: calc(50% - 32.5px);
  z-index: 1;
`;