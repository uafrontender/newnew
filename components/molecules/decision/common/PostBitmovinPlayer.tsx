import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import {
  Player,
  PlayerAPI,
  PlayerConfig,
  PlayerEvent,
  PlayerType,
  SourceConfig,
  StreamType,
} from 'bitmovin-player';

import Lottie from '../../../atoms/Lottie';
import InlineSvg from '../../../atoms/InlineSVG';

import logoAnimation from '../../../../public/animations/mobile_logo.json';
import PlayIcon from '../../../../public/images/svg/icons/filled/Play.svg';

interface IPostBitmovinPlayer {
  id: string;
  muted?: boolean;
  resources?: newnewapi.IVideoUrls;
  showPlayButton?: boolean;
}

export const PostBitmovinPlayer: React.FC<IPostBitmovinPlayer> = ({
  id,
  muted,
  resources,
  showPlayButton,
}) => {
  // const [init, setInit] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isPaused, setIsPaused] = useState(false);

  const handleSetIsPaused = useCallback((stateValue: boolean) => {
    setIsPaused(stateValue);
  }, []);

  const playerConfig = useMemo<PlayerConfig>(
    () => ({
      ui: false,
      key: process.env.NEXT_PUBLIC_BITMOVIN_PLAYER_KEY ?? '',
      playback: {
        autoplay: true,
        // NB! Need to be initially muted in order to comply with autoplay policies
        // when opening the link from URL
        muted: true,
        preferredTech: [
          { player: PlayerType.Html5, streaming: StreamType.Hls },
        ],
      },
    }),
    []
  );

  const playerSource: SourceConfig = useMemo(
    () => ({
      hls: resources?.hlsStreamUrl ?? '',
      poster: resources?.thumbnailImageUrl ?? '',
      ...(resources?.originalVideoUrl
        ? {
            progressive: [
              {
                url: resources?.originalVideoUrl,
                type: 'video/mp4',
                bitrate: 500000,
                label: 'Low',
              },
            ],
          }
        : {}),
      options: {
        startTime: 0,
      },
    }),
    [
      resources?.hlsStreamUrl,
      resources?.thumbnailImageUrl,
      resources?.originalVideoUrl,
    ]
  );

  const playerRef: any = useRef();
  const player = useRef<PlayerAPI | null>(null);

  const handlePlaybackFinished = useCallback(() => {
    player?.current?.play().catch(() => {
      handleSetIsPaused(true);
    });
  }, [handleSetIsPaused]);

  const destroyPlayer = useCallback(async () => {
    if (player.current != null) {
      // setInit(false);
      await player.current.destroy();
    }
  }, [player]);

  const setupPlayer = useCallback(() => {
    player.current = new Player(playerRef.current, playerConfig);

    // setInit(true);
  }, [playerConfig]);

  const subscribe = useCallback(() => {
    // @ts-ignore
    if (player.current.handlePlaybackFinished) {
      player?.current?.off(
        PlayerEvent.PlaybackFinished,
        // @ts-ignore
        player.current.handlePlaybackFinished
      );
    }
    player?.current?.on(PlayerEvent.PlaybackFinished, handlePlaybackFinished);
    // @ts-ignore
    player.current.handlePlaybackFinished = handlePlaybackFinished;
  }, [handlePlaybackFinished]);

  useEffect(() => {
    if (process.browser && typeof window !== 'undefined') {
      setupPlayer();
      subscribe();
    }

    return () => {
      destroyPlayer();
    };
  }, [destroyPlayer, setupPlayer, subscribe]);

  useEffect(() => {
    if (player.current && loaded) {
      if (muted) {
        player.current.mute();
      } else {
        player.current.unmute();
      }
    }
  }, [player, muted, loaded]);

  useEffect(() => {
    let cancel = false;
    async function load() {
      setIsLoading(true);
      // console.log(player.current);
      try {
        await player?.current
          ?.load(playerSource)
          .then(() => {
            if (cancel) return;
            player.current?.play().catch(() => {
              handleSetIsPaused(true);
            });
            setLoaded(true);
            setIsLoading(false);
          })
          .catch(() => {
            if (cancel) return;
            console.error('Player load failed');
          });
      } catch (err) {
        setLoaded(true);
        setIsLoading(false);
        console.error(`Error while creating Bitmovin Player instance, ${err}`);
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, [playerSource, handleSetIsPaused]);

  useEffect(() => {
    player.current?.on(PlayerEvent.Paused, () => handleSetIsPaused(true));
    player.current?.on(PlayerEvent.Play, () => handleSetIsPaused(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerSource]);

  return (
    <SContent>
      <SImageBG src={resources?.thumbnailImageUrl ?? ''} />
      <SVideoWrapper>
        <SWrapper
          id={id}
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
          ref={playerRef}
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
