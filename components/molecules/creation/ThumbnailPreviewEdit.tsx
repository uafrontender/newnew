import React, {
  useEffect,
  useRef,
  useState,
} from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';

import chevronLeft from '../../../public/images/svg/icons/outlined/ChevronLeft.svg';

interface IThumbnailPreviewEdit {
  open: boolean;
  value: any;
  handleClose: () => void;
}

export const ThumbnailPreviewEdit: React.FC<IThumbnailPreviewEdit> = (props) => {
  const {
    open,
    value,
    handleClose,
  } = props;
  const theme = useTheme();
  const { t } = useTranslation('creation');
  const videoRef: any = useRef();
  const constraintsRef: any = useRef(null);
  const progressIndicator: any = useRef(null);
  const constraintsLeftRef: any = useRef(null);
  const constraintsRightRef: any = useRef(null);
  const constraintsCenterRef: any = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoChanks, setVideoChanks] = useState([]);

  const preventCLick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleVideoSelectDrag = () => {
    const x = constraintsCenterRef.current.getBoundingClientRect().x - 16;
    constraintsLeftRef.current.style.width = `${x}px`;
    constraintsRightRef.current.style.width = `calc(70% - ${x}px)`;
    const xPositionPercent = ((x + 16) * 100) / window.innerWidth;
    const startFrame = +((videoRef.current.duration * xPositionPercent) / 100).toFixed(2);

    videoRef.current.currentTime = startFrame;
    videoRef.current.play();
  };

  const handleVideoLoaded = () => {
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
  };
  const handleVideoProgress = () => {
    const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    progressIndicator.current.style.transition = 'all ease 0.5s';
    progressIndicator.current.style.left = `${percentage}%`;

    if (videoRef.current.duration >= 3) {
      videoRef.current.pause();
    }

    if (percentage === 100) {
      progressIndicator.current.style.transition = 'unset';
      progressIndicator.current.style.left = 0;
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadeddata = handleVideoLoaded;
      videoRef.current.ontimeupdate = handleVideoProgress;
    }
  }, [videoRef]);
  useEffect(() => {
    if (open) {
      videoRef.current.currentTime = 0;
      progressIndicator.current.style.transition = 'unset';
      progressIndicator.current.style.left = 0;
      setTimeout(() => {
        videoRef.current?.play();
      }, 500);
    } else {
      videoRef.current.pause();
    }
  }, [open]);

  return (
    <Modal
      show={open}
      onClose={handleClose}
    >
      <SMobileContainerEdit onClick={preventCLick}>
        <SModalTopContent>
          <SModalTopLine>
            <InlineSVG
              clickable
              svg={chevronLeft}
              fill={theme.colorsThemed.text.primary}
              width="20px"
              height="20px"
              onClick={handleClose}
            />
            <SModalTopLineTitle variant={3} weight={600}>
              {t('secondStep.video.thumbnail.title')}
            </SModalTopLineTitle>
          </SModalTopLine>
          <SModalVideoEdit
            ref={videoRef}
            src={value.url}
            onLoad={handleVideoLoaded}
          />
          {videoLoaded && (
            <SModalSelectLine>
              {videoChanks.map((chank: any) => (
                <SModalVideoEditSmall
                  muted
                  key={chank.start}
                  src={`${value.url}#t=${chank.start},${chank.end}`}
                />
              ))}
              <SModalSelectTopWrapper ref={constraintsRef}>
                <SProgressIndicator ref={progressIndicator} />
                <SModalSelectTopWrapperHiddenLeftPart
                  ref={constraintsLeftRef}
                  style={{
                    width: 0,
                  }}
                />
                <SModalSelectTopWrapperVisiblePart
                  ref={constraintsCenterRef}
                  drag="x"
                  style={{
                    width: '30%',
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
                    width: '70%',
                  }}
                />
              </SModalSelectTopWrapper>
            </SModalSelectLine>
          )}
        </SModalTopContent>
        <SModalButtonContainer>
          <Button
            view="primaryGrad"
            onClick={handleClose}
          >
            {t('secondStep.video.thumbnail.submit')}
          </Button>
        </SModalButtonContainer>
      </SMobileContainerEdit>
    </Modal>
  );
};

export default ThumbnailPreviewEdit;

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

const SMobileContainerEdit = styled.div`
  width: 100%;
  height: 100%;
  padding: 18px;
  position: relative;
  min-height: 100vh;
  background: ${(props) => props.theme.colorsThemed.background.primary};
`;

const SModalTopLine = styled.div`
  display: flex;
  padding: 18px 0;
  align-items: center;
  margin-bottom: 16px;
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
