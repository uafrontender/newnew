import React from 'react';
import styled from 'styled-components';
import Cropper from 'react-easy-crop';
import { Area, Point } from 'react-easy-crop/types';

// Redux
import { useAppSelector } from '../../../redux-store/store';

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
  const { ui } = useAppSelector((state) => state);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    ui.resizeMode
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
    &:before {
      content: '';
      position: absolute;

      width: ${({ pseudoElementWidth }) => `${pseudoElementWidth}px`};
      height: 100%;

      z-index: 12;

      ${({ theme }) => theme.media.tablet} {
        transform: ${({ x, y, zoom }) =>
          `translate(${x}px, ${y}px) scale(${zoom})`};
        box-shadow: 0 0 0 9999em;
        color: ${({ theme }) => theme.colorsThemed.background.primary};
      }
    }
  }

  .cropper-cropArea {
    border: transparent;

    color: ${({ theme }) => theme.colors.dark};
    opacity: 0.45;

    border-radius: 16px;
  }
`;
