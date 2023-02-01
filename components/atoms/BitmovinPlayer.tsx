import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import styled, { css, useTheme } from 'styled-components';
import {
  Player,
  PlayerConfig,
  PlayerEvent,
  PlayerType,
  StreamType,
} from 'bitmovin-player';

import Button from './Button';
import InlineSVG from './InlineSVG';

import PlayIcon from '../../public/images/svg/icons/filled/Play.svg';
import volumeOn from '../../public/images/svg/icons/filled/VolumeON.svg';
import volumeOff from '../../public/images/svg/icons/filled/VolumeOFF1.svg';

interface IBitmovinPlayer {
  id: string;
  muted?: boolean;
  innerRef?: any;
  resources?: any;
  thumbnails?: any;
  setDuration?: (duration: number) => void;
  borderRadius?: string;
  mutePosition?: 'left' | 'right';
  setCurrentTime?: (time: number) => void;
  withMuteControl?: boolean;
  showPlayButton?: boolean;
  playButtonSize?: 'default' | 'small';
}

export const BitmovinPlayer: React.FC<IBitmovinPlayer> = (props) => {
  const {
    id,
    muted,
    innerRef,
    resources,
    thumbnails,
    mutePosition,
    borderRadius,
    withMuteControl,
    setDuration,
    setCurrentTime,
    showPlayButton,
    playButtonSize,
  } = props;
  const theme = useTheme();
  const [init, setInit] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [isLoading, setIsLoading] = useState(false);
  const playerConfig = useMemo<PlayerConfig>(
    () => ({
      ui: false,
      key: process.env.NEXT_PUBLIC_BITMOVIN_PLAYER_KEY ?? '',
      playback: {
        autoplay: true,
        preferredTech: [
          { player: PlayerType.Html5, streaming: StreamType.Hls },
        ],
      },
    }),
    []
  );
  const playerSource = useMemo(
    () => ({
      hls: resources.hlsStreamUrl,
      poster: resources.thumbnailImageUrl,
      options: {
        startTime: thumbnails?.startTime || 0,
      },
    }),
    [resources, thumbnails?.startTime]
  );

  const playerRef: any = useRef();
  const player: any = useRef(null);

  const [isPaused, setIsPaused] = useState(false);

  const handleSetIsPaused = useCallback((stateValue: boolean) => {
    setIsPaused(stateValue);
  }, []);

  const handleTimeChange = useCallback(
    (e: any) => {
      if (setCurrentTime) {
        setCurrentTime(e.time);
      }

      if (player.current?.getCurrentTime() >= thumbnails.endTime) {
        player.current?.pause();
        player.current?.seek(thumbnails.startTime);
        player.current?.play().catch(() => {
          handleSetIsPaused(true);
        });
      }
    },
    [setCurrentTime, thumbnails, handleSetIsPaused]
  );

  const handlePlaybackFinished = useCallback(() => {
    player.current?.play().catch(() => {
      handleSetIsPaused(true);
    });
  }, [handleSetIsPaused]);

  const toggleThumbnailVideoMuted = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const destroyPlayer = useCallback(() => {
    if (player.current != null) {
      setInit(false);
      player.current?.destroy();
    }
  }, []);

  const setupPlayer = useCallback(() => {
    player.current = new Player(playerRef.current, playerConfig);

    if (innerRef) {
      innerRef.current = player.current;
    }

    setInit(true);
  }, [innerRef, playerConfig]);

  const loadSource = useCallback(() => {
    if (!isLoading && !loaded) {
      setIsLoading(true);

      player.current?.load(playerSource).then(
        () => {
          setLoaded(true);
          setIsLoading(false);

          // Catch error in case of low power mode and show play button
          // NotAllowedError: The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.
          player.current?.play().catch(() => {
            handleSetIsPaused(true);
          });

          if (setDuration) {
            setDuration(player.current?.getDuration());
          }
        },
        (reason: any) => {
          setLoaded(true);
          setIsLoading(false);
          console.error(
            `Error while creating Bitmovin Player instance -> ${reason}`
          );
        }
      );
    }
  }, [isLoading, loaded, playerSource, setDuration, handleSetIsPaused]);

  const subscribe = useCallback(() => {
    if (player.current?.handlePlaybackFinished) {
      player.current?.off(
        PlayerEvent.PlaybackFinished,
        player.current?.handlePlaybackFinished
      );
    }
    player.current?.on(PlayerEvent.PlaybackFinished, handlePlaybackFinished);
    player.current.handlePlaybackFinished = handlePlaybackFinished;

    if (thumbnails?.endTime) {
      if (player.current?.handleTimeChange) {
        player.current?.off(
          PlayerEvent.TimeChanged,
          player.current?.handleTimeChange
        );
      }
      player.current?.on(PlayerEvent.TimeChanged, handleTimeChange);
      player.current.handleTimeChange = handleTimeChange;
    }
  }, [handlePlaybackFinished, handleTimeChange, thumbnails?.endTime]);

  useEffect(() => {
    if (process.browser && typeof window !== 'undefined') {
      setupPlayer();
    }

    return () => {
      destroyPlayer();
    };
  }, [destroyPlayer, setupPlayer]);

  useEffect(() => {
    if (init) {
      subscribe();
    }
  }, [init, subscribe]);

  useEffect(() => {
    if (init) {
      loadSource();
    }
  }, [init, loadSource]);

  useEffect(() => {
    if (player.current && loaded) {
      if (isMuted) {
        player.current?.mute();
      } else {
        player.current?.unmute();
      }
    }
  }, [player, isMuted, loaded]);

  useEffect(() => {
    player.current?.on(PlayerEvent.Paused, () => handleSetIsPaused(true));
    player.current?.on(PlayerEvent.Play, () => handleSetIsPaused(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerSource]);

  return (
    <SContent borderRadius={borderRadius}>
      <SImageBG src={resources.thumbnailImageUrl} />
      <SVideoWrapper borderRadius={borderRadius}>
        <SWrapper
          id={id}
          ref={playerRef}
          onClick={() => {
            if (loaded) {
              if (player.current?.isPlaying()) {
                player.current?.pause();
              } else {
                player.current?.play().catch(() => {
                  handleSetIsPaused(true);
                });
              }
            }
          }}
        />
        {showPlayButton && isPaused && (
          <SPlayPseudoButton
            onClick={() => {
              if (loaded) {
                if (player.current?.isPlaying()) {
                  player.current?.pause();
                } else {
                  player.current?.play().catch(() => {
                    handleSetIsPaused(true);
                  });
                }
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
    </SContent>
  );
};

export default BitmovinPlayer;

BitmovinPlayer.defaultProps = {
  muted: true,
  innerRef: undefined,
  resources: {},
  thumbnails: {},
  borderRadius: '0px',
  mutePosition: 'right',
  withMuteControl: false,
  setDuration: () => {},
  setCurrentTime: () => {},
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
    top: 50% !important;
    height: auto !important;
    transform: translateY(-50%) !important;
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
