/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import { Area, Point } from 'react-easy-crop/types';

import ProfileBackgroundCropper, {
  CropperObjectFit,
} from './ProfileBackgroundCropper';
import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';

import BinIcon from '../../../public/images/svg/icons/filled/Trash.svg';
import ImageIcon from '../../../public/images/svg/icons/filled/Image.svg';

interface IProfileBackgroundInput {
  originalPictureUrl?: string;
  pictureInEditUrl?: string;
  coverUrlInEditAnimated: boolean;
  crop: Point;
  zoom: number;
  initialObjectFit: CropperObjectFit;
  disabled: boolean;
  handleSetPictureInEdit: (files: FileList | null) => void;
  handleUnsetPictureInEdit: () => void;
  onCropChange: (location: Point) => void;
  onCropComplete:
    | ((croppedArea: Area, croppedAreaPixels: Area) => void)
    | undefined;
  onZoomChange: ((zoom: number) => void) | undefined;
}

const ProfileBackgroundInput: React.FunctionComponent<IProfileBackgroundInput> =
  ({
    originalPictureUrl,
    pictureInEditUrl,
    coverUrlInEditAnimated,
    zoom,
    crop,
    initialObjectFit,
    disabled,
    handleSetPictureInEdit,
    handleUnsetPictureInEdit,
    onCropChange,
    onCropComplete,
    onZoomChange,
  }) => {
    const theme = useTheme();
    const { t } = useTranslation('profile');

    const [mobileCropWidth, setMobileCropWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>();
    const inputRef = useRef<HTMLInputElement>(null);

    // Drag & Drop support
    const [dropZoneHighlighted, setDropZoneHighlighted] = useState(false);

    const handleOnDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setDropZoneHighlighted(true);
    };

    const handleOnDragLeave = () => {
      setDropZoneHighlighted(false);
    };

    const handleOnDrop = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();

      if (disabled) return;

      const { files } = e.dataTransfer;
      handleSetPictureInEdit(files);
    };

    useEffect(() => {
      const initialValue =
        containerRef.current?.getBoundingClientRect().width ?? 0;
      setMobileCropWidth(initialValue);

      const resetMobileCropWidth = () => {
        const newValue =
          containerRef.current?.getBoundingClientRect().width ?? 0;
        setMobileCropWidth(newValue);
      };

      window.addEventListener('resize', resetMobileCropWidth);

      return () => window.removeEventListener('resize', resetMobileCropWidth);
    }, []);

    return (
      <SProfileBackgroundInput
        ref={(el) => {
          containerRef.current = el!!;
        }}
      >
        {pictureInEditUrl ? (
          <>
            {originalPictureUrl === pictureInEditUrl ? (
              <SOriginalImgDiv pictureUrl={originalPictureUrl}>
                <img
                  src={originalPictureUrl}
                  alt='Profile cover'
                  draggable={false}
                />
              </SOriginalImgDiv>
            ) : !coverUrlInEditAnimated ? (
              <ProfileBackgroundCropper
                pictureUrlInEdit={pictureInEditUrl!!}
                crop={crop}
                zoom={zoom}
                initialObjectFit={initialObjectFit}
                mobileCropWidth={mobileCropWidth}
                disabled={disabled}
                onCropChange={disabled ? () => {} : onCropChange}
                onCropComplete={disabled ? () => {} : onCropComplete}
                onZoomChange={disabled ? () => {} : onZoomChange}
              />
            ) : (
              <SOriginalImgDiv pictureUrl={pictureInEditUrl!!}>
                <img
                  src={pictureInEditUrl!!}
                  alt='Profile cover'
                  draggable={false}
                />
              </SOriginalImgDiv>
            )}
            <SDeleteImgButton
              iconOnly
              size='sm'
              view='transparent'
              withDim
              withShrink
              disabled={disabled}
              onClick={() => {
                handleUnsetPictureInEdit();
              }}
            >
              <InlineSvg
                svg={BinIcon}
                width='20px'
                height='20px'
                fill='#FFFFFF'
              />
            </SDeleteImgButton>
          </>
        ) : (
          <SLabel
            onDragOver={(e) => handleOnDragOver(e)}
            onDragLeave={() => handleOnDragLeave()}
            onDrop={(e) => handleOnDrop(e)}
          >
            <SImageInput
              ref={inputRef}
              type='file'
              accept='image/*'
              multiple={false}
              disabled={disabled}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const { files } = e.target;
                handleSetPictureInEdit(files);

                if (inputRef.current) {
                  inputRef.current.value = '';
                }
              }}
            />
            <SChangeImageCaption
              style={{
                transform:
                  !disabled && dropZoneHighlighted ? 'scale(1.1)' : 'none',
              }}
            >
              <InlineSvg
                svg={ImageIcon}
                fill={theme.colorsThemed.text.secondary}
                width='24px'
                height='24px'
              />
              <div>
                {t('EditProfileMenu.inputs.coverImage.changeCoverImage')}
              </div>
            </SChangeImageCaption>
          </SLabel>
        )}
      </SProfileBackgroundInput>
    );
  };

ProfileBackgroundInput.defaultProps = {
  originalPictureUrl: undefined,
  pictureInEditUrl: undefined,
};

export default ProfileBackgroundInput;

interface ISProfileBackgroundInput {}

const SProfileBackgroundInput = styled.div<ISProfileBackgroundInput>`
  position: relative;
  overflow: hidden;

  width: 100%;
  height: 160px;
  margin-bottom: 62px;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  &:before {
    position: absolute;
    bottom: 0px;
    left: calc(50% - 48px - 35px);
    content: '';
    width: 30px;
    height: 30px;
    border-bottom-right-radius: 70%;
    box-shadow: 10px 15px 0px 0px
      ${({ theme }) => theme.colorsThemed.background.primary};

    background: transparent;
    z-index: 10;
  }

  &:after {
    position: absolute;
    bottom: 0px;
    left: calc(50% + 44px + 9px);
    content: '';
    width: 30px;
    height: 30px;
    border-bottom-left-radius: 70%;
    box-shadow: -10px 15px 0px 0px
      ${({ theme }) => theme.colorsThemed.background.primary};

    background: transparent;
    z-index: 10;
    /* transform: translateY(0px) translateZ(1px); */
  }

  ${(props) => props.theme.media.tablet} {
    border-radius: ${({ theme }) => theme.borderRadius.medium};
  }
`;

const SOriginalImgDiv = styled.div<{
  pictureUrl: string;
}>`
  position: relative;
  overflow: hidden;

  width: 100%;
  height: 100%;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    vertical-align: inherit;
  }
`;

const SLabel = styled.label`
  display: flex;
  justify-content: center;
  align-items: flex-start;

  width: 100%;
  height: 100%;

  cursor: pointer;
`;

const SImageInput = styled.input`
  display: none;
`;

const SDeleteImgButton = styled(Button)`
  position: absolute;

  right: 12px;
  bottom: 12px;

  padding: 8px;
  border-radius: 12px;

  z-index: 10;
`;

const SChangeImageCaption = styled.div`
  position: absolute;

  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;

  margin-top: 48px;

  font-weight: bold;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  transition: 0.2s linear;
`;
