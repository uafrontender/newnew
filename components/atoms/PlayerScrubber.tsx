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
import isFirefox from '../../utils/isFirefox';

interface IPlayerScrubber {
  isHovered: boolean;
  videoDuration: number;
  withTime?: boolean;
  bufferedPercent?: number;
  handleChangeTime: (newTime: number) => void;
  onPlaybackProgress?: (newTime: number) => void;
}

type PlayerScrubberHandle = {
  changeCurrentTime: (newValue: number) => void;
};

export type TPlayerScrubber = React.ElementRef<typeof PlayerScrubber>;

const PlayerScrubber = React.forwardRef<PlayerScrubberHandle, IPlayerScrubber>(
  (
    {
      isHovered,
      videoDuration,
      withTime,
      bufferedPercent,
      handleChangeTime,
      onPlaybackProgress,
    },
    ref
  ) => {
    const sliderRef = useRef<HTMLInputElement>();
    const [isChanging, setIsChanging] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    useImperativeHandle(ref, () => ({
      changeCurrentTime(newValue: number) {
        setCurrentTime(newValue);
      },
    }));

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

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        handleChangeTime(
          (videoDuration / 100) * (parseFloat(e.target.value) as number)
        );
      },
      [handleChangeTime, videoDuration]
    );

    useEffect(() => {
      if (sliderRef.current) {
        sliderRef.current.style.setProperty(
          '--sx',
          `calc(${progress / 100} * 100%)`
        );
      }
    }, [progress]);

    useEffect(() => {
      if (onPlaybackProgress) {
        onPlaybackProgress?.(progress);
      }
    }, [onPlaybackProgress, progress]);

    return (
      <SContainer isHovered={isHovered} isChanging={isChanging}>
        <SSlider
          ref={(el) => {
            sliderRef.current = el!!;
          }}
          value={progress}
          min={0}
          max={100}
          step={0.1}
          aria-labelledby='Video seek'
          bufferedPercent={bufferedPercent}
          onTouchStart={(e) => {
            e.stopPropagation();
            setIsChanging(true);
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            setIsChanging(false);
          }}
          onTouchCancel={(e) => {
            e.stopPropagation();
            setIsChanging(false);
          }}
          onMouseEnter={() => setIsChanging(true)}
          onMouseLeave={() => setIsChanging(false)}
          onMouseUp={(e) => {
            if (isFirefox()) {
              e.preventDefault();
              sliderRef.current?.blur();
            }
          }}
          onBlur={() => setIsChanging(false)}
          onChange={handleChange}
        />
        {withTime ? (
          <STime
            show={isChanging}
          >{`${formattedCurrent} / ${formattedDuration}`}</STime>
        ) : null}
      </SContainer>
    );
  }
);

export default PlayerScrubber;

const SContainer = styled.div<{
  isHovered: boolean;
  isChanging: boolean;
}>`
  position: absolute;
  bottom: 0px;
  left: 0;

  @-moz-document url-prefix() {
    bottom: -6px;
  }

  width: 100%;

  &::before {
    content: '';
    position: absolute;
    bottom: 0px;
    left: 0;
    width: 100%;
    background-color: rgb(0, 0, 0, 0.8);
    box-shadow: 0px 0px 34px 32px rgb(0 0 0 / 85%);
    z-index: 2;
    opacity: 0;
    overflow: hidden;
    border-bottom-left-radius: ${({ theme }) => theme.borderRadius.medium};
    border-bottom-right-radius: ${({ theme }) => theme.borderRadius.medium};
    transition: linear 0.3s;
  }

  ${({ isChanging }) =>
    isChanging
      ? css`
          &::before {
            opacity: 1;
            height: 1px;
          }
        `
      : null};

  ${({ theme }) => theme.media.tablet} {
    width: calc(100% - 24px);
    left: 12px;

    bottom: 6px;

    @-moz-document url-prefix() {
      bottom: 0px;
    }

    &::before {
      width: calc(100% + 24px);
      left: -12px;
      bottom: -5px;
      overflow: hidden;
      height: 0px;
      background-color: rgba(0, 0, 0, 0.62);
      box-shadow: 0px -18px 18px 4px rgba(0, 0, 0, 0.62);
      transition: opacity linear 0.3s;
    }

    ${({ isChanging }) =>
      isChanging
        ? css`
            &::before {
              opacity: 1;
              height: 46px;
            }
          `
        : null};
  }

  ${({ theme }) => theme.media.laptop} {
    opacity: ${({ isHovered }) => (isHovered ? 1 : 0)};

    transition: opacity 0.1s linear;
  }
`;

const SSlider = styled.input.attrs({ type: 'range' })<{
  bufferedPercent?: number;
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

  /* Webkit */
  &::-webkit-slider-runnable-track {
    height: 4px;
    border-color: transparent;
    background: rgba(255, 255, 255, 0.2);
    cursor: pointer;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    outline: none;
    box-shadow: unset;

    height: 48px;
    width: 48px;
    border-radius: 0px;
    background: transparent;
    border: transparent;
    cursor: pointer;

    margin-top: -16px;

    transition: 0.1s ease-in-out;
  }

  &:hover::-webkit-slider-thumb {
    transform: scale(1.1);
  }

  &::-webkit-slider-runnable-track {
    background: linear-gradient(rgba(254, 44, 85, 1), rgba(254, 44, 85, 1)) 0 /
        var(--sx) 100% no-repeat,
      rgba(255, 255, 255, 0.2);
  }

  &:hover::-webkit-slider-runnable-track {
    background: linear-gradient(rgba(254, 44, 85, 1), rgba(254, 44, 85, 1)) 0 /
        var(--sx) 100% no-repeat,
      rgba(255, 255, 255, 0.2);
  }

  &:active::-webkit-slider-runnable-track {
    background: linear-gradient(rgba(254, 44, 85, 1), rgba(254, 44, 85, 1)) 0 /
        var(--sx) 100% no-repeat,
      rgba(255, 255, 255, 0.2);
  }

  /* Firefox */
  &::-moz-range-thumb {
    border: transparent;
    background: transparent;
    outline: none;
    box-shadow: unset;

    height: 48px;
    width: 48px;
    border-radius: 0px;
    cursor: pointer;

    margin-top: -16px;

    transition: 0.1s ease-in-out;
  }

  &:hover::-moz-range-thumb {
    transform: scale(1.1);
  }

  &::-moz-range-track {
    height: 6px;
    border-color: transparent;
    background: linear-gradient(rgba(254, 44, 85, 1), rgba(254, 44, 85, 1)) 0 /
        var(--sx) 100% no-repeat,
      rgba(255, 255, 255, 0.2);

    cursor: pointer;
  }

  ${({ bufferedPercent }) =>
    bufferedPercent
      ? css`
          &::before {
            content: '';

            z-index: -1;
            position: absolute;
            bottom: 0;

            width: ${bufferedPercent}%;
            height: 4px;

            background-color: rgba(255, 255, 255, 0.4);
          }
        `
      : null};

  ${({ theme }) => theme.media.tablet} {
    /* Firefox */
    &:hover::-webkit-slider-runnable-track {
      height: 6px;
      transform: translateY(1px);
    }

    ::-webkit-slider-thumb {
      height: 12px;
      width: 12px;
      border-radius: 48px;
      margin-top: -6px;
      background: #ffffff;
      transform: scale(0);
    }

    &:hover::-webkit-slider-thumb {
      transform: scale(1.1);
      margin-top: -3px;
    }

    &::-webkit-slider-runnable-track {
      background: linear-gradient(#ffffff, #ffffff) 0 / var(--sx) 100% no-repeat,
        rgba(255, 255, 255, 0.2);
    }

    &:hover::-webkit-slider-runnable-track {
      background: linear-gradient(#ffffff, #ffffff) 0 / var(--sx) 100% no-repeat,
        rgba(255, 255, 255, 0.2);
    }

    &:active::-webkit-slider-runnable-track {
      background: linear-gradient(#ffffff, #ffffff) 0 / var(--sx) 100% no-repeat,
        rgba(255, 255, 255, 0.2);
    }

    /* Firefox */
    &::-moz-range-track {
      height: 6px;
      border-color: transparent;
      background: linear-gradient(#ffffff, #ffffff) 0 / var(--sx) 100% no-repeat,
        rgba(255, 255, 255, 0.2);
      border-radius: 12px;
    }

    &::-moz-range-thumb {
      transform: scale(0);
      background: #ffffff;
      height: 12px;
      width: 12px;
      border-radius: 50%;
    }
    &:hover::-moz-range-thumb {
      transform: scale(1.1);
    }

    ${({ bufferedPercent }) =>
      bufferedPercent
        ? css`
            &::before {
              height: 4px;
            }
          `
        : null};
  }
`;

const STime = styled.div<{
  show: boolean;
}>`
  position: absolute;
  bottom: 12px;
  left: 4px;

  font-size: 12px;
  color: #ffffff;

  display: ${({ show }) => (show ? 'block' : 'none')};

  z-index: 2;

  ${({ theme }) => theme.media.laptop} {
    left: initial;
  }

  @-moz-document url-prefix() {
    bottom: 16px;
  }
`;
