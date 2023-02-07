import React, { useRef } from 'react';
import styled from 'styled-components';

import EditIcon from '../../../public/images/svg/icons/filled/Edit.svg';
import { Mixpanel } from '../../../utils/mixpanel';
import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';

interface IProfileImageInput {
  publicUrl: string;
  disabled: boolean;
  handleImageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileImageInput: React.FunctionComponent<IProfileImageInput> = ({
  publicUrl,
  disabled,
  handleImageInputChange,
}) => {
  const imageInputRef = useRef<HTMLInputElement>();

  return (
    <SProfileImageInput>
      {publicUrl ? (
        <img
          src={publicUrl}
          alt='User avatar'
          width='100%'
          height='100%'
          draggable={false}
        />
      ) : (
        <div />
      )}
      <SImageInput
        type='file'
        accept='image/*'
        multiple={false}
        disabled={disabled}
        ref={(el) => {
          imageInputRef.current = el!!;
        }}
        onChange={(e) => {
          handleImageInputChange(e);
          if (imageInputRef.current) {
            imageInputRef.current.value = '';
          }
        }}
      />
      <SEditButton
        iconOnly
        withDim
        withShrink
        view='transparent'
        disabled={disabled}
        onClick={() => imageInputRef.current?.click()}
        onClickCapture={() => {
          Mixpanel.track('Click Edit Profile Image Button', {
            _stage: 'MyProfile',
            _component: 'MyProfileLayout',
          });
        }}
      >
        <InlineSvg svg={EditIcon} width='20px' height='20px' />
      </SEditButton>
    </SProfileImageInput>
  );
};

export default ProfileImageInput;

const SProfileImageInput = styled.label`
  position: absolute;
  left: calc(50% - 42px);
  top: 118px;
  overflow: hidden;

  display: block;

  z-index: 6;

  border-radius: 50%;
  box-shadow: 0px 0px 0px 14px
    ${({ theme }) => theme.colorsThemed.background.primary};
  background: ${({ theme }) => theme.colorsThemed.background.primary};

  width: 84px;
  height: 84px;

  cursor: pointer;
  transition: 0.2s ease-in-out;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const SImageInput = styled.input`
  display: none;
`;

const SEditButton = styled(Button)`
  position: absolute;
  top: calc(50% - 18px);
  left: calc(50% - 18px);

  padding: 8px;
  border-radius: 12px;
  background: rgba(11, 10, 19, 0.6);

  &:active:enabled {
    svg {
      path {
        fill: ${({ theme }) => theme.colors.dark};
      }
    }
  }
`;
