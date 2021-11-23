/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

interface IProfileBackgroundInput {
  pictureURL?: string;
}

const ProfileBackgroundInput: React.FunctionComponent<IProfileBackgroundInput> = ({
  pictureURL,
}) => {
  const { t } = useTranslation('profile');

  return (
    <SProfileBackgroundInput>
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
      {pictureURL ? (
        <img
          alt="Profile background"
          src={pictureURL}
        />
      ) : null}
    </SProfileBackgroundInput>
  );
};

ProfileBackgroundInput.defaultProps = {
  pictureURL: undefined,
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
