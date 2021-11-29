/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { Area, Point } from 'react-easy-crop/types';

import ProfileBackgroundCropper from './ProfileBackgroundCropper';
import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';

import BinIcon from '../../../public/images/svg/icons/filled/Trash.svg';

interface IProfileBackgroundInput {
  originalPictureUrl?: string;
  pictureInEditUrl?: string;
  crop: Point;
  zoom: number;
  originalImageWidth: number;
  handleSetPictureInEdit: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUnsetPictureInEdit: () => void;
  onCropChange: (location: Point) => void;
  onCropComplete: ((croppedArea: Area, croppedAreaPixels: Area) => void) | undefined;
  onZoomChange: ((zoom: number) => void) | undefined;
}

const ProfileBackgroundInput: React.FunctionComponent<IProfileBackgroundInput> = ({
  originalPictureUrl,
  pictureInEditUrl,
  zoom,
  crop,
  originalImageWidth,
  handleSetPictureInEdit,
  handleUnsetPictureInEdit,
  onCropChange,
  onCropComplete,
  onZoomChange,
}) => {
  const { t } = useTranslation('profile');

  const [mobileCropWidth, setMobileCropWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const resetMobileCropWidth = () => {
      const newValue = containerRef.current?.getBoundingClientRect().width ?? 0;
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
      <SFrame>
        <svg
          id="profileBackgroundInputSvg"
        >
          <clipPath
            id="profileBackgroundInputSvgClipPath"
          >
            <path
              d="M 188 96 C 158.12 96 133.02261 116.47611 125.97461 144.16211 C 124.03137 151.79512 118.28764 158.38873 110.80469 159.73438 L 265.19531 159.73438 C 257.71289 158.38873 251.96863 151.79512 250.02539 144.16211 C 242.97739 116.47611 217.88 96 188 96 z "
            />
          </clipPath>
        </svg>
      </SFrame>
      {pictureInEditUrl ? (
        originalPictureUrl === pictureInEditUrl ? (
          <>
            <SOriginalImgDiv
              pictureUrl={originalPictureUrl}
            />
            <SDeleteImgButton
              iconOnly
              onClick={() => {
                handleUnsetPictureInEdit();
              }}
            >
              <InlineSvg
                svg={BinIcon}
                width="20px"
                height="20px"
                fill="#FFFFFF"
              />
            </SDeleteImgButton>
          </>
        ) : (
          <ProfileBackgroundCropper
            pictureUrlInEdit={pictureInEditUrl!!}
            crop={crop}
            zoom={zoom}
            originalImageWidth={originalImageWidth}
            mobileCropWidth={mobileCropWidth}
            onCropChange={onCropChange}
            onCropComplete={onCropComplete}
            onZoomChange={onZoomChange}
          />
        )
      ) : (
        <SLabel>
          <SImageInput
            type="file"
            onChange={handleSetPictureInEdit}
          />
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

interface ISProfileBackgroundInput {

}

const SProfileBackgroundInput = styled.div<ISProfileBackgroundInput>`
  position: relative;
  overflow: hidden;

  width: 100%;
  height: 160px;
  margin-bottom: 62px;

  background-color: ${({ theme }) => theme.colorsThemed.grayscale.background2};



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

  background-image: ${({ pictureUrl }) => `url('${pictureUrl}')`};
  background-position: center;

`;

const SFrame = styled.div`
  z-index: 5;

  position: absolute;
  bottom: 0px;
  left: 0px;
  transform: translateY(10px) translateX(calc(50vw - 188px)) scale(0.9);

  background-color: ${({ theme }) => theme.colorsThemed.grayscale.background1};

  width: 376px;
  height: 160px;

  clip-path: url(#profileBackgroundInputSvgClipPath);

  #profileBackgroundInputSvg {
    width: 100%;
    height: 100%;
  }

  ${(props) => props.theme.media.tablet} {
    transform: scale(0.9) translateY(10px) translateX(calc(211px - 188px));
  }
`;

const SLabel = styled.label`
  display: block;
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
`;
