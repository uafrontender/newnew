import React from 'react';
import styled from 'styled-components';
import Cropper from 'react-easy-crop';
import { Area, Point } from 'react-easy-crop/types';
import { useAppState } from '../../../contexts/appStateContext';

type TCoverImageCropper = {
  crop: Point;
  zoom: number;
  coverImageInEdit: string;
  originalImageWidth: number;
  disabled: boolean;
  onCropChange: (location: Point) => void;
  onCropComplete:
    | ((croppedArea: Area, croppedAreaPixels: Area) => void)
    | undefined;
  onZoomChange: ((zoom: number) => void) | undefined;
};

const CoverImageCropper: React.FunctionComponent<TCoverImageCropper> = ({
  zoom,
  crop,
  coverImageInEdit,
  originalImageWidth,
  disabled,
  onCropChange,
  onCropComplete,
  onZoomChange,
}) => {
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );

  return (
    <SCropperWrapper
      x={crop.x}
      y={crop.y}
      zoom={zoom}
      pseudoElementWidth={originalImageWidth}
    >
      {coverImageInEdit && (
        <Cropper
          image={coverImageInEdit}
          objectFit='vertical-cover'
          crop={crop}
          cropSize={{
            height: isMobile ? 448 : 498,
            width: isMobile ? 252 : 280,
          }}
          cropShape='rect'
          showGrid={false}
          zoom={zoom}
          aspect={1}
          classes={{
            containerClassName: 'cropper-container',
            mediaClassName: 'cropper-media',
            cropAreaClassName: 'cropper-cropArea',
          }}
          onCropChange={disabled ? () => {} : onCropChange}
          onCropComplete={disabled ? () => {} : onCropComplete}
          onZoomChange={disabled ? () => {} : onZoomChange}
        />
      )}
    </SCropperWrapper>
  );
};

export default CoverImageCropper;

const SCropperWrapper = styled.div<{
  x: number;
  y: number;
  zoom: number;
  pseudoElementWidth: number;
}>`
  position: relative;
  min-height: 500px;

  ${({ theme }) => theme.media.tablet} {
  }

  .cropper-container {
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    &:before {
      content: '';
      position: absolute;

      width: ${({ pseudoElementWidth }) => `${pseudoElementWidth}px`};
      height: 100%;

      z-index: 12;
    }
  }

  .cropper-cropArea {
    border: transparent;

    color: ${({ theme }) => theme.colors.dark};
    opacity: 0.45;

    border-radius: 16px;
  }
`;
