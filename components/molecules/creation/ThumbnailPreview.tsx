import React from 'react';
import styled, { useTheme } from 'styled-components';

import Modal from '../../organisms/Modal';
import Video from '../../atoms/creation/Video';
import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';

import chevronLeft from '../../../public/images/svg/icons/outlined/ChevronLeft.svg';

interface IFileUpload {
  open: boolean;
  value: any;
  thumbnails: any;
  handleClose: () => void;
}

export const ThumbnailPreview: React.FC<IFileUpload> = (props) => {
  const {
    open,
    value,
    thumbnails,
    handleClose,
  } = props;
  const theme = useTheme();

  const preventCLick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Modal
      show={open}
      onClose={handleClose}
    >
      <SMobileContainer onClick={preventCLick}>
        <SModalVideoWrapper>
          <Video
            loop
            muted
            src={value}
            play={open}
            thumbnails={thumbnails}
          />
        </SModalVideoWrapper>
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
      </SMobileContainer>
    </Modal>
  );
};

export default ThumbnailPreview;

const SModalVideoWrapper = styled.div`
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

const SMobileContainer = styled.div`
  width: 100%;
  height: 100%;
  background: ${(props) => props.theme.colorsThemed.background.primary};
`;
