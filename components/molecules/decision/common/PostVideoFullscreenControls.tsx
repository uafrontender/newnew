import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { css } from 'styled-components';
import moment from 'moment';
import 'moment-duration-format';

import isSafari from '../../../../utils/isSafari';
import { useAppState } from '../../../../contexts/appStateContext';
import useOnTouchStartOutside from '../../../../utils/hooks/useOnTouchStartOutside';

import Button from '../../../atoms/Button';
import InlineSvg from '../../../atoms/InlineSVG';

import PlayIcon from '../../../../public/images/svg/icons/outlined/play.svg';
import PauseIcon from '../../../../public/images/svg/icons/outlined/pause.svg';
import VolumeOff from '../../../../public/images/svg/icons/filled/VolumeOFF1.svg';
import VolumeOn from '../../../../public/images/svg/icons/filled/VolumeON.svg';
import isFirefox from '../../../../utils/isFirefox';

interface IPostVideoFullscreenControls {
  // Play/Pause
  isPaused: boolean;
  handleToggleVideoPaused: () => void;
  // Scrubber
  // currentTime: number;
  videoDuration: number;
  handleChangeTime: (newTime: number) => void;
  // Volume
  isMuted: boolean;
  handleToggleMuted: (newValue: boolean) => void;
  currentVolume: number;
  handleChangeVolume: (newValue: number) => void;
}

type PostVideoFullscreenControlsHandle = {
  changeCurrentTime: (newValue: number) => void;
};

export type TPostVideoFullscreenControls = React.ElementRef<
  typeof PostVideoFullscreenControls
>;

const PostVideoFullscreenControls = React.forwardRef<
  PostVideoFullscreenControlsHandle,
  IPostVideoFullscreenControls
>(
  (
    {
      isPaused,
      handleToggleVideoPaused,
      // currentTime,
      videoDuration,
      handleChangeTime,
      isMuted,
      handleToggleMuted,
      currentVolume,
      handleChangeVolume,
    },
    ref
  ) => {
    const { resizeMode } = useAppState();
    const isMobileOrTablet = [
      'mobile',
      'mobileS',
      'mobileM',
      'mobileL',
      'tablet',
    ].includes(resizeMode);

    // Time
    const [currentTime, setCurrentTime] = useState(0);
    useImperativeHandle(ref, () => ({
      changeCurrentTime(newValue: number) {
        setCurrentTime(newValue);
      },
    }));
    const timeSliderRef = useRef<HTMLInputElement>();
    const progress = useMemo(
      () => (currentTime / videoDuration) * 100,
      [currentTime, videoDuration]
    );
    const formattedCurrent = useMemo(
      () =>
        currentTime
          ? moment
              .duration(currentTime, 'seconds')
              // @ts-ignore
              ?.format('mm:ss', { trim: false })
          : '00:00',
      [currentTime]
    );
    const formattedDuration = useMemo(
      () =>
        videoDuration && typeof videoDuration === 'number'
          ? moment
              .duration(videoDuration, 'seconds')
              // @ts-ignore
              ?.format('mm:ss', { trim: false })
          : '',
      [videoDuration]
    );

    const handleTimeChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChangeTime(
          (videoDuration / 100) * (parseFloat(e.target.value) as number)
        );
      },
      [handleChangeTime, videoDuration]
    );

    useEffect(() => {
      if (timeSliderRef.current) {
        timeSliderRef.current.style.setProperty(
          '--sx',
          `calc(${progress / 100} * 100%)`
        );
      }
    }, [progress]);

    // Volume
    const soundControlsRef = useRef<HTMLDivElement>();
    const volumeSliderRef = useRef<HTMLInputElement>();
    const volumeParsed = useMemo(() => currentVolume * 100, [currentVolume]);
    const [isSoundControlsHovered, setIsSoundControlsHovered] = useState(false);

    const handleVolumeChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChangeVolume((parseFloat(e.target.value) as number) / 100);
        if (parseFloat(e.target.value) > 0) {
          handleToggleMuted(false);
        } else {
          handleToggleMuted(true);
        }
      },
      [handleChangeVolume, handleToggleMuted]
    );

    const handleToggleMutedInner = useCallback(
      (newValue: number) => {
        handleChangeVolume(newValue);
        if (newValue > 0) {
          handleToggleMuted(false);
        } else {
          handleToggleMuted(true);
        }
      },
      [handleChangeVolume, handleToggleMuted]
    );

    useEffect(() => {
      if (volumeSliderRef.current) {
        volumeSliderRef.current.style.setProperty(
          '--sx',
          `calc(${volumeParsed / 100} * 100%)`
        );
      }
    }, [volumeParsed]);

    const handleSoundControlsClickOutsideMobile = () => {
      if (isMobileOrTablet) {
        setIsSoundControlsHovered(false);
      }
    };

    useOnTouchStartOutside(
      soundControlsRef,
      handleSoundControlsClickOutsideMobile
    );

    return (
      <SFullscreenControlsContainer>
        <SPlayPauseButton
          iconOnly
          view='primaryGrad'
          size='sm'
          onClick={() => handleToggleVideoPaused()}
        >
          <InlineSvg
            fill='#FFFFFF'
            svg={!isPaused ? PauseIcon : PlayIcon}
            width='20px'
            height='20px'
          />
        </SPlayPauseButton>
        <STime>{`${formattedCurrent} / ${formattedDuration}`}</STime>
        <SSlider
          ref={(el) => {
            timeSliderRef.current = el!!;
          }}
          value={progress}
          min={0}
          max={100}
          step={0.1}
          aria-labelledby='Video seek'
          onChange={handleTimeChange}
          onMouseUp={(e) => {
            if (isFirefox()) {
              e.preventDefault();
              timeSliderRef.current?.blur();
            }
          }}
        />
        <SSoundControls
          ref={(el) => {
            soundControlsRef.current = el!!;
          }}
          onMouseEnter={() => setIsSoundControlsHovered(true)}
          onTouchStart={() => setIsSoundControlsHovered(true)}
          onMouseLeave={() => setIsSoundControlsHovered(false)}
        >
          <SSlider
            ref={(el) => {
              volumeSliderRef.current = el!!;
            }}
            withThumb
            value={volumeParsed}
            style={{
              transition: 'width 0.2s linear',
              width: isSoundControlsHovered ? '80px' : '0px',
              visibility: isSoundControlsHovered ? 'visible' : 'hidden',
              ...(isSafari()
                ? {
                    display: isSoundControlsHovered ? 'block' : 'none',
                  }
                : {}),
            }}
            min={0}
            max={100}
            step={0.1}
            aria-labelledby='Volume input'
            onChange={handleVolumeChange}
            onMouseUp={(e) => {
              if (isFirefox()) {
                e.preventDefault();
                volumeSliderRef.current?.blur();
              }
            }}
          />
          <SSoundButton
            iconOnly
            size='sm'
            view='transparent'
            onClick={() => {
              handleToggleMutedInner(!isMuted ? 0 : 1);
            }}
          >
            <InlineSvg
              svg={isMuted ? VolumeOff : VolumeOn}
              width='24px'
              height='24px'
              fill='#FFFFFF'
            />
          </SSoundButton>
        </SSoundControls>
      </SFullscreenControlsContainer>
    );
  }
);

export default PostVideoFullscreenControls;

const SFullscreenControlsContainer = styled.div`
  position: absolute;
  left: 5%;
  bottom: 12px;

  height: 64px;
  width: 90%;

  z-index: 2147483647;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 8px;

  ${({ theme }) => theme.media.tablet} {
    bottom: 0;
    width: 432px;
    left: calc(50% - 216px);
  }
`;

const SPlayPauseButton = styled(Button)`
  flex-shrink: 0;
`;

const STime = styled.div`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: #ffffff;
  width: 94px;

  white-space: pre;
`;

const SSlider = styled.input.attrs({ type: 'range' })<{
  withThumb?: boolean;
}>`
  position: relative;
  -webkit-appearance: none;
  display: block;

  background-color: transparent;

  width: 100%;

  z-index: 3;

  &:focus {
    outline: none;
  }

  &::-webkit-slider-runnable-track {
    height: 8px;
    border-color: transparent;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    cursor: pointer;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    outline: none;
    box-shadow: unset;

    height: 12px;
    width: 12px;
    border-radius: 0px;
    background: transparent;
    border: transparent;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    border: transparent;
    background: transparent;
    outline: none;
    box-shadow: unset;
  }

  ${({ withThumb }) =>
    withThumb
      ? css`
          ::-webkit-slider-thumb {
            height: 12px;
            width: 12px;
            border-radius: 48px;
            margin-top: -2px;
            background: #ffffff;
          }

          &::-moz-range-thumb {
            background: #ffffff;
            height: 12px;
            width: 12px;
            border-radius: 50%;
          }
        `
      : null}

  &::-webkit-slider-runnable-track {
    background: linear-gradient(#1d6aff, #1d6aff) 0 / var(--sx) 100% no-repeat,
      rgba(255, 255, 255, 0.2);
    border-radius: 8px;
  }

  &:hover::-webkit-slider-runnable-track {
    background: linear-gradient(#1d6aff, #1d6aff) 0 / var(--sx) 100% no-repeat,
      rgba(255, 255, 255, 0.2);
  }

  &:active::-webkit-slider-runnable-track {
    background: linear-gradient(#1d6aff, #1d6aff) 0 / var(--sx) 100% no-repeat,
      rgba(255, 255, 255, 0.2);
  }

  &::-moz-range-track {
    height: 8px;
    border-color: transparent;
    background: linear-gradient(#1d6aff, #1d6aff) 0 / var(--sx) 100% no-repeat,
      rgba(255, 255, 255, 0.2);
    border-radius: 12px;

    cursor: pointer;
  }
`;

const SSoundControls = styled.div`
  display: flex;
  gap: 8px;
`;

const SSoundButton = styled(Button)`
  background: transparent;
  padding: 0;
  &:hover:enabled,
  &:active:enabled,
  &:focus:enabled {
    background: transparent;
  }
`;
