import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';
import InlineSVG from '../../atoms/InlineSVG';

import { useAppSelector } from '../../../redux-store/store';

import closeIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import chevronLeft from '../../../public/images/svg/icons/outlined/ChevronLeft.svg';

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
  const videoRef: any = useRef();
  const videoThumbs: any = useRef({ ...thumbnails });
  const constraintsRef: any = useRef(null);
  const progressIndicator: any = useRef(null);
  const constraintsLeftRef: any = useRef(null);
  const constraintsRightRef: any = useRef(null);
  const constraintsCenterRef: any = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoChanks, setVideoChanks] = useState([]);
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM'].includes(resizeMode);

  const visiblePart = (3 * 100) / (videoRef?.current?.duration || 0);
  const hiddenPartFirst = videoThumbs.current.startTime
    ? (videoThumbs.current.startTime * 100) / (videoRef?.current?.duration || 0) : 0;
  const hiddenPartSecond = 100 - visiblePart - hiddenPartFirst;

  const preventCLick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onSubmit = () => {
    handleSubmit(videoThumbs.current);
  };
  const handleVideoSelectDrag = useCallback(() => {
    const x = constraintsCenterRef.current.getBoundingClientRect().x - 16;
    constraintsLeftRef.current.style.width = `${x}px`;
    constraintsRightRef.current.style.width = `calc(${100 - visiblePart}% - ${x}px + 5px)`;
    const xPositionPercent = ((x - 3) * 100) / (window.innerWidth - 36);
    const startFrame = +((videoRef.current.duration * xPositionPercent) / 100).toFixed(2);

    videoThumbs.current.startTime = startFrame;
    videoThumbs.current.endTime = startFrame + 3;
    videoRef.current.currentTime = startFrame;
    videoRef.current.play();
  }, [visiblePart]);

  const handleVideoLoaded = useCallback(() => {
    const { duration } = videoRef.current;
    const onePart: any = (duration / 10).toFixed(2);
    const chanks: any = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= 10; i++) {
      chanks.push({
        start: (onePart * (i - 1)).toFixed(2),
        end: (onePart * i).toFixed(2),
      });
    }
    setVideoChanks(chanks);
    setVideoLoaded(true);
  }, []);
  const handleVideoProgress = useCallback(() => {
    if (open) {
      const percentage = (videoRef.current.currentTime * 100) / videoRef.current.duration;
      progressIndicator.current.style.transition = 'all ease 0.5s';
      progressIndicator.current.style.left = `calc(${percentage}% - 3px)`;
      progressIndicator.current.style.transform = 'translateX(-50%)';

      if (videoRef.current.currentTime >= videoThumbs.current.endTime) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [open]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadeddata = handleVideoLoaded;
      videoRef.current.ontimeupdate = handleVideoProgress;
    }
  }, [handleVideoLoaded, handleVideoProgress, videoRef]);
  useEffect(() => {
    if (open && progressIndicator.current) {
      const percentage = videoThumbs.current.startTime
        ? (videoThumbs.current.startTime * 100) / videoRef.current.duration : 0;
      videoRef.current.currentTime = videoThumbs.current.startTime;
      progressIndicator.current.style.left = `${percentage}%`;
      if (percentage) {
        progressIndicator.current.style.transform = 'translateX(-50%)';
        progressIndicator.current.style.transition = 'all ease 0.5s';
      } else {
        progressIndicator.current.style.transform = 'unset';
        progressIndicator.current.style.transition = 'unset';
      }
      setTimeout(() => {
        videoRef.current?.play();
      }, 500);
    } else {
      videoRef.current.pause();
    }
  }, [
    open,
    progressIndicator,
    thumbnails.endTime,
    thumbnails.startTime,
    videoThumbs.current.startTime,
  ]);

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
          <SModalVideoEdit
            ref={videoRef}
            src={value}
            onLoad={handleVideoLoaded}
          />
          {videoLoaded && (
            <SModalSelectLine>
              {videoChanks.map((chank: any) => (
                <SModalVideoEditSmall
                  muted
                  key={chank.start}
                  src={`${value}#t=${chank.start},${chank.end}`}
                />
              ))}
              <SModalSelectTopWrapper ref={constraintsRef}>
                <SProgressIndicator ref={progressIndicator} />
                <SModalSelectTopWrapperHiddenLeftPart
                  ref={constraintsLeftRef}
                  style={{
                    width: `${hiddenPartFirst}%`,
                  }}
                />
                <SModalSelectTopWrapperVisiblePart
                  ref={constraintsCenterRef}
                  drag="x"
                  style={{
                    width: `${visiblePart}%`,
                  }}
                  onDrag={handleVideoSelectDrag}
                  onDragEnd={handleVideoSelectDrag}
                  onDragStart={handleVideoSelectDrag}
                  dragElastic={0}
                  dragMomentum={false}
                  dragConstraints={constraintsRef}
                />
                <SModalSelectTopWrapperHiddenRightPart
                  ref={constraintsRightRef}
                  style={{
                    width: `${hiddenPartSecond}%`,
                  }}
                />
              </SModalSelectTopWrapper>
            </SModalSelectLine>
          )}
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

const SModalVideoEdit = styled.video`
  width: calc(100% - 58px);
  height: auto;
  margin: 0 29px;
  overflow: hidden;
  max-height: 65vh;
  border-radius: 16px;
`;

const SModalVideoEditSmall = styled.video`
  width: 10%;
  height: auto;
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

const SModalSelectLine = styled.div`
  position: relative;
  margin-top: 24px;
`;

const SProgressIndicator = styled.div`
  top: 0;
  left: 0;
  width: 4px;
  height: calc(100% - 3px);
  z-index: 3;
  position: absolute;
  background: ${(props) => props.theme.colorsThemed.accent.yellow};
  border-radius: 1px;
`;

const SModalSelectTopWrapper = styled.div`
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  position: absolute;
`;

const SModalSelectTopWrapperVisiblePart = styled(motion.div)`
  width: 100%;
  height: calc(100% - 3px);
  border: 3px solid ${(props) => props.theme.colorsThemed.text.primary};
  z-index: 2;
  position: absolute;
  overflow: hidden;
  border-radius: 4px;
`;

const SModalSelectTopWrapperHiddenLeftPart = styled.div`
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1;
  opacity: 0.5;
  position: absolute;
  background: ${(props) => props.theme.colorsThemed.background.primary};
`;

const SModalSelectTopWrapperHiddenRightPart = styled.div`
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  opacity: 0.5;
  position: absolute;
  background: ${(props) => props.theme.colorsThemed.background.primary};
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
