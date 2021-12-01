import React from 'react';
import styled from 'styled-components';

interface IProfileImage {
  src: string;
}

const ProfileImage: React.FunctionComponent<IProfileImage> = ({
  src,
}) => (
  <SProfileImage>
    <img
      src={src}
      alt="User avatar"
      width="100%"
      height="100%"
      draggable={false}
    />
  </SProfileImage>
);

export default ProfileImage;

const SProfileImage = styled.div`
  position: absolute;
  left: calc(50% - 48px);
  top: 112px;
  overflow: hidden;

  z-index: 5;

  border-radius: 50%;

  box-shadow: 0px 0px 0px 16px ${({ theme }) => theme.colorsThemed.grayscale.background2};
  background: ${({ theme }) => theme.colorsThemed.grayscale.background2};

  width: 96px;
  height: 96px;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;


  ${(props) => props.theme.media.tablet} {
    top: 152px;
  }

  ${(props) => props.theme.media.laptop} {
    top: 192px;
  }
`;
