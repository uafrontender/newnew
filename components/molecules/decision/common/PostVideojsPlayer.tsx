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
// NB! We have to import these twice
// eslint-disable-next-line import/no-duplicates
import 'videojs-contrib-quality-levels';
// eslint-disable-next-line import/no-duplicates
import { QualityLevel, QualityLevelList } from 'videojs-contrib-quality-levels';
// NB! We have to import these twice

import Lottie from '../../../atoms/Lottie';
import InlineSvg from '../../../atoms/InlineSVG';

import logoAnimation from '../../../../public/animations/mobile_logo.json';
import PlayIcon from '../../../../public/images/svg/icons/filled/Play.svg';
// import MaximizeIcon from '../../../../public/images/svg/icons/outlined/Maximize.svg';
// import MinimizeIcon from '../../../../public/images/svg/icons/outlined/Minimize.svg';
import PlayerScrubber from '../../../atoms/PlayerScrubber';
// import { useAppState } from '../../../../contexts/appStateContext';
// import Button from '../../../atoms/Button';
// import {
//   setMutedMode,
// } from '../../../../redux-store/slices/uiStateSlice';
// import { useAppDispatch } from '../../../../redux-store/store';

interface IPostVideojsPlayer {
  id: string;
  muted?: boolean;
  resources?: newnewapi.IVideoUrls;
  videoDurationWithTime?: boolean;
  showPlayButton?: boolean;
}

export const PostVideojsPlayer: React.FC<IPostVideojsPlayer> = ({
  id,
  muted,
  resources,
  videoDurationWithTime,
  showPlayButton,
}) => {
  // const dispatch = useAppDispatch();
  // const { resizeMode } = useAppState();
  // const isMobileOrTablet = [
  //   'mobile',
  //   'mobileS',
  //   'mobileM',
  //   'mobileL',
  //   'tablet',
  // ].includes(resizeMode);

  const videoRef = useRef(null);
  const playerRef = useRef<videojs.Player>();

  const [isLoading, setIsLoading] = useState(false);

  const [isPaused, setIsPaused] = useState(false);
  const handleSetIsPaused = useCallback((stateValue: boolean) => {
    setIsPaused(stateValue);
  }, []);

  // NB! Commented out for now
  // const [isFulscreen, setIsFullscreen] = useState(false);

  const qualityLevelsRef = useRef<QualityLevelList>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);

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
      try {
        playerRef.current = p;

        qualityLevelsRef.current = p?.qualityLevels?.();

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

        qualityLevelsRef?.current?.on('addqualitylevel', (event) => {
          const ql = event.qualityLevel as QualityLevel;
          setQualityLevels((curr) => [...curr, ql]);
        });

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

        p.on('error', (e: any) => {
          console.error(e);
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

        // NB! Commented out for now
        // Fulscreen
        // p.on('fullscreenchange', (e) => {
        //   console.log(p?.isFullscreen());
        //   setIsFullscreen(p?.isFullscreen());
        // });

        // NB! Commented out for now
        // p.on('volumechange', (e) => {
        //   console.log(p?.volume());
        //   console.log(p?.muted());
        //   if (p?.volume() === 0 || p?.muted()) {
        //     dispatch(setMutedMode(true));
        //   } else {
        //     dispatch(setMutedMode(false));
        //   }
        // });
      } catch (err) {
        console.error(err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleSetIsPaused]
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
        {/* <SMaximizeButton
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
        </SMaximizeButton> */}
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
        handleChangeTime={handlePlayerScrubberChangeTime}
      />
      {/* {isFulscreen ? (
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
      ) : null} */}
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

// const SMaximizeButton = styled(Button)`
//   position: absolute;
//   right: 16px;
//   top: 16px;

//   padding: 8px;
//   width: 36px;
//   height: 36px;

//   border-radius: ${({ theme }) => theme.borderRadius.small};

//   transition: unset;

//   ${({ theme }) => theme.media.tablet} {
//     width: 36px;
//     height: 36px;
//   }

//   ${({ theme }) => theme.media.laptop} {
//     padding: 12px;
//     width: 48px;
//     height: 48px;

//     border-radius: ${({ theme }) => theme.borderRadius.medium};
//   }
// `;

// const SMinimizeButton = styled(Button)`
//   position: absolute;
//   right: 16px;
//   top: 16px;

//   padding: 8px;
//   width: 36px;
//   height: 36px;

//   border-radius: ${({ theme }) => theme.borderRadius.small};

//   transition: unset;

//   z-index: 2500000;

//   ${({ theme }) => theme.media.tablet} {
//     width: 36px;
//     height: 36px;
//   }

//   ${({ theme }) => theme.media.laptop} {
//     padding: 12px;
//     width: 48px;
//     height: 48px;

//     border-radius: ${({ theme }) => theme.borderRadius.medium};
//   }
// `;
