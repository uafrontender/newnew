import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import Cropper from 'react-easy-crop';
import { Area, Point } from 'react-easy-crop/types';

// Redux
import { useAppSelector } from '../../../redux-store/store';
import DragToRepositionLabel from './DragToRepositionLabel';

export type CropperObjectFit = 'horizontal-cover' | 'contain' | 'vertical-cover'

type TProfileBackgroundCropper = {
  crop: Point;
  zoom: number;
  pictureUrlInEdit: string;
  initialObjectFit: CropperObjectFit;
  mobileCropWidth: number;
  disabled: boolean;
  onCropChange: (location: Point) => void;
  onCropComplete: ((croppedArea: Area, croppedAreaPixels: Area) => void) | undefined;
  onZoomChange: ((zoom: number) => void) | undefined;
}

const ProfileBackgroundCropper: React.FunctionComponent<TProfileBackgroundCropper> = ({
  zoom,
  crop,
  pictureUrlInEdit,
  initialObjectFit,
  mobileCropWidth,
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
      onMouseDown={() => handleSetPressed()}
      onMouseUp={() => handleSetUnpressed()}
      onMouseLeave={() => handleSetUnpressed()}
      onTouchStart={() => handleSetPressed()}
      onTouchEnd={() => handleSetUnpressed()}
      onTouchCancel={() => handleSetUnpressed()}
    >
      <DragToRepositionLabel
        text={t('EditProfileMenu.dragToReposition')}
        top="40px"
        customZ={1}
        isPressed={disabled ?? isPressed}
      />
      {pictureUrlInEdit && (
        <Cropper
          image={pictureUrlInEdit}
          // objectFit="horizontal-cover"
          objectFit={initialObjectFit}
          crop={crop}
          cropSize={{
            height: 160,
            width: isMobile ? mobileCropWidth : 432,
          }}
          cropShape="rect"
          showGrid={false}
          zoom={zoom}
          aspect={1}
          classes={{
            containerClassName: 'cropper-container',
            mediaClassName: 'cropper-media',
            cropAreaClassName: 'cropper-cropArea',
          }}
          onCropChange={onCropChange}
          onCropComplete={onCropComplete}
          onZoomChange={onZoomChange}
        />
      )}
    </SCropperWrapper>
  );
};

export default ProfileBackgroundCropper;

const SCropperWrapper = styled.div`
  position: relative;
  height: 160px;

  .cropper-container {

  }

  .cropper-cropArea {
    border: transparent;

    color: ${({ theme }) => theme.colors.dark};
    opacity: 0.45;

    z-index: 2;
  }
`;
