import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { Area, Point } from 'react-easy-crop';

import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';
import Headline from '../../atoms/Headline';
import CoverImageUpload from './CoverImageUpload';
import CoverImageZoomSlider from '../../atoms/profile/ProfileImageZoomSlider';

import CoverImageCropper from './CoverImageCropper';
import getCroppedImg from '../../../utils/cropImage';

// Icons
import ZoomOutIcon from '../../../public/images/svg/icons/outlined/Minus.svg';
import ZoomInIcon from '../../../public/images/svg/icons/outlined/Plus.svg';
import chevronLeft from '../../../public/images/svg/icons/outlined/ChevronLeft.svg';
import { useAppState } from '../../../contexts/appStateContext';
import { usePostCreationState } from '../../../contexts/postCreationContext';

interface ICoverImagePreviewEdit {
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

const CoverImagePreviewEdit: React.FunctionComponent<
  ICoverImagePreviewEdit
> = ({ open, handleClose, handleSubmit }) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Creation');

  const { postInCreation, setCustomCoverImageUrl, unsetCustomCoverImageUrl } =
    usePostCreationState();
  const { customCoverImageUrl } = useMemo(
    () => postInCreation,
    [postInCreation]
  );

  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM'].includes(resizeMode);

  const preventCLick = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Image to be saved
  const [coverImageToBeSaved, setCoverImageToBeSaved] = useState(
    customCoverImageUrl ?? ''
  );
  const [wasDeleted, setWasDeleted] = useState(false);
  const handleDeleteCoverImage = useCallback(() => {
    setCoverImageToBeSaved('');
    setWasDeleted(true);
  }, []);

  // Edit picture
  const [coverImageInEdit, setCoverImageInEdit] = useState('');
  const [originalCoverImageWidth, setOriginalCoverImageWidth] = useState(0);
  const [cropCoverImage, setCropCoverImage] = useState<Point>({
    x: 0,
    y: 0,
  });
  const [croppedAreaCoverImage, setCroppedAreaCoverImage] = useState<Area>();
  const [zoomCoverImage, setZoomCoverImage] = useState(1);
  const [minZoomCoverImage, setMinZoomCoverImage] = useState(1);
  const [updateCoverImageLoading, setUpdateCoverImageLoading] = useState(false);

  const hasChanged = useMemo(
    () => customCoverImageUrl !== coverImageToBeSaved,
    [coverImageToBeSaved, customCoverImageUrl]
  );

  const onFileChange = useCallback(
    (newImageUrl: string, originalImageWidth: number, minZoom: number) => {
      setMinZoomCoverImage(minZoom);
      setCoverImageInEdit(newImageUrl);
      setOriginalCoverImageWidth(originalImageWidth);
    },
    []
  );

  const handleZoomOutCoverImage = () => {
    if (zoomCoverImage <= 1) return;

    setZoomCoverImage((z) => {
      if (zoomCoverImage - 0.2 <= 1) return 1;
      return z - 0.2;
    });
  };

  const handleZoomInCoverImage = () => {
    if (zoomCoverImage >= 3) return;

    setZoomCoverImage((z) => {
      if (zoomCoverImage + 0.2 >= 3) return 3;
      return z + 0.2;
    });
  };

  const onCropCompleteCoverImage = useCallback(
    (_: any, croppedAreaPixels: Area) => {
      setCroppedAreaCoverImage(croppedAreaPixels);
    },
    []
  );

  const completeCoverImageCropAndSave = useCallback(async () => {
    setUpdateCoverImageLoading(true);
    try {
      const croppedImage = await getCroppedImg(
        coverImageInEdit,
        croppedAreaCoverImage!!,
        0,
        'postCoverImage.jpeg'
      );

      const newImageUrl = URL.createObjectURL(croppedImage);

      setCustomCoverImageUrl(newImageUrl);
      setCoverImageInEdit('');
    } catch (e) {
      console.error(e);
    } finally {
      setUpdateCoverImageLoading(false);
    }
  }, [coverImageInEdit, croppedAreaCoverImage, setCustomCoverImageUrl]);

  const onSubmit = useCallback(async () => {
    if (coverImageToBeSaved) {
      await completeCoverImageCropAndSave();
    } else {
      unsetCustomCoverImageUrl();
    }
    handleSubmit();
  }, [
    completeCoverImageCropAndSave,
    coverImageToBeSaved,
    handleSubmit,
    unsetCustomCoverImageUrl,
  ]);

  useEffect(() => {
    if (coverImageInEdit) {
      setCoverImageToBeSaved(coverImageInEdit);
    }
  }, [coverImageInEdit]);

  return (
    <Modal show={open} onClose={handleClose}>
      <SContainer onClick={preventCLick}>
        <SModalTopContent>
          <SModalTopLine>
            {isMobile && (
              <InlineSVG
                clickable
                svg={chevronLeft}
                fill={theme.colorsThemed.text.primary}
                width='20px'
                height='20px'
                onClick={handleClose}
              />
            )}
            {isMobile ? (
              <SModalTopLineTitle variant={3} weight={600}>
                {t('secondStep.video.coverImage.title')}
              </SModalTopLineTitle>
            ) : (
              <SModalTopLineTitleTablet variant={6}>
                {t('secondStep.video.coverImage.title')}
              </SModalTopLineTitleTablet>
            )}
          </SModalTopLine>
          {coverImageInEdit ? (
            <CoverImageContent>
              <CoverImageCropper
                crop={cropCoverImage}
                zoom={zoomCoverImage}
                minZoom={minZoomCoverImage}
                maxZoom={minZoomCoverImage + 2}
                coverImageInEdit={coverImageInEdit}
                originalImageWidth={originalCoverImageWidth}
                disabled={updateCoverImageLoading}
                onCropChange={setCropCoverImage}
                onCropComplete={onCropCompleteCoverImage}
                onZoomChange={setZoomCoverImage}
              />
              <SSliderWrapper>
                <Button
                  iconOnly
                  size='sm'
                  view='transparent'
                  disabled={zoomCoverImage <= 1 || updateCoverImageLoading}
                  onClick={handleZoomOutCoverImage}
                >
                  <InlineSVG
                    svg={ZoomOutIcon}
                    fill={theme.colorsThemed.text.primary}
                    width='24px'
                    height='24px'
                  />
                </Button>
                <CoverImageZoomSlider
                  value={zoomCoverImage}
                  min={1}
                  max={3}
                  step={0.1}
                  ariaLabel='Zoom'
                  disabled={updateCoverImageLoading}
                  onChange={(e) => setZoomCoverImage(Number(e.target.value))}
                />
                <Button
                  iconOnly
                  size='sm'
                  view='transparent'
                  disabled={zoomCoverImage >= 3 || updateCoverImageLoading}
                  onClick={handleZoomInCoverImage}
                >
                  <InlineSVG
                    svg={ZoomInIcon}
                    fill={theme.colorsThemed.text.primary}
                    width='24px'
                    height='24px'
                  />
                </Button>
              </SSliderWrapper>
            </CoverImageContent>
          ) : (
            <CoverImageUpload
              coverImageToBeSaved={coverImageToBeSaved}
              onFileChange={onFileChange}
              handleDeleteFile={handleDeleteCoverImage}
            />
          )}
        </SModalTopContent>
        {isMobile ? (
          <SModalButtonContainer>
            <Button view='primaryGrad' onClick={onSubmit}>
              {t('secondStep.video.coverImage.submit')}
            </Button>
          </SModalButtonContainer>
        ) : (
          <SButtonsWrapper>
            <Button view='secondary' onClick={handleClose}>
              {t('secondStep.button.cancel')}
            </Button>
            <Button
              view='primaryGrad'
              disabled={!hasChanged || (!wasDeleted && !coverImageToBeSaved)}
              onClick={onSubmit}
            >
              {t('secondStep.video.coverImage.submit')}
            </Button>
          </SButtonsWrapper>
        )}
      </SContainer>
    </Modal>
  );
};

export default CoverImagePreviewEdit;

const SContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 18px;
  position: relative;
  min-height: 100%;
  background: ${(props) => props.theme.colorsThemed.background.primary};

  max-height: calc(100vh - 64px);
  overflow-y: auto;
  /* Hide scrollbar */
  ::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;

  ${({ theme }) => theme.media.mobileL} {
    top: 50%;
    height: unset;
    margin: 0 auto;
    overflow-x: hidden;
    max-width: 464px;
    transform: translateY(-50%);
    min-height: unset;
    background: ${(props) => props.theme.colorsThemed.background.secondary};
    border-radius: 16px;

    max-height: calc(100vh - 64px);
    overflow-y: auto;
    /* Hide scrollbar */
    ::-webkit-scrollbar {
      display: none;
    }
    scrollbar-width: none;
    -ms-overflow-style: none;
    border-radius: 16px;
  }

  ${({ theme }) => theme.media.tablet} {
    padding: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
    max-width: 480px;
  }
`;

const SModalTopLine = styled.div`
  display: flex;
  padding: 18px 0;
  align-items: center;
  margin-bottom: 16px;

  ${({ theme }) => theme.media.mobileL} {
    padding: 10px 0;
    margin-bottom: 24px;
    justify-content: flex-start;
  }
`;

const SModalTopLineTitleTablet = styled(Headline)`
  margin: 0 auto;
  color: ${(props) => props.theme.colorsThemed.text.primary};

  ${({ theme }) => theme.media.mobileL} {
    margin: initial;
  }
`;

const SModalTopLineTitle = styled(Text)`
  margin: 0 auto;
  color: ${(props) => props.theme.colorsThemed.text.primary};
  margin-left: 8px;
`;

const SModalTopContent = styled.div``;

const SModalButtonContainer = styled.div`
  margin-top: 56px;

  button {
    width: 100%;
    padding: 16px 20px;
  }
`;

const SButtonsWrapper = styled.div`
  display: flex;
  margin-top: 30px;
  align-items: center;
  justify-content: space-between;
`;

// Cover image cropper
const CoverImageContent = styled.div`
  overflow-y: auto;
  padding: 0 20px;
`;

const SSliderWrapper = styled.div`
  display: none;

  ${({ theme }) => theme.media.tablet} {
    display: flex;
    flex-direction: row;
    justify-content: center;

    margin-top: 24px;
    padding: 0px 24px;

    button {
      background: transparent;

      &:hover:enabled {
        background: transparent;
        cursor: pointer;
      }
      &:focus:enabled {
        background: transparent;
        cursor: pointer;
      }
    }

    input {
      margin: 0px 12px;
    }
  }
`;
