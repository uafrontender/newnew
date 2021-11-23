import React from 'react';
import Image from 'next/image';
import styled from 'styled-components';

interface IProfileImageInput {
  src: string;
}

const ProfileImageInput: React.FunctionComponent<IProfileImageInput> = ({
  src,
}) => (
  <SProfileImageInput>
    <Image
      src={src}
      alt="User avatar"
      width="100%"
      height="100%"
      objectFit="cover"
    />
  </SProfileImageInput>
);

export default ProfileImageInput;

const SProfileImageInput = styled.div`
  position: absolute;
  left: calc(50% - 42px);
  top: 118px;
  overflow: hidden;

  z-index: 6;

  border-radius: 50%;
  width: 84px;
  height: 84px;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  ${(props) => props.theme.media.tablet} {

  }

  ${(props) => props.theme.media.laptop} {

  }
`;
