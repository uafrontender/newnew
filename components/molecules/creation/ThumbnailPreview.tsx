import React, {
  useState,
  useCallback, useEffect, useRef,
} from 'react';
import styled, { useTheme } from 'styled-components';

import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';

import volumeOn from '../../../public/images/svg/icons/filled/VolumeON.svg';
import volumeOff from '../../../public/images/svg/icons/filled/VolumeOff.svg';
import chevronLeft from '../../../public/images/svg/icons/outlined/ChevronLeft.svg';

interface IFileUpload {
  open: boolean;
  value: any;
  handleClose: () => void;
}

export const ThumbnailPreview: React.FC<IFileUpload> = (props) => {
  const {
    open,
    value,
    handleClose,
  } = props;
  const theme = useTheme();
  const videoRef: any = useRef();
  const [thumbnailVideoMuted, setThumbnailVideoMuted] = useState(true);

  const toggleThumbnailVideoMuted = useCallback(() => {
    setThumbnailVideoMuted(!thumbnailVideoMuted);
  }, [thumbnailVideoMuted]);

  const preventCLick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (open) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [open]);

  return (
    <Modal
      show={open}
      onClose={handleClose}
    >
      <SMobileContainer onClick={preventCLick}>
        <SModalVideo
          loop
          ref={videoRef}
          src={`${value.url}#t=${0},${3}`}
          muted={thumbnailVideoMuted}
        />
        <SModalCloseIcon>
          <Button
            iconOnly
            view="transparent"
            onClick={handleClose}
          >
            <InlineSVG
              svg={chevronLeft}
              fill={theme.colorsThemed.text.primary}
              width="20px"
              height="20px"
            />
          </Button>
        </SModalCloseIcon>
        <SModalSoundIcon>
          <Button
            iconOnly
            view="transparent"
            onClick={toggleThumbnailVideoMuted}
          >
            <InlineSVG
              svg={thumbnailVideoMuted ? volumeOff : volumeOn}
              fill={theme.colorsThemed.text.primary}
              width="20px"
              height="20px"
            />
          </Button>
        </SModalSoundIcon>
      </SMobileContainer>
    </Modal>
  );
};

export default ThumbnailPreview;

const SModalVideo = styled.video`
  width: 100%;
  height: 100vh;
`;

const SModalCloseIcon = styled.div`
  top: 16px;
  left: 16px;
  position: absolute;

  button {
    width: 36px;
    height: 36px;
    border-radius: 12px;
  }
`;

const SModalSoundIcon = styled.div`
  right: 16px;
  bottom: 16px;
  position: absolute;

  button {
    width: 36px;
    height: 36px;
    border-radius: 12px;
  }
`;

const SMobileContainer = styled.div`
  width: 100%;
  height: 100%;
  background: ${(props) => props.theme.colorsThemed.background.primary};
`;
