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
  SourceConfig,
} from 'bitmovin-player';

import logoAnimation from '../../../public/animations/mobile_logo.json';
import Lottie from '../../atoms/Lottie';
import isSafari from '../../../utils/isSafari';

interface IPostBitmovinPlayer {
  id: string;
  muted?: boolean;
  resources?: newnewapi.IVideoUrls;
}

export const PostBitmovinPlayer: React.FC<IPostBitmovinPlayer> = ({
  id,
  muted,
  resources,
}) => {
  // const [init, setInit] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const playerConfig = useMemo<PlayerConfig>(
    () => ({
      ui: false,
      key: process.env.NEXT_PUBLIC_BITMOVIN_PLAYER_KEY ?? '',
      playback: {
        autoplay: true,
        // NB! Need to be initially muted in order to comply with autoplay policies
        // when opening the link from URL
        muted: true,
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
    player?.current?.play();
  }, []);

  const destroyPlayer = useCallback(() => {
    if (player.current != null) {
      // setInit(false);
      player.current.destroy();
    }
  }, []);

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
    async function load() {
      setIsLoading(true);
      // console.log(player.current);
      try {
        await player?.current?.load(playerSource);
        player.current?.play();
        setLoaded(true);
        setIsLoading(false);
      } catch (err) {
        setLoaded(true);
        setIsLoading(false);
        console.error(`Error while creating Bitmovin Player instance, ${err}`);
      }
    }

    load();
  }, [playerSource]);

  return (
    <SContent>
      <SImageBG src={resources?.thumbnailImageUrl ?? ''} />
      <SVideoWrapper>
        <SWrapper
          id={id}
          onClick={() => {
            if (isSafari()) {
              if (player.current?.isPlaying()) {
                player.current?.pause();
              } else {
                player.current?.play();
              }
            }
          }}
          ref={playerRef}
        />
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
};

const SContent = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
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

  ${({ theme }) => theme.media.tablet} {
    border-radius: 16px;
  }
`;

const SLoader = styled.div`
  position: absolute;
  top: calc(50% - 30px);
  left: calc(50% - 32.5px);
  z-index: 1;
`;
