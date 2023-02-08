import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  const [isChanging, setIsChanging] = useState(false);
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
        onTouchStart={() => setIsChanging(true)}
        onTouchEnd={() => setIsChanging(false)}
        onTouchCancel={() => setIsChanging(false)}
        onChange={handleChange}
      />
      {withTime ? (
        <STime
          show={isChanging}
        >{`${formattedCurrent} / ${formattedDuration}`}</STime>
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

    &::-moz-range-track {
      height: 6px;
      border-color: transparent;
      background: linear-gradient(#ffffff, #ffffff) 0 / var(--sx) 100% no-repeat,
        rgba(255, 255, 255, 0.2);
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

  ${({ theme }) => theme.media.laptop} {
    display: block;
    left: initial;
  }
`;
