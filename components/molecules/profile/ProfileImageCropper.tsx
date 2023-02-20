import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import Cropper from 'react-easy-crop';
import { Area, Point } from 'react-easy-crop/types';

// Redux
import { useAppSelector } from '../../../redux-store/store';
import DragToRepositionLabel from './DragToRepositionLabel';

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
  const { ui } = useAppSelector((state) => state);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(
    ui.resizeMode
  );
  const [isPressed, setIsPressed] = useState(false);

  const handleSetPressed = () => setIsPressed(true);
  const handleSetUnpressed = () => setIsPressed(false);

  return (
    <SCropperWrapper
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
            isMobile
              ? undefined
              : {
                  height: 420,
                  width: 420,
                }
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

  ${({ theme }) => theme.media.tablet} {
    height: 420px;
    width: 420px;
    z-index: 0;
  }

  .cropper-cropArea {
    border: transparent;

    color: ${({ theme }) => theme.colors.dark};
    opacity: 0.45;
  }
`;
