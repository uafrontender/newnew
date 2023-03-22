/* eslint-disable no-multi-assign */
/* eslint-disable no-unused-expressions */
import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { newnewapi } from 'newnew-api';
import styled from 'styled-components';
import hlsParser from 'hls-parser';
import videojs from 'video.js';
// NB! We have to import these twice due to package issues
// eslint-disable-next-line import/no-duplicates
import 'videojs-contrib-quality-levels';
// eslint-disable-next-line import/no-duplicates
import { QualityLevel, QualityLevelList } from 'videojs-contrib-quality-levels';
// NB! We have to import these twice due to package issues

import Lottie from '../../../atoms/Lottie';
import InlineSvg from '../../../atoms/InlineSVG';

import logoAnimation from '../../../../public/animations/mobile_logo.json';
import PlayIcon from '../../../../public/images/svg/icons/filled/Play.svg';
import MaximizeIcon from '../../../../public/images/svg/icons/outlined/Maximize.svg';
import MinimizeIcon from '../../../../public/images/svg/icons/outlined/Minimize.svg';
import PlayerScrubber from '../../../atoms/PlayerScrubber';
import { useAppState } from '../../../../contexts/appStateContext';
import Button from '../../../atoms/Button';
import { setMutedMode } from '../../../../redux-store/slices/uiStateSlice';
import { useAppDispatch } from '../../../../redux-store/store';

interface IPostVideojsPlayer {
  id: string;
  muted?: boolean;
  resources?: newnewapi.IVideoUrls;
  videoDurationWithTime?: boolean;
  showPlayButton?: boolean;
  onPlaybackFinished?: () => void;
}

export const PostVideojsPlayer: React.FC<IPostVideojsPlayer> = ({
  id,
  muted,
  resources,
  videoDurationWithTime,
  showPlayButton,
  onPlaybackFinished,
}) => {
  const dispatch = useAppDispatch();
  const { resizeMode } = useAppState();
  const isMobileOrTablet = [
    'mobile',
    'mobileS',
    'mobileM',
    'mobileL',
    'tablet',
  ].includes(resizeMode);

  const videoRef = useRef(null);
  const playerRef = useRef<videojs.Player>();

  const [isLoading, setIsLoading] = useState(false);

  const [isPaused, setIsPaused] = useState(false);
  const handleSetIsPaused = useCallback((stateValue: boolean) => {
    setIsPaused(stateValue);
  }, []);

  // NB! Commented out for now
  const [isFullscreen, setIsFullscreen] = useState(false);

  const qualityLevelsRef = useRef<QualityLevelList>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);

  const [videoOrientation, setVideoOrientation] = useState<
    'vertical' | 'horizontal'
  >('vertical');

  const [isHovered, setIsHovered] = useState(false);

  const [playbackTime, setPlaybackTime] = useState(0);
  const [isScrubberTimeChanging, setIsScrubberTimeChanging] = useState(false);

  // NB! Commented out for now
  const [bufferedPercent, setBufferedPercent] = useState(0);

  const handlePlayerScrubberChangeTime = useCallback(
    (newValue: number) => {
      if (!isPaused) {
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
      } else {
        setPlaybackTime(newValue);
        playerRef.current?.currentTime(newValue);
      }
    },
    [handleSetIsPaused, isPaused]
  );

  const options: videojs.PlayerOptions = useMemo(
    () => ({
      loop: !onPlaybackFinished,
      controls: false,
      responsive: false,
      playsinline: true,
      disablePictureInPicture: true,
      sources: [
        {
          src: resources!!.hlsStreamUrl as string,
          type: 'application/x-mpegURL',
        },
      ],
    }),
    [resources, onPlaybackFinished]
  );

  // playerRef is set here, as well as all the listeners
  // List of video.js events
  // https://gist.github.com/alexrqs/a6db03bade4dc405a61c63294a64f97a
  const handlePlayerReady = useCallback(
    (p: videojs.Player) => {
      try {
        playerRef.current = p;

        // Set qualityLevels
        qualityLevelsRef.current = p?.qualityLevels?.();

        qualityLevelsRef?.current?.on('addqualitylevel', (event) => {
          const ql = event.qualityLevel as QualityLevel;
          setQualityLevels((curr) => [...curr, ql]);
        });

        // Autoplay implementation by official video.js guide
        // https://videojs.com/blog/autoplay-best-practices-with-video-js/#programmatic-autoplay-and-successfailure-detection
        p.ready(() => {
          const promise = p.play();

          if (promise !== undefined) {
            promise
              .then(() => {
                // Autoplay started!
                // console.log('Autoplay started!');
              })
              .catch((error) => {
                console.log(error);
                // Autoplay was prevented.
                // console.log('Autoplay was prevented.');
                // Try to mute and start over, catch with displaying pause button
                dispatch(setMutedMode(true));
                setTimeout(() => {
                  playerRef.current?.play()?.catch((e) => {
                    handleSetIsPaused(true);
                  });
                }, 100);
              });
          }
        });

        // Paused state
        p.on('play', () => {
          handleSetIsPaused(false);
        });
        p.on('pause', () => {
          handleSetIsPaused(true);
        });

        p.on('error', (e: any) => {
          console.error(e);
        });

        p.on('timeupdate', (e) => {
          setPlaybackTime(p.currentTime());
        });

        // Loading state
        p.on('loadstart', (e) => {
          setIsLoading(true);
        });
        p.on('canplay', (e) => {
          setIsLoading(false);
        });

        // Playback finished handler
        if (onPlaybackFinished) {
          p.on('ended', () => {
            onPlaybackFinished();
          });
        }

        // Buffered percent
        p.on('progress', () => {
          if (p?.bufferedPercent()) {
            setBufferedPercent(p.bufferedPercent() * 100);
          }
        });

        // Fullscreen
        p.on('fullscreenchange', (e) => {
          console.log(p?.isFullscreen());
          setIsFullscreen(p?.isFullscreen());
        });

        p.on('volumechange', (e) => {
          if (p?.volume() === 0 || p?.muted()) {
            dispatch(setMutedMode(true));
          } else {
            dispatch(setMutedMode(false));
          }
        });
      } catch (err) {
        console.error(err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleSetIsPaused, onPlaybackFinished, resources]
  );

  const fetchManifestDetermineOrientation = useCallback(async () => {
    try {
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
    } catch (err) {
      console.error(err);
    }
  }, [resources]);

  // Separate use effect for fetching manifest and determening horizontal/vertical orientation
  useEffect(() => {
    fetchManifestDetermineOrientation();
  }, [fetchManifestDetermineOrientation]);

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
  // NB! From official example
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
      playerRef.current?.muted(!!muted);
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
          videoOrientation={videoOrientation}
          isFullScreen={isFullscreen}
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
          >
            <InlineSvg
              svg={PlayIcon}
              width='32px'
              height='32px'
              fill='#FFFFFF'
            />
          </SPlayPseudoButton>
        )}
        <SMaximizeButton
          id='maximize-button'
          iconOnly
          view='transparent'
          onClick={(e) => {
            console.log('hey');
            playerRef?.current?.requestFullscreen();
          }}
        >
          <InlineSvg
            svg={MaximizeIcon}
            width={isMobileOrTablet ? '20px' : '24px'}
            height={isMobileOrTablet ? '20px' : '24px'}
            fill='#FFFFFF'
          />
        </SMaximizeButton>
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
      <PlayerScrubber
        isHovered={isHovered}
        currentTime={playbackTime}
        videoDuration={playerRef?.current?.duration() || 10}
        withTime={videoDurationWithTime}
        bufferedPercent={bufferedPercent || undefined}
        handleChangeTime={handlePlayerScrubberChangeTime}
      />
      {isFullscreen ? (
        <SMinimizeButton
          id='minimize-button'
          iconOnly
          view='transparent'
          onClick={(e) => {
            console.log('hey');
            playerRef?.current?.requestFullscreen();
          }}
        >
          <InlineSvg
            svg={MinimizeIcon}
            width={isMobileOrTablet ? '20px' : '24px'}
            height={isMobileOrTablet ? '20px' : '24px'}
            fill='#FFFFFF'
          />
        </SMinimizeButton>
      ) : null}
    </SContent>
  );
};

export default PostVideojsPlayer;

PostVideojsPlayer.defaultProps = {
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

const SWrapper = styled.div<{
  videoOrientation: 'vertical' | 'horizontal';
  isFullScreen: boolean;
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

    object-fit: ${({ videoOrientation, isFullScreen }) =>
      videoOrientation === 'vertical' && !isFullScreen ? 'cover' : 'contain'};
  }

  video::-webkit-media-controls-enclosure {
    display: none !important;
    pointer-events: none;
    opacity: 0.5;
    z-index: -100;
  }

  video::-webkit-media-controls-panel {
    display: none !important;
    opacity: 0 !important;
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

const SMaximizeButton = styled(Button)`
  position: absolute;
  right: 16px;
  top: 16px;

  padding: 8px;
  width: 36px;
  height: 36px;

  border-radius: ${({ theme }) => theme.borderRadius.small};

  transition: unset;

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

const SMinimizeButton = styled(Button)`
  position: absolute;
  right: 16px;
  top: 16px;

  padding: 8px;
  width: 36px;
  height: 36px;

  border-radius: ${({ theme }) => theme.borderRadius.small};

  transition: unset;

  z-index: 2500000;

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
