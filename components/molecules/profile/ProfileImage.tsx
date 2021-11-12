import React from 'react';
import Image from 'next/image';
import styled from 'styled-components';

interface IProfileImage {
  src: string;
}

const ProfileImage: React.FunctionComponent<IProfileImage> = ({
  src,
}) => (
  <SProfileImage>
    <Image
      src={src}
      alt="User avatar"
      width="100%"
      height="100%"
      objectFit="cover"
    />
  </SProfileImage>
);

export default ProfileImage;

const SProfileImage = styled.div`
  position: absolute;
  left: calc(50% - 48px);
  top: 112px;
  overflow: hidden;

  z-index: 1;

  border-radius: 50%;
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
