import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import Cropper from 'react-easy-crop';
import { Area, Point } from 'react-easy-crop/types';
import DragToRepositionLabel from './DragToRepositionLabel';
import { useAppState } from '../../../contexts/appStateContext';

type TProfileImageCropper = {
  crop: Point;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  avatarUrlInEdit: string;
  originalImageWidth: number;
  disabled: boolean;
  onCropChange: (location: Point) => void;
  onCropComplete:
    | ((croppedArea: Area, croppedAreaPixels: Area) => void)
    | undefined;
  onZoomChange: ((zoom: number) => void) | undefined;
};

const ProfileImageCropper: React.FunctionComponent<TProfileImageCropper> = ({
  crop,
  zoom,
  minZoom,
  maxZoom,
  avatarUrlInEdit,
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
      {avatarUrlInEdit && !isMobile ? (
        <DragToRepositionLabel
          text={t('dragToReposition')}
          isPressed={disabled ?? isPressed}
        />
      ) : null}
      {avatarUrlInEdit && (
        <Cropper
          image={avatarUrlInEdit}
          objectFit='auto-cover'
          crop={crop}
          cropSize={
            cropSize
              ? {
                  height: cropSize,
                  width: cropSize,
                }
              : undefined
          }
          cropShape='round'
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

export default ProfileImageCropper;

const SCropperWrapper = styled.div<{
  x: number;
  y: number;
  zoom: number;
  pseudoElementWidth: number;
}>`
  position: relative;
  height: 500px;
  width: 100%;

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
  }
`;
