import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import 'moment-duration-format';

interface IPlayerScrubber {
  isHovered: boolean;
  currentTime: number;
  videoDuration: number;
  withTime?: boolean;
  handleChangeTime: (newTime: number) => void;
}

const PlayerScrubber: React.FC<IPlayerScrubber> = ({
  isHovered,
  currentTime,
  videoDuration,
  withTime,
  handleChangeTime,
}) => {
  const sliderRef = useRef<HTMLInputElement>();
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
        : '',
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

  return (
    <SContainer isHovered={isHovered}>
      <SSlider
        ref={(el) => {
          sliderRef.current = el!!;
        }}
        value={progress}
        min={0}
        max={100}
        step={0.1}
        aria-labelledby='Video seek'
        onChange={handleChange}
      />
      {withTime ? (
        <STime>{`${formattedCurrent} / ${formattedDuration}`}</STime>
      ) : null}
    </SContainer>
  );
};

export default PlayerScrubber;

const SContainer = styled.div<{
  isHovered: boolean;
}>`
  position: absolute;
  bottom: 0px;
  left: 0;

  width: 100%;

  ${({ theme }) => theme.media.tablet} {
    width: calc(100% - 24px);
    left: 12px;

    bottom: 6px;
  }

  ${({ theme }) => theme.media.laptop} {
    opacity: ${({ isHovered }) => (isHovered ? 1 : 0)};

    transition: opacity 0.1s linear;
  }
`;

const SSlider = styled.input.attrs({ type: 'range' })`
  -webkit-appearance: none;
  display: block;

  background-color: transparent;

  width: 100%;

  &:focus {
    outline: none;
  }

  &::-webkit-slider-runnable-track {
    height: 4px;
    border-color: transparent;
    background: rgba(255, 255, 255, 0.2);
    cursor: pointer;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;

    height: 8px;
    width: 8px;
    border-radius: 48px;
    background: transparent;
    border: transparent;
    cursor: pointer;

    margin-top: -4px;

    transition: 0.1s ease-in-out;

    ${({ theme }) => theme.media.tablet} {
      height: 12px;
      width: 12px;
      background: #ffffff;
    }
  }

  &:hover::-webkit-slider-thumb {
    transform: scale(1.1);
  }

  &::-moz-range-thumb {
    height: 12px;
    width: 12px;
    border-radius: 50%;
    border: transparent;
    background: transparent;
    cursor: pointer;

    transition: 0.1s ease-in-out;

    ${({ theme }) => theme.media.tablet} {
      background: #ffffff;
    }
  }
  &:hover::-moz-range-thumb {
    transform: scale(1.1);
    margin-top: -4px;
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

  &::-moz-range-track {
    height: 6px;
    border-color: transparent;
    background: linear-gradient(rgba(254, 44, 85, 1), rgba(254, 44, 85, 1)) 0 /
        var(--sx) 100% no-repeat,
      rgba(255, 255, 255, 0.2);

    cursor: pointer;
  }

  ${({ theme }) => theme.media.tablet} {
    &:hover::-webkit-slider-runnable-track {
      height: 6px;
      transform: translateY(1px);
    }

    ::-webkit-slider-thumb {
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

    &::-moz-range-track {
      height: 6px;
      border-color: transparent;
      background: linear-gradient(#ffffff, #ffffff) 0 / var(--sx) 100% no-repeat,
        rgba(255, 255, 255, 0.2);
    }

    &::-moz-range-thumb {
      transform: scale(0);
    }
    &:hover::-moz-range-thumb {
      transform: scale(1.1);
    }
  }
`;

const STime = styled.div`
  display: none;

  ${({ theme }) => theme.media.laptop} {
    position: absolute;
    bottom: 12px;

    font-size: 12px;
    color: #ffffff;
  }
`;
