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
  avatarUrlInEdit: string;
  originalImageWidth: number;
  disabled: boolean;
  onCropChange: (location: Point) => void;
  onCropComplete: ((croppedArea: Area, croppedAreaPixels: Area) => void) | undefined;
  onZoomChange: ((zoom: number) => void) | undefined;
}

const ProfileImageCropper: React.FunctionComponent<TProfileImageCropper> = ({
  zoom,
  crop,
  avatarUrlInEdit,
  originalImageWidth,
  disabled,
  onCropChange,
  onCropComplete,
  onZoomChange,
}) => {
  const { t } = useTranslation('profile');
  const { ui } = useAppSelector((state) => state);
  const isMobile = ['mobile', 'mobileS', 'mobileM', 'mobileL'].includes(ui.resizeMode);
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
          text={t('EditProfileMenu.dragToReposition')}
          isPressed={disabled ?? isPressed}
        />
      ) : null}
      {avatarUrlInEdit && (
        <Cropper
          image={avatarUrlInEdit}
          objectFit={isMobile ? 'horizontal-cover' : 'vertical-cover'}
          crop={crop}
          cropSize={{
            height: isMobile ? 375 : 280,
            width: isMobile ? 375 : 280,
          }}
          cropShape="round"
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

export default ProfileImageCropper;

const SCropperWrapper = styled.div<{
  x: number,
  y: number,
  zoom: number,
  pseudoElementWidth: number,
}>`
  position: relative;
  height: 500px;

  ${({ theme }) => theme.media.tablet} {
    height: 420px;
  }

  .cropper-container {

    &:before {
      content: '';
      position: absolute;

      width: ${({ pseudoElementWidth }) => `${pseudoElementWidth}px`};
      height: 100%;

      z-index: 12;

      ${({ theme }) => theme.media.tablet} {
        transform: ${({ x, y, zoom }) => `translate(${x}px, ${y}px) scale(${zoom})`};
        box-shadow: 0 0 0 9999em;
        color: ${({ theme }) => theme.colorsThemed.background.primary};
      }
    }

  }

  .cropper-cropArea {
    border: transparent;

    color: ${({ theme }) => theme.colors.dark};
    opacity: 0.45;

  }
`;
