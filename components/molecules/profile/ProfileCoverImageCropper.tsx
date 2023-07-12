import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import Cropper from 'react-easy-crop';
import { Area, Point } from 'react-easy-crop/types';
import DragToRepositionLabel from './DragToRepositionLabel';
import { useAppState } from '../../../contexts/appStateContext';

type TProfileCoverImageCropper = {
  crop: Point;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  profileCoverUrlInEdit: string;
  originalImageWidth: number;
  disabled: boolean;
  onCropChange: (location: Point) => void;
  onCropComplete:
    | ((croppedArea: Area, croppedAreaPixels: Area) => void)
    | undefined;
  onZoomChange: ((zoom: number) => void) | undefined;
};

const ProfileCoverImageCropper: React.FunctionComponent<
  TProfileCoverImageCropper
> = ({
  crop,
  zoom,
  minZoom,
  maxZoom,
  profileCoverUrlInEdit,
  originalImageWidth,
  disabled,
  onCropChange,
  onCropComplete,
  onZoomChange,
}) => {
  const { t } = useTranslation('common');
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    resizeMode
  );
  const [isPressed, setIsPressed] = useState(false);
  const [cropSize, setCropSize] = useState<number | undefined>();
  const containerRef = useRef<HTMLDivElement | undefined>();

  const handleSetPressed = () => setIsPressed(true);
  const handleSetUnpressed = () => setIsPressed(false);

  useEffect(() => {
    if (!containerRef.current) {
      return () => {};
    }

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current) {
        return;
      }
      const boundingClientRect = containerRef.current.getBoundingClientRect();
      const newCropSize =
        Math.min(boundingClientRect.height, boundingClientRect.width) - 6;
      setCropSize(newCropSize);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isMobile]);

  return (
    <SCropperWrapper
      ref={(elem) => {
        if (elem) {
          containerRef.current = elem;
        }
      }}
      x={crop.x}
      y={crop.y}
      zoom={zoom}
      pseudoElementWidth={originalImageWidth}
      onMouseDown={() => handleSetPressed()}
      onMouseUp={() => handleSetUnpressed()}
      onMouseLeave={() => handleSetUnpressed()}
      onTouchStart={() => handleSetPressed()}
      onTouchEnd={() => handleSetUnpressed()}
      onTouchCancel={() => handleSetUnpressed()}
    >
      {profileCoverUrlInEdit && !isMobile ? (
        <DragToRepositionLabel
          text={t('dragToReposition')}
          isPressed={disabled ?? isPressed}
        />
      ) : null}
      {profileCoverUrlInEdit && (
        <Cropper
          image={profileCoverUrlInEdit}
          objectFit='horizontal-cover'
          crop={crop}
          cropSize={
            cropSize
              ? {
                  height: Math.floor(cropSize / 6) * 2,
                  width: cropSize,
                }
              : undefined
          }
          cropShape='rect'
          showGrid={false}
          zoom={zoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
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

export default ProfileCoverImageCropper;

const SCropperWrapper = styled.div<{
  x: number;
  y: number;
  zoom: number;
  pseudoElementWidth: number;
}>`
  position: relative;
  height: 500px;
  width: 100%;

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

  ${({ theme }) => theme.media.tablet} {
    height: 100%;
    z-index: 0;
    margin-right: auto;
    margin-left: auto;
  }

  .cropper-cropArea {
    border: transparent;

    color: ${({ theme }) => theme.colors.dark};
    opacity: 0.45;

    &:before {
      content: '';
      position: absolute;
      top: 0px;
      left: 0%;
      border-top: 30px solid #0b0a13;
      border-right: 30px solid transparent;
      border-bottom: 30px solid #0b0a13;
      width: 0;
      height: 100%;
    }

    &:after {
      content: '';
      position: absolute;
      top: 0px;
      right: 0%;
      border-top: 30px solid #0b0a13;
      border-left: 30px solid transparent;
      border-bottom: 30px solid #0b0a13;
      width: 0;
      height: 100%;
    }
  }
`;
