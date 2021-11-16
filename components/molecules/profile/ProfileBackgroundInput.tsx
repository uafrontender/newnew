import React from 'react';
import styled from 'styled-components';

interface IProfileBackgroundInput {
  pictureURL: string;
}

const ProfileBackgroundInput: React.FunctionComponent<IProfileBackgroundInput> = ({
  pictureURL,
}) => (
  <SProfileBackgroundInput
    pictureURL={pictureURL}
  >
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
  </SProfileBackgroundInput>
);

export default ProfileBackgroundInput;

interface ISProfileBackgroundInput {
  pictureURL: string;
}

const SProfileBackgroundInput = styled.div<ISProfileBackgroundInput>`
  position: relative;
  overflow: hidden;

  width: 100%;
  height: 160px;
  margin-bottom: 72px;

  background-image: ${({ pictureURL }) => `url('${pictureURL}')`};
  background-position: center;

  #profileBackgroundInputSvg{
    position: absolute;
    z-index: -10;
    width: 0px;
    height: 0px;
  }

  &:before {
    display: block;
    content: '';

    z-index: 2;

    position: absolute;
    bottom: 0px;
    left: 0px;
    left: calc(50% - 188px);

    transform: translateY(1px);

    background-color: ${({ theme }) => theme.colorsThemed.grayscale.background2};

    width: 376px;
    height: 160px;

    clip-path: url(#profileBackgroundInputSvgClipPath);
  }

  ${(props) => props.theme.media.tablet} {
    height: 200px;
  }

  ${(props) => props.theme.media.laptop} {
    height: 240px;
  }
`;
