import React, { useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Button from '../../atoms/Button';
import InlineSvg from '../../atoms/InlineSVG';
import TrashIcon from '../../../public/images/svg/icons/filled/Trash.svg';
import ImageIcon from '../../../public/images/svg/icons/filled/Image.svg';
import { Mixpanel } from '../../../utils/mixpanel';

interface IProfileCoverImage {
  pictureInEditUrl?: string;
  disabled: boolean;
  handleSetPictureInEdit: (files: FileList | null) => void;
  handleUnsetPictureInEdit: () => void;
}

const ProfileCoverImage: React.FunctionComponent<IProfileCoverImage> = ({
  pictureInEditUrl,
  disabled,
  handleSetPictureInEdit,
  handleUnsetPictureInEdit,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Profile');

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

    if (disabled) {
      return;
    }

    const { files } = e.dataTransfer;
    handleSetPictureInEdit(files);
  };

  return (
    <SProfileCoverImageContainer
      ref={(el) => {
        containerRef.current = el!!;
      }}
    >
      {pictureInEditUrl ? (
        <>
          <SOriginalImgDiv>
            <img src={pictureInEditUrl} alt='Profile cover' draggable={false} />
          </SOriginalImgDiv>
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
            onClickCapture={() => {
              Mixpanel.track('Click Clear Current Cover Image Button', {
                _stage: 'MyProfile',
                _component: 'ProfileCoverImage',
              });
            }}
          >
            <InlineSvg
              svg={TrashIcon}
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
              Mixpanel.track('Add New Cover Image', {
                _stage: 'MyProfile',
                _component: 'ProfileCoverImage',
              });
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
            <div>{t('editProfileMenu.inputs.coverImage.changeCoverImage')}</div>
          </SChangeImageCaption>
        </SLabel>
      )}
    </SProfileCoverImageContainer>
  );
};

ProfileCoverImage.defaultProps = {
  pictureInEditUrl: undefined,
};

export default ProfileCoverImage;

const SProfileCoverImageContainer = styled.div`
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

const SOriginalImgDiv = styled.div`
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
