import React, { useState } from 'react';
import Image from 'next/image';
import styled from 'styled-components';

import EditIcon from '../../../public/images/svg/icons/filled/Edit.svg';
import InlineSvg from '../../atoms/InlineSVG';

interface IProfileImageInput {
  publicUrl: string;
  handleImageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileImageInput: React.FunctionComponent<IProfileImageInput> = ({
  publicUrl,
  handleImageInputChange,
}) => {
  const [pressed, setPressed] = useState(false);

  return (
    <SProfileImageInput
      pressed={pressed}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      { publicUrl ? (
        <Image
          src={publicUrl}
          alt="User avatar"
          width="100%"
          height="100%"
          objectFit="cover"
          draggable={false}
        />
      ) : <div />}
      <SImageInput
        type="file"
        onChange={handleImageInputChange}
      />
      <SEditIcon
        svg={EditIcon}
        width="20px"
        height="20px"
      />
    </SProfileImageInput>
  );
};

export default ProfileImageInput;

const SProfileImageInput = styled.label<{
  pressed: boolean;
}>`
  position: absolute;
  left: calc(50% - 42px);
  top: 118px;
  overflow: hidden;

  display: block;

  z-index: 6;

  border-radius: 50%;
  width: 84px;
  height: 84px;

  cursor: pointer;
  transition: .2s ease-in-out;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  div {
    svg {
      transform: ${({ pressed }) => (!pressed ? 'initial' : 'scale(0.9)')};
      path {
        fill: ${({ theme, pressed }) => (!pressed ? '#FFFFFF' : theme.colorsThemed.text.secondary)};
      }

      transition: .2s ease-in-out;
    }
  }

  ${(props) => props.theme.media.tablet} {

  }

  ${(props) => props.theme.media.laptop} {

  }
`;

const SImageInput = styled.input`
  display: none;

`;

const SEditIcon = styled(InlineSvg)`
  position: absolute;
  top: calc(50% - 10px);
  left: calc(50% - 10px);
`;
