/* eslint-disable no-multi-assign */
import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import ReactDOM from 'react-dom';
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
import debounce from 'lodash/debounce';

import Lottie from '../../../atoms/Lottie';
import InlineSvg from '../../../atoms/InlineSVG';

import logoAnimation from '../../../../public/animations/mobile_logo.json';
import PlayIcon from '../../../../public/images/svg/icons/filled/Play.svg';
import MaximizeIcon from '../../../../public/images/svg/icons/outlined/Maximize.svg';
import MinimizeIcon from '../../../../public/images/svg/icons/outlined/Minimize.svg';
import PlayerScrubber, { TPlayerScrubber } from '../../../atoms/PlayerScrubber';
import { useAppState } from '../../../../contexts/appStateContext';
import Button from '../../../atoms/Button';
import isSafari from '../../../../utils/isSafari';
import isBrowser from '../../../../utils/isBrowser';
import PostVideoFullscreenControls, {
  TPostVideoFullscreenControls,
} from './PostVideoFullscreenControls';
import isIOS from '../../../../utils/isIOS';
import { useUiState } from '../../../../contexts/uiStateContext';

interface IPostVideojsPlayer {
  id: string;
  muted?: boolean;
  resources?: newnewapi.IVideoUrls;
  videoDurationWithTime?: boolean;
  showPlayButton?: boolean;
  isInSlider?: boolean;
  isActive?: boolean;
  shouldPrefetch?: boolean;
  onPlaybackFinished?: () => void;
  onPlaybackProgress?: (newValue: number) => void;
}

type TSafariHtmlPlayer = HTMLVideoElement & {
  webkitDisplayingFullscreen: boolean;
  volume: number;
  webkitEnterFullscreen: () => void;
  webkitExitFullscreen: () => void;
};

export const PostVideojsPlayer: React.FC<IPostVideojsPlayer> = React.memo(
  ({
    id,
    muted,
    resources,
    videoDurationWithTime,
    showPlayButton,
    isInSlider,
    isActive,
    shouldPrefetch,
    onPlaybackFinished,
    onPlaybackProgress,
  }) => {
    const { resizeMode } = useAppState();
    const isMobileOrTablet = [
      'mobile',
      'mobileS',
      'mobileM',
      'mobileL',
      'tablet',
    ].includes(resizeMode);

    const { setMutedMode } = useUiState();

    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<videojs.Player>();
    const [isReady, setIsReady] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const [isPaused, setIsPaused] = useState(false);

    // delay cannot be less than 100 because handlePlayerScrubberChangeTime function has timeout 100
    const debouncedSetIsPaused = debounce(setIsPaused, 120);

    const handleSetIsPaused = useCallback(
      (stateValue: boolean) => {
        debouncedSetIsPaused(stateValue);
      },
      [debouncedSetIsPaused]
    );

    // Fullscren
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fullscreenInteracted, setFullscreenInteracted] = useState(false);
    const [videoWidthFulscreen, setVideoWidthFullscreen] = useState<{
      width?: number;
      height?: number;
    }>({
      width: undefined,
      height: undefined,
    });

    // Video quality
    const qualityLevelsRef = useRef<QualityLevelList>();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);

    const [videoOrientation, setVideoOrientation] = useState<
      'vertical' | 'horizontal'
    >('vertical');
    const [largestResolutionDimensions, setLargestResolutionDimensions] =
      useState<{
        width?: number;
        height?: number;
      }>({
        width: undefined,
        height: undefined,
      });

    const [isHovered, setIsHovered] = useState(false);

    const playerScrubberRef = useRef<TPlayerScrubber>(null);
    const postVideoFullscreenControlsRef =
      useRef<TPostVideoFullscreenControls>(null);
    const [isScrubberTimeChanging, setIsScrubberTimeChanging] = useState(false);

    const [currentVolume, setCurrentVolume] = useState(0);

    // NB! Commented out for now
    const [bufferedPercent, setBufferedPercent] = useState(0);

    const handlePlayerScrubberChangeTime = useCallback(
      (newValue: number) => {
        if (!isPaused) {
          // Pause the player when scrubbing
          // to avoid double playback start
          setIsScrubberTimeChanging(true);
          playerRef.current?.pause();
          playerScrubberRef?.current?.changeCurrentTime(newValue);
          postVideoFullscreenControlsRef?.current?.changeCurrentTime(newValue);
          playerRef.current?.currentTime(newValue);

          setTimeout(() => {
            setIsScrubberTimeChanging(false);
            playerRef.current?.play()?.catch(() => {
              handleSetIsPaused(true);
            });
          }, 100);
        } else {
          playerScrubberRef?.current?.changeCurrentTime(newValue);
          postVideoFullscreenControlsRef?.current?.changeCurrentTime(newValue);
          playerRef.current?.currentTime(newValue);
        }
      },
      [handleSetIsPaused, isPaused]
    );

    const handlePlayerVolumeChange = useCallback((percentAsDecimal: number) => {
      playerRef?.current?.volume(percentAsDecimal);
    }, []);

    const handleToggleVideoPaused = useCallback(() => {
      if (!playerRef.current?.paused()) {
        playerRef.current?.pause();
      } else {
        playerRef.current?.play()?.catch(() => {
          handleSetIsPaused(true);
        });
      }
    }, [handleSetIsPaused]);

    const options: videojs.PlayerOptions = useMemo(
      () => ({
        // Use manual loop due to Firefox issues
        // loop: !onPlaybackFinished,
        loop: false,
        controls: false,
        responsive: false,
        playsinline: true,
        disablePictureInPicture: true,
        fluid: false,
        html5: {
          vhs: {
            bandwidth: 41943040.0,
            useBandwidthFromLocalStorage: true,
            limitRenditionByPlayerDimensions: false,
            overrideNative: !videojs.browser.IS_SAFARI,
          },
          nativeAudioTracks: videojs.browser.IS_SAFARI,
          nativeVideoTracks: videojs.browser.IS_SAFARI,
        },
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
            if (!isInSlider || (isInSlider && isActive)) {
              const promise = p.play();

              if (promise !== undefined) {
                promise
                  .then(() => {
                    // Autoplay started!
                  })
                  .catch(() => {
                    console.warn('Autoplay is not allowed');
                    // Autoplay was prevented.
                    // Try to mute and start over, catch with displaying pause button
                    setMutedMode(true);
                    setTimeout(() => {
                      playerRef.current?.play()?.catch((e) => {
                        handleSetIsPaused(true);
                      });
                    }, 100);
                  });
              }
            }
          });

          // Paused state
          p?.on('play', () => {
            handleSetIsPaused(false);
          });
          p?.on('pause', () => {
            handleSetIsPaused(true);
          });

          p?.on('error', (e: any) => {
            console.error(e);
          });

          p?.on('timeupdate', (e) => {
            playerScrubberRef?.current?.changeCurrentTime(p.currentTime());
            postVideoFullscreenControlsRef?.current?.changeCurrentTime(
              p.currentTime()
            );
          });

          // Loading state
          p?.on('loadstart', (e) => {
            setIsLoading(true);
          });
          p?.on('canplay', (e) => {
            setCurrentVolume(p?.volume());
            setIsLoading(false);
          });

          // Playback finished handler
          if (onPlaybackFinished) {
            p?.on('ended', () => {
              onPlaybackFinished();
              if (
                playerRef?.current?.isFullscreen() ||
                (
                  videoRef.current?.querySelector(
                    `.vjs-tech_${id}`
                  ) as TSafariHtmlPlayer
                ).webkitDisplayingFullscreen
              ) {
                handleExitFullscreen();
              }
            });
          } else {
            p?.on('ended', () => {
              p?.play()?.catch(() => {
                handleSetIsPaused(true);
              });
            });
          }

          // Buffered percent
          p?.on('progress', () => {
            if (p?.bufferedPercent()) {
              setBufferedPercent(p.bufferedPercent() * 100);
            }
          });

          // Fullscreen
          p?.on('fullscreenchange', (e) => {
            if (isSafari()) {
              setIsFullscreen(!!document.fullscreenElement);
            } else {
              setIsFullscreen(p?.isFullscreen());
            }
          });

          if (!isSafari()) {
            p?.on('volumechange', (e) => {
              setCurrentVolume(p?.volume());
              if (p?.volume() === 0 || p?.muted()) {
                setMutedMode(true);
              } else {
                setMutedMode(false);
              }
            });
          }
        } catch (err) {
          console.error(err);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        handleSetIsPaused,
        onPlaybackFinished,
        resources,
        isInSlider,
        shouldPrefetch,
        isActive,
      ]
    );

    const handlePlayPseudoButtonClick = useCallback(() => {
      if (!playerRef.current?.paused()) {
        playerRef.current?.pause();
      } else {
        playerRef.current?.play()?.catch(() => {
          handleSetIsPaused(true);
        });
      }
    }, [handleSetIsPaused]);

    const handleEnterFullscreen = useCallback(() => {
      if (!isSafari() && !isIOS()) {
        playerRef?.current?.requestFullscreen();
      } else if (videoRef.current?.querySelector(`.vjs-tech_${id}`)) {
        (
          videoRef.current?.querySelector(
            `.vjs-tech_${id}`
          ) as TSafariHtmlPlayer
        )?.webkitEnterFullscreen();
        setIsFullscreen(true);
      }
    }, [id]);

    const handleExitFullscreen = useCallback(() => {
      if (!isSafari() && !isIOS()) {
        playerRef?.current?.exitFullscreen();
      } else {
        (
          videoRef.current?.querySelector(
            `.vjs-tech_${id}`
          ) as TSafariHtmlPlayer
        )?.webkitExitFullscreen();
      }
    }, [id]);

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

            if (parsedManifest?.variants && parsedManifest?.variants?.length) {
              const largestV =
                parsedManifest?.variants?.[parsedManifest.variants.length - 1];

              setLargestResolutionDimensions({
                width: largestV.resolution?.width,
                height: largestV.resolution?.height,
              });
            }

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

    // Separate use effect for fetching manifest and determining horizontal/vertical orientation
    useEffect(() => {
      fetchManifestDetermineOrientation();
    }, [fetchManifestDetermineOrientation]);

    useEffect(() => {
      // Make sure Video.js player is only initialized once
      if (!playerRef.current) {
        // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
        const videoElement = document.createElement('video-js');

        videoElement.classList.add('vjs-big-play-centered');
        videoElement.classList.add(`video-js_${id}`);
        videoRef.current?.appendChild(videoElement);
        const player = (playerRef.current = videojs(
          videoElement,
          options,
          () => {
            handlePlayerReady?.(player);

            // Add id to safari
            const vjsTech = videoRef.current?.querySelector('.vjs-tech');
            if (vjsTech) {
              vjsTech.classList.add(`vjs-tech_${id}`);
            }
            setIsReady(true);
          }
        ));
      }
    }, [handlePlayerReady, id, options]);

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

    // Safari-specific fullscreen handlers
    useEffect(() => {
      const handleFullscreenChangeSafari = () => {
        setIsFullscreen(
          (
            videoRef.current?.querySelector(
              `.vjs-tech_${id}`
            ) as TSafariHtmlPlayer
          )?.webkitDisplayingFullscreen
        );
      };

      const handleVolumeChangeSafari: GlobalEventHandlers['onvolumechange'] = (
        e
      ) => {
        setCurrentVolume((e.target as TSafariHtmlPlayer).volume);
        if (
          (e.target as TSafariHtmlPlayer).volume === 0 ||
          (e.target as TSafariHtmlPlayer).muted
        ) {
          setMutedMode(true);
        } else {
          setMutedMode(false);
        }
      };

      const vjsTech = videoRef.current?.querySelector(`.vjs-tech_${id}`);

      if (isBrowser() && !!vjsTech && isSafari()) {
        (vjsTech as HTMLVideoElement).addEventListener(
          'webkitfullscreenchange',
          handleFullscreenChangeSafari
        );

        (vjsTech as HTMLVideoElement).addEventListener(
          'volumechange',
          handleVolumeChangeSafari
        );
      }

      return () => {
        (vjsTech as HTMLVideoElement)?.removeEventListener(
          'webkitfullscreenchange',
          handleFullscreenChangeSafari
        );

        (vjsTech as HTMLVideoElement)?.removeEventListener(
          'volumechange',
          handleVolumeChangeSafari
        );
      };
      // Skipping `dispatch`
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFullscreen, id, isReady]);

    // Set minimize button position in fullscreen
    // Listenere mostly for devtools screen size change
    useEffect(() => {
      const handleSetVideoWidthFullscreen = () => {
        if (
          !largestResolutionDimensions.height ||
          !largestResolutionDimensions.width
        ) {
          return;
        }
        const innerWidth = window?.innerWidth;
        const innerHeight = window?.innerHeight;

        const isVertical =
          largestResolutionDimensions.height >=
          largestResolutionDimensions.width;
        const ratio =
          largestResolutionDimensions.height /
          largestResolutionDimensions.width;

        if (isVertical) {
          setVideoWidthFullscreen({
            width: innerHeight / ratio,
            height: innerHeight,
          });
        } else {
          setVideoWidthFullscreen({
            width: innerWidth,
            height: innerWidth * ratio,
          });
        }
      };

      if (isBrowser()) {
        handleSetVideoWidthFullscreen();
        window.addEventListener('resize', handleSetVideoWidthFullscreen);
      }

      return () => {
        window.removeEventListener('resize', handleSetVideoWidthFullscreen);
      };
    }, [
      isFullscreen,
      largestResolutionDimensions,
      largestResolutionDimensions.height,
      largestResolutionDimensions.width,
    ]);

    // Prevent pausing video when trying to show fullscreen controls on non-iOS touch devices
    const handlePlayPauseWrapperOnClick = useCallback(() => {
      if (isFullscreen && !fullscreenInteracted) {
        setFullscreenInteracted(true);
        return;
      }

      if (!playerRef.current?.paused()) {
        playerRef.current?.pause();
      } else {
        playerRef.current?.play()?.catch(() => {
          handleSetIsPaused(true);
        });
      }
    }, [fullscreenInteracted, handleSetIsPaused, isFullscreen]);

    // Hide controls if mouse not moved in fullscreen
    useEffect(() => {
      let timeout: any = 0;

      const handleTrackFullscreenInteracted = () => {
        setFullscreenInteracted(true);

        clearTimeout(timeout);

        timeout = setTimeout(() => {
          setFullscreenInteracted(false);
        }, 5000);
      };

      if (isFullscreen && !isSafari() && !isIOS()) {
        window?.addEventListener('mousemove', handleTrackFullscreenInteracted);
        // window?.addEventListener('touchstart', handleTrackFullscreenInteracted);
        window?.addEventListener('touchmove', handleTrackFullscreenInteracted);
      } else {
        window?.removeEventListener(
          'mousemove',
          handleTrackFullscreenInteracted
        );
        window?.removeEventListener(
          'touchstart',
          handleTrackFullscreenInteracted
        );
        window?.removeEventListener(
          'touchmove',
          handleTrackFullscreenInteracted
        );
        clearTimeout(timeout);
      }

      return () => {
        window?.removeEventListener(
          'mousemove',
          handleTrackFullscreenInteracted
        );
        // window?.removeEventListener(
        //   'touchstart',
        //   handleTrackFullscreenInteracted
        // );
        window?.removeEventListener(
          'touchmove',
          handleTrackFullscreenInteracted
        );
        clearTimeout(timeout);
      };
    }, [isFullscreen]);

    // Hide cursor if mouse not moved in fullscreen
    useEffect(() => {
      if (isBrowser() && isFullscreen && !fullscreenInteracted && !isSafari()) {
        document.documentElement.style.cursor = 'none';
      } else {
        document.documentElement.style.cursor = '';
      }

      return () => {
        document.documentElement.style.cursor = '';
      };
    }, [isFullscreen, fullscreenInteracted]);

    // Slider prefetching
    useEffect(() => {
      if (isInSlider) {
        if (isActive) {
          onPlaybackProgress?.(0);
          const promise = playerRef?.current?.play();

          if (promise !== undefined) {
            promise
              .then(() => {
                // Autoplay started!
              })
              .catch(() => {
                // Autoplay was prevented.
                // Try to mute and start over, catch with displaying pause button
                console.warn('Autoplay is not allowed');
                setMutedMode(true);
                setTimeout(() => {
                  playerRef.current?.play()?.catch((e) => {
                    handleSetIsPaused(true);
                  });
                }, 100);
              });
          }
        } else {
          playerRef?.current?.pause();
          // Required to avoid one frame flickering when changing items in the slider
          setTimeout(() => {
            playerScrubberRef?.current?.changeCurrentTime(0);
            postVideoFullscreenControlsRef?.current?.changeCurrentTime(0);
            playerRef.current?.currentTime(0);
          }, 100);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInSlider, isActive]);

    // Keyboard action handlers
    useEffect(() => {
      const handlePressSpacebar = (e: globalThis.KeyboardEvent) => {
        const tagName = document?.activeElement?.tagName?.toLowerCase();

        const shouldPause =
          (document?.hasFocus() &&
            tagName &&
            tagName !== 'input' &&
            tagName !== 'textarea') ||
          (!isSafari() && isFullscreen);

        if (!shouldPause) {
          return;
        }

        if (e.code === 'Space') {
          e.preventDefault();

          if (!playerRef.current?.paused()) {
            playerRef.current?.pause();
          } else {
            playerRef.current?.play()?.catch(() => {
              handleSetIsPaused(true);
            });
          }
        }
      };

      if (!isInSlider || isActive) {
        window.addEventListener('keydown', handlePressSpacebar);
      } else {
        window.removeEventListener('keydown', handlePressSpacebar);
      }

      return () => {
        window.removeEventListener('keydown', handlePressSpacebar);
      };
    }, [handleSetIsPaused, isActive, isFullscreen, isInSlider]);

    // Update scrubber in non-Safari fullscreen controls for a paused video
    useEffect(() => {
      if (isFullscreen && fullscreenInteracted && !isSafari() && !isIOS()) {
        if (playerRef?.current) {
          postVideoFullscreenControlsRef?.current?.changeCurrentTime(
            playerRef?.current?.currentTime()
          );
        }
      }
    }, [fullscreenInteracted, isFullscreen]);

    // Try to pause the video when the component unmounts
    // to avoid attempts to play broken segments
    useEffect(
      () => () => {
        playerRef?.current?.pause();
      },
      []
    );

    const shouldShowPlayPseudoButton = useMemo(
      () =>
        (!isInSlider || isActive) &&
        showPlayButton &&
        isPaused &&
        !isScrubberTimeChanging,
      [isActive, isInSlider, isPaused, isScrubberTimeChanging, showPlayButton]
    );

    return (
      <SContent
        id={`sContent_${id}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        bg={resources?.thumbnailImageUrl ?? ''}
      >
        <SVideoWrapper data-vjs-player>
          <SWrapper
            id={id}
            onClick={
              !isMobileOrTablet ? handlePlayPauseWrapperOnClick : undefined
            }
            onPointerUp={
              isMobileOrTablet ? handlePlayPauseWrapperOnClick : undefined
            }
            ref={videoRef}
            videoOrientation={videoOrientation}
            isFullScreen={isFullscreen}
          />
          {shouldShowPlayPseudoButton ? (
            <SPlayPseudoButton onClick={handlePlayPseudoButtonClick}>
              <InlineSvg
                svg={PlayIcon}
                width='32px'
                height='32px'
                fill='#FFFFFF'
              />
            </SPlayPseudoButton>
          ) : null}
          {!isLoading ? (
            <SMaximizeButton
              id='maximize-button'
              iconOnly
              view='transparent'
              onClick={handleEnterFullscreen}
            >
              <InlineSvg
                svg={MaximizeIcon}
                width={isMobileOrTablet ? '20px' : '24px'}
                height={isMobileOrTablet ? '20px' : '24px'}
                fill='#FFFFFF'
              />
            </SMaximizeButton>
          ) : null}
        </SVideoWrapper>
        {isLoading && !shouldShowPlayPseudoButton && (
          <SLoader>
            <Lottie
              width={65}
              height={60}
              options={{
                loop: true,
                autoplay: true,
                animationData: logoAnimation,
              }}
            />
          </SLoader>
        )}
        <PlayerScrubber
          ref={playerScrubberRef}
          isHovered={isHovered}
          videoDuration={playerRef?.current?.duration() || 10}
          withTime={videoDurationWithTime}
          bufferedPercent={bufferedPercent || undefined}
          handleChangeTime={handlePlayerScrubberChangeTime}
          onPlaybackProgress={
            isActive && onPlaybackProgress ? onPlaybackProgress : undefined
          }
        />
        {/* Custom fullscreen controls */}
        {isFullscreen && fullscreenInteracted && !isSafari() && !isIOS()
          ? ReactDOM?.createPortal(
              <SMinimizeButton
                id='minimize-button'
                iconOnly
                view='transparent'
                style={{
                  ...(largestResolutionDimensions?.width && !isMobileOrTablet
                    ? {
                        top: `calc(50% - ${
                          videoWidthFulscreen.height! / 2
                        }px + 16px)`,
                        left: `calc(50% + ${
                          videoWidthFulscreen.width! / 2
                        }px - 16px - 48px)`,
                      }
                    : {}),
                }}
                onClick={handleExitFullscreen}
              >
                <InlineSvg
                  svg={MinimizeIcon}
                  width={isMobileOrTablet ? '20px' : '24px'}
                  height={isMobileOrTablet ? '20px' : '24px'}
                  fill='#FFFFFF'
                />
              </SMinimizeButton>,
              document
                ?.getElementById(`sContent_${id}`)
                ?.querySelector(`.video-js_${id}`) as HTMLElement
            )
          : null}
        {isFullscreen && fullscreenInteracted && !isSafari() && !isIOS()
          ? ReactDOM?.createPortal(
              <PostVideoFullscreenControls
                ref={postVideoFullscreenControlsRef}
                isPaused={
                  isPaused && !!showPlayButton && !isScrubberTimeChanging
                }
                handleToggleVideoPaused={handleToggleVideoPaused}
                videoDuration={playerRef?.current?.duration() || 10}
                handleChangeTime={handlePlayerScrubberChangeTime}
                isMuted={!!muted}
                handleToggleMuted={(newValue: boolean) =>
                  setMutedMode(newValue)
                }
                currentVolume={currentVolume}
                handleChangeVolume={handlePlayerVolumeChange}
              />,
              document
                ?.getElementById(`sContent_${id}`)
                ?.querySelector(`.video-js_${id}`) as HTMLElement
            )
          : null}
      </SContent>
    );
  }
);

export default PostVideojsPlayer;

PostVideojsPlayer.defaultProps = {
  muted: true,
  resources: {},
  showPlayButton: false,
};

const SContent = styled.div<{
  bg: string;
}>`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    margin: -10px; // to prevent gaps
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    filter: blur(32px);
    background-image: ${({ bg }) => `url(${bg})`};
    background-position: center;
    background-size: cover;
  }

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

  .video-js {
    &:focus-visible {
      outline: none !important;
    }
  }

  video {
    /* Fix background image flickering through */
    width: calc(100% + 1px) !important;
    height: 100% !important;

    object-fit: ${({ videoOrientation, isFullScreen }) =>
      videoOrientation === 'vertical' && !isFullScreen ? 'cover' : 'contain'};

    &:focus-visible {
      outline: none !important;
    }

    /* Otherwise borders are straight on Safari */
    ${({ theme }) => theme.media.tablet} {
      border-radius: 16px;
    }
  }

  /* Mostly useless, added just in case */
  video::-webkit-media-controls {
    display: none !important;
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

  .vjs-tech::-webkit-media-controls-enclosure {
    display: none !important;
    pointer-events: none;
    opacity: 0.5;
    z-index: -100;
  }

  .vjs-tech::-webkit-media-controls-panel {
    display: none !important;
    opacity: 0 !important;
  }

  /* Hide controls */
  .vjs-control-bar {
    display: none;
  }
  .vjs-modal-dialog {
    display: none;
  }
  .vjs-loading-spinner {
    display: none;
  }
  .vjs-big-play-button {
    display: none;
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

  z-index: 2147483647;

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

// Fullscreen controls
