import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import styled, { css, useTheme } from 'styled-components';

import Button from './Button';
import InlineSVG from './InlineSVG';

import volumeOn from '../../public/images/svg/icons/filled/VolumeON.svg';
import volumeOff from '../../public/images/svg/icons/filled/VolumeOFF1.svg';

interface IBitmovinPlayer {
  id: string;
  play?: boolean;
  loop?: boolean;
  muted?: boolean;
  autoplay?: boolean;
  innerRef?: any;
  resources?: any,
  thumbnails?: any,
  setDuration?: (duration: number) => void;
  borderRadius?: string;
  mutePosition?: 'left' | 'right';
  setCurrentTime?: (time: number) => void;
  withMuteControl?: boolean;
}

export const BitmovinPlayer: React.FC<IBitmovinPlayer> = (props) => {
  const {
    id,
    play,
    loop,
    muted,
    innerRef,
    autoplay,
    resources,
    thumbnails,
    mutePosition,
    borderRadius,
    withMuteControl,
    setDuration,
    setCurrentTime,
  } = props;
  const theme = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const playerConfig = useMemo(() => ({
    ui: false,
    key: process.env.NEXT_PUBLIC_BITMOVIN_PLAYER_KEY,
    playback: {
      muted,
      autoplay,
    },
  }), [autoplay, muted]);
  const playerSource = useMemo(() => ({
    hls: resources.hlsStreamUrl,
    poster: resources.thumbnailImageUrl,
    options: {
      startTime: thumbnails?.startTime || 0,
    },
  }), [resources, thumbnails]);

  const playerRef: any = useRef();
  const player: any = useRef(null);

  const toggleThumbnailVideoMuted = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);
  const destroyPlayer = useCallback(() => {
    if (player.current != null) {
      player.current.destroy();
    }
  }, []);
  const setupPlayer = useCallback(() => {
    // @ts-ignore
    if (typeof window?.bitmovin !== 'undefined') {
      // @ts-ignore
      player.current = new window.bitmovin.player.Player(playerRef.current, playerConfig);

      if (innerRef) {
        innerRef.current = player.current;
      }

      if (loop) {
        // @ts-ignore
        player.current.on(window.bitmovin.player.PlayerEvent.PlaybackFinished, () => {
          player.current.play();
        });
      }

      if (thumbnails?.endTime) {
        const handleTimeChange = () => {
          if (setCurrentTime) {
            setCurrentTime(player.current.getCurrentTime());
          }

          if (player.current.getCurrentTime() >= thumbnails.endTime) {
            player.current.pause();
            player.current.seek(thumbnails.startTime);
            player.current.play();
          }
        };
        // @ts-ignore
        player.current.on(window.bitmovin.player.PlayerEvent.TimeChanged, handleTimeChange);
        player.current.handleTimeChange = handleTimeChange;
      }

      player.current.load(playerSource)
        .then(
          () => {
            setLoaded(true);

            if (setDuration) {
              setDuration(player.current.getDuration());
            }
          },
          (reason: any) => {
            console.error(`Error while creating Bitmovin Player instance, ${reason}`);
          },
        );
    }
  }, [thumbnails, loop, playerConfig, playerSource, innerRef, setDuration, setCurrentTime]);

  useEffect(() => {
    if (process.browser) {
      setupPlayer();
    }

    return () => {
      destroyPlayer();
    };
  }, [destroyPlayer, setupPlayer]);

  useEffect(() => {
    if (player.current && loaded) {
      if (play) {
        player.current.play();
      } else {
        player.current.pause();
      }
    }
  }, [play, player, loaded]);

  useEffect(() => {
    if (player.current && loaded) {
      if (isMuted) {
        player.current.mute();
      } else {
        player.current.unmute();
      }
    }
  }, [player, isMuted, loaded]);

  return (
    <SContent>
      <SImageBG
        src={resources.thumbnailImageUrl}
        borderRadius={borderRadius}
      />
      <SVideoWrapper
        borderRadius={borderRadius}
      >
        <SWrapper
          id={id}
          ref={playerRef}
        />
      </SVideoWrapper>
      {withMuteControl && (
        <SModalSoundIcon position={mutePosition}>
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
      )}
    </SContent>
  );
};

export default BitmovinPlayer;

BitmovinPlayer.defaultProps = {
  loop: true,
  play: true,
  muted: true,
  autoplay: true,
  innerRef: undefined,
  resources: {},
  thumbnails: {},
  borderRadius: '0px',
  mutePosition: 'right',
  withMuteControl: false,
  setDuration: () => {
  },
  setCurrentTime: () => {
  },
};

const SContent = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
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
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
`;

const SWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  min-width: 100%;
  min-height: 100%;
  background: transparent;

  &:before {
    display: none;
  }

  video {
    top: 50%;
    height: auto;
    transform: translateY(-50%);
  }
`;

const SImageBG = styled.img<ISVideoWrapper>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: ${(props) => props.borderRadius};
`;

interface ISModalSoundIcon {
  position?: string;
}

const SModalSoundIcon = styled.div<ISModalSoundIcon>`
  ${(props) => (props.position === 'left' ? css`
    left: 16px;
  ` : css`
    right: 16px;
  `)}
  bottom: 16px;
  position: absolute;

  button {
    width: 36px;
    height: 36px;
    border-radius: 12px;
  }
`;
