import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import styled, { css, useTheme } from 'styled-components';

import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';
import Headline from '../../atoms/Headline';
import InlineSVG from '../../atoms/InlineSVG';

import { useAppSelector } from '../../../redux-store/store';

import closeIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import chevronLeft from '../../../public/images/svg/icons/outlined/ChevronLeft.svg';

const BitmovinPlayer = dynamic(import('../../atoms/BitmovinPlayer'), {
  ssr: false,
  loading: () => <p>Loading player...</p>,
});

interface IThumbnailPreviewEdit {
  open: boolean;
  value: any;
  thumbnails: any;
  handleClose: () => void;
  handleSubmit: (value: any) => void;
}

export const ThumbnailPreviewEdit: React.FC<IThumbnailPreviewEdit> = (props) => {
  const {
    open,
    value,
    thumbnails,
    handleClose,
    handleSubmit,
  } = props;
  const theme = useTheme();
  const { t } = useTranslation('creation');
  const videoThumbs: any = useRef({ ...thumbnails });
  const [chunks, setChunks] = useState<string[]>([]);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const progressRef: any = useRef(null);
  const playerRef: any = useRef(null);
  const endTimeRef: any = useRef(null);
  const startTimeRef: any = useRef(null);
  const progressIndicatorRef: any = useRef(null);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM'].includes(resizeMode);

  const preventCLick = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const onSubmit = useCallback(() => {
    handleSubmit(videoThumbs.current);
  }, [handleSubmit]);
  const renderChunks = useCallback((chunk, index) => (
    <SProgressSeparator
      key={`chunk-${index}`}
      height={index % 5 === 0 ? '16px' : '6px'}
    />
  ), []);
  const setDuration = useCallback((duration) => {
    const percentage = (3 * 100) / duration;
    const durationCount = 100 / percentage;
    const separatorsCount = +(durationCount * 8).toFixed(0);

    setChunks(Array(separatorsCount)
      .fill('_'));
    setVideoDuration(duration);
  }, []);
  const setCurrentTime = useCallback((time) => {
    const percentage = ((time - videoThumbs.current.startTime) * 100) / 3;
    const position = (percentage * 70) / 100;

    progressIndicatorRef.current.style.transition = 'all ease 0.5s';
    progressIndicatorRef.current.style.left = `calc(50% - 38px + ${position}px)`;
    progressIndicatorRef.current.style.transform = 'translateX(-50%)';
  }, []);

  const getTime = useCallback((position) => {
    let seconds = videoThumbs.current.endTime;

    if (position === 'start') {
      seconds = videoThumbs.current.startTime;
    }

    let minutes = (seconds / 60).toFixed(0);

    if (+minutes) {
      seconds -= +minutes * 60;
    }

    if (minutes.length === 1) {
      minutes = `0${minutes}`;
    }

    if (seconds?.toString()?.length === 1) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  }, []);
  const handleVideoSelectDrag = useCallback(() => {
    const {
      left,
      width,
    } = progressRef.current.getBoundingClientRect();
    const initialPoint = (window.innerWidth / 2) - 36;
    const percentage = ((initialPoint - left) * 100) / width;
    const startTime = +((videoDuration * percentage) / 100).toFixed(0);
    const endTime = startTime + 3;

    videoThumbs.current = {
      startTime,
      endTime,
    };
    endTimeRef.current.innerHTML = getTime('end');
    startTimeRef.current.innerHTML = getTime('start');

    playerRef.current.off(
      // @ts-ignore
      window.bitmovin.player.PlayerEvent.TimeChanged,
      playerRef.current.handleTimeChange,
    );
    const handleTimeChange = () => {
      if (setCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }

      if (playerRef.current.getCurrentTime() >= videoThumbs.current.endTime) {
        playerRef.current.pause();
        playerRef.current.seek(videoThumbs.current.startTime);
        playerRef.current.play();
      }
    };
    playerRef.current.pause();
    // @ts-ignore
    playerRef.current.on(window.bitmovin.player.PlayerEvent.TimeChanged, handleTimeChange);
    playerRef.current.handleTimeChange = handleTimeChange;

    playerRef.current.seek(videoThumbs.current.startTime);
    playerRef.current.play();
  }, [getTime, videoDuration, setCurrentTime]);
  const getInitialXPosition = useCallback(() => {
    const generalWidth = (chunks.length * 7) - 5;
    const startPointPercentage = (videoThumbs.current.startTime * 100) / videoDuration;
    const startPoint = (generalWidth * startPointPercentage) / 100;

    return -startPoint;
  }, [chunks.length, videoDuration]);

  useEffect(() => {
    videoThumbs.current = { ...thumbnails };
    setChunks([]);
    setCurrentTime(videoThumbs.current.startTime);
  }, [thumbnails, open, setCurrentTime]);

  const initialX = getInitialXPosition();

  return (
    <Modal
      show={open}
      onClose={handleClose}
    >
      <SContainer onClick={preventCLick}>
        <SModalTopContent>
          <SModalTopLine>
            {isMobile && (
              <InlineSVG
                clickable
                svg={chevronLeft}
                fill={theme.colorsThemed.text.primary}
                width="20px"
                height="20px"
                onClick={handleClose}
              />
            )}
            {isMobile ? (
              <SModalTopLineTitle variant={3} weight={600}>
                {t('secondStep.video.thumbnail.title')}
              </SModalTopLineTitle>
            ) : (
              <SModalTopLineTitleTablet variant={6}>
                {t('secondStep.video.thumbnail.title')}
              </SModalTopLineTitleTablet>
            )}
            {!isMobile && (
              <InlineSVG
                clickable
                svg={closeIcon}
                fill={theme.colorsThemed.text.primary}
                width="24px"
                height="24px"
                onClick={handleClose}
              />
            )}
          </SModalTopLine>
          <SPlayerWrapper>
            {open && (
              <BitmovinPlayer
                id="thumbnail-preview-edit"
                muted={false}
                innerRef={playerRef}
                resources={value}
                thumbnails={thumbnails}
                setDuration={setDuration}
                borderRadius="16px"
                setCurrentTime={setCurrentTime}
              />
            )}
          </SPlayerWrapper>
          <STimeWrapper>
            <STimeStart
              variant={2}
              weight={600}
              innerRef={startTimeRef}
            >
              {getTime('start')}
            </STimeStart>
            <STimeEnd
              weight={600}
              variant={2}
              innerRef={endTimeRef}
            >
              {getTime('end')}
            </STimeEnd>
          </STimeWrapper>
          <SSelectLine>
            <SProgressIndicator ref={progressIndicatorRef} />
            <SInvisibleWrapper position="left">
              <SProgressSeparator height="100%" />
            </SInvisibleWrapper>
            <SInvisibleWrapper position="right">
              <SProgressSeparator height="100%" />
            </SInvisibleWrapper>
            {!!chunks.length && (
              <SProgressLine
                ref={progressRef}
                drag="x"
                style={{ x: initialX }}
                onDrag={handleVideoSelectDrag}
                onDragEnd={handleVideoSelectDrag}
                onDragStart={handleVideoSelectDrag}
                dragElastic={0}
                dragMomentum={false}
                dragConstraints={{
                  left: -(((chunks.length - 9) * 7) - 5),
                  right: 0,
                }}
              >
                {chunks.map(renderChunks)}
              </SProgressLine>
            )}
          </SSelectLine>
          {!isMobile && (
            <SDescription>
              <SText>
                {t('secondStep.video.thumbnail.description')}
              </SText>
            </SDescription>
          )}
        </SModalTopContent>
        {isMobile ? (
          <SModalButtonContainer>
            <Button
              view="primaryGrad"
              onClick={onSubmit}
            >
              {t('secondStep.video.thumbnail.submit')}
            </Button>
          </SModalButtonContainer>
        ) : (
          <SButtonsWrapper>
            <Button
              view="secondary"
              onClick={handleClose}
            >
              {t('secondStep.button.cancel')}
            </Button>
            <Button
              view="primaryGrad"
              onClick={onSubmit}
            >
              {t('secondStep.video.thumbnail.submit')}
            </Button>
          </SButtonsWrapper>
        )}
      </SContainer>
    </Modal>
  );
};

export default ThumbnailPreviewEdit;

const SContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 18px;
  position: relative;
  min-height: 100vh;
  background: ${(props) => props.theme.colorsThemed.background.primary};

  ${({ theme }) => theme.media.mobileL} {
    top: 50%;
    height: unset;
    margin: 0 auto;
    overflow: hidden;
    max-width: 464px;
    transform: translateY(-50%);
    min-height: unset;
    background: ${(props) => props.theme.colorsThemed.background.secondary};
    border-radius: 16px;
  }

  ${({ theme }) => theme.media.tablet} {
    padding: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
    max-width: 480px;
  }
`;

const SModalTopLine = styled.div`
  display: flex;
  padding: 18px 0;
  align-items: center;
  margin-bottom: 16px;

  ${({ theme }) => theme.media.mobileL} {
    padding: 10px 0;
    margin-bottom: 24px;
    justify-content: space-between;
  }
`;

const SModalTopLineTitleTablet = styled(Headline)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
`;

const SModalTopLineTitle = styled(Text)`
  color: ${(props) => props.theme.colorsThemed.text.primary};
  margin-left: 8px;
`;

const SModalTopContent = styled.div``;

const SModalButtonContainer = styled.div`
  left: 0;
  bottom: 24px;
  position: absolute;

  button {
    width: calc(100vw - 32px);
    margin: 0 16px;
    padding: 16px 20px;
  }
`;

const SButtonsWrapper = styled.div`
  display: flex;
  margin-top: 30px;
  align-items: center;
  justify-content: space-between;
`;

const SDescription = styled.div`
  margin-top: 24px;
`;

const SText = styled.span`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;

  ${({ theme }) => theme.media.tablet} {
    font-size: 14px;
    line-height: 18px;
  }

  ${({ theme }) => theme.media.laptop} {
    font-size: 14px;
    line-height: 20px;
  }
`;

const SPlayerWrapper = styled.div`
  width: 282px;
  height: 500px;
  margin: 0 auto;

  ${({ theme }) => theme.media.tablet} {
    width: 236px;
    height: 420px;
  }
`;

const STimeWrapper = styled.div`
  gap: 36px;
  margin: 17px auto 7px auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const STimeStart = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const STimeEnd = styled(Caption)`
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SSelectLine = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  overflow: hidden;
  position: relative;
  background: ${(props) => props.theme.colorsThemed.background.thumbLineVisible};
  align-items: center;
  justify-content: space-between;
`;

interface ISInvisibleWrapper {
  position: 'left' | 'right';
}

const SInvisibleWrapper = styled.div<ISInvisibleWrapper>`
  top: 0;
  width: calc(50% - 34px);
  height: 100%;
  z-index: 1;
  display: flex;
  position: absolute;
  background: ${(props) => props.theme.colorsThemed.background.thumbLineHidden};
  align-items: center;
  pointer-events: none;

  ${(props) => (props.position === 'left'
    ? css`
      left: 0;
      justify-content: flex-end;
    `
    : css`
      right: 0;
      justify-content: flex-start;
    `)};
`;

const SProgressLine = styled(motion.div)`
  gap: 5px;
  left: calc(50% - 36px);
  bottom: 0;
  cursor: grab;
  display: flex;
  position: absolute;
  align-items: flex-end;
  flex-direction: row;
  padding-bottom: 12px;
`;

interface ISProgressSeparator {
  height: string;
}

const SProgressSeparator = styled.div<ISProgressSeparator>`
  width: 2px;
  height: ${(props) => props.height};
  overflow: hidden;
  background: ${(props) => (props.theme.name === 'light' ? props.theme.colorsThemed.accent.blue : props.theme.colors.white)};
  border-radius: 2px;
  pointer-events: none;
`;

const SProgressIndicator = styled.div`
  top: 0;
  left: calc(50% - 34px);
  width: 4px;
  height: 100%;
  z-index: 2;
  position: absolute;
  overflow: hidden;
  background: ${(props) => props.theme.colorsThemed.accent.yellow};
  border-radius: 2px;
  pointer-events: none;
`;
