import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';
import { Area, Point } from 'react-easy-crop';
import { newnewapi } from 'newnew-api';
import { toast } from 'react-toastify';

import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';
import Headline from '../../atoms/Headline';
import CoverImageEdit from './CoverImageEdit';
import CoverImageZoomSlider from '../../atoms/profile/ProfileImageZoomSlider';

import { useAppSelector } from '../../../redux-store/store';
import CoverImageCropper from '../creation/CoverImageCropper';
import getCroppedImg from '../../../utils/cropImage';

// Icons
import ZoomOutIcon from '../../../public/images/svg/icons/outlined/Minus.svg';
import ZoomInIcon from '../../../public/images/svg/icons/outlined/Plus.svg';
import chevronLeft from '../../../public/images/svg/icons/outlined/ChevronLeft.svg';

import { setPostCoverImage } from '../../../api/endpoints/post';
import { getCoverImageUploadUrl } from '../../../api/endpoints/upload';

interface IPostVideoCoverImageEdit {
  open: boolean;
  postId: string;
  originalCoverUrl?: string;
  handleClose: () => void;
  handleSubmit: (newCoverUrl: string | undefined) => void;
}

const PostVideoCoverImageEdit: React.FunctionComponent<
  IPostVideoCoverImageEdit
> = ({ open, postId, originalCoverUrl, handleClose, handleSubmit }) => {
  const theme = useTheme();
  const { t } = useTranslation('modal-Post');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM'].includes(resizeMode);

  const preventCLick = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Image to be saved
  const [coverImageToBeSaved, setCoverImageToBeSaved] = useState(
    originalCoverUrl ?? ''
  );
  const handleDeleteCoverImage = useCallback(() => {
    setCoverImageToBeSaved('');
    setWasDeleted(true);
  }, []);

  const [wasDeleted, setWasDeleted] = useState(false);

  // Edit picture
  const [coverImageInEdit, setCoverImageInEdit] = useState('');
  const [originalCoverImageWidth, setOriginalCoverImageWidth] = useState(0);
  const [cropCoverImage, setCropCoverImage] = useState<Point>({
    x: 0,
    y: 0,
  });
  const [croppedAreaCoverImage, setCroppedAreaCoverImage] = useState<Area>();
  const [zoomCoverImage, setZoomCoverImage] = useState(1);
  const [updateCoverImageLoading, setUpdateCoverImageLoading] = useState(false);

  const hasChanged = useMemo(
    () => originalCoverUrl !== coverImageToBeSaved,
    [coverImageToBeSaved, originalCoverUrl]
  );

  const onFileChange = useCallback(
    (newImageUrl: string, originalImageWidth: number) => {
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

  const handleSubmitNewCoverImage = async () => {
    setUpdateCoverImageLoading(true);
    try {
      if (coverImageToBeSaved) {
        const coverImageFile = await getCroppedImg(
          coverImageInEdit,
          croppedAreaCoverImage!!,
          0,
          'postCoverImage.jpeg'
        );

        const imageUrlPayload = new newnewapi.GetCoverImageUploadUrlRequest({
          postUuid: postId,
        });

        const res = await getCoverImageUploadUrl(imageUrlPayload);

        if (!res.data || res.error)
          throw new Error(res.error?.message ?? 'An error occured');

        const uploadResponse = await fetch(res.data.uploadUrl, {
          method: 'PUT',
          body: coverImageFile,
          headers: {
            'Content-Type': 'image/jpeg',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload failed');
        }

        const updateCoverImagePayload = new newnewapi.SetPostCoverImageRequest({
          postUuid: postId,
          action: newnewapi.SetPostCoverImageRequest.Action.COVER_UPLOADED,
        });

        const updateCoverImageRes = await setPostCoverImage(
          updateCoverImagePayload
        );

        if (updateCoverImageRes.error) {
          throw new Error('Could not update cover image');
        }

        handleSubmit(URL.createObjectURL(coverImageFile));
      } else if (!coverImageToBeSaved) {
        const updateCoverImagePayload = new newnewapi.SetPostCoverImageRequest({
          postUuid: postId,
          action: newnewapi.SetPostCoverImageRequest.Action.DELETE_COVER,
        });

        const updateCoverImageRes = await setPostCoverImage(
          updateCoverImagePayload
        );

        if (updateCoverImageRes.error) {
          throw new Error('Could not delete cover image');
        }

        handleSubmit(undefined);
      }
    } catch (err) {
      console.error(err);
      toast.error('toastErrors.generic');
    } finally {
      setUpdateCoverImageLoading(false);
    }
  };

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
                {t('postVideoCoverImageEdit.title')}
              </SModalTopLineTitle>
            ) : (
              <SModalTopLineTitleTablet variant={6}>
                {t('postVideoCoverImageEdit.title')}
              </SModalTopLineTitleTablet>
            )}
          </SModalTopLine>
          {coverImageInEdit ? (
            <CoverImageContent>
              <CoverImageCropper
                crop={cropCoverImage}
                zoom={zoomCoverImage}
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
            <CoverImageEdit
              customCoverImageUrl={coverImageToBeSaved}
              handleSetCustomCoverImageUrl={onFileChange}
              handleUnsetCustomCoverImageUrl={handleDeleteCoverImage}
            />
          )}
        </SModalTopContent>
        {isMobile ? (
          <SModalButtonContainer>
            <Button
              view='primaryGrad'
              loading={updateCoverImageLoading}
              disabled={
                !hasChanged ||
                updateCoverImageLoading ||
                (!wasDeleted && !coverImageToBeSaved)
              }
              onClick={handleSubmitNewCoverImage}
            >
              {t('postVideoCoverImageEdit.submit')}
            </Button>
          </SModalButtonContainer>
        ) : (
          <SButtonsWrapper>
            <Button
              view='secondary'
              disabled={updateCoverImageLoading}
              onClick={handleClose}
            >
              {t('postVideoCoverImageEdit.cancel')}
            </Button>
            <Button
              view='primaryGrad'
              loading={updateCoverImageLoading}
              disabled={
                !hasChanged ||
                updateCoverImageLoading ||
                (!wasDeleted && !coverImageToBeSaved)
              }
              onClick={handleSubmitNewCoverImage}
            >
              {t('postVideoCoverImageEdit.submit')}
            </Button>
          </SButtonsWrapper>
        )}
      </SContainer>
    </Modal>
  );
};

export default PostVideoCoverImageEdit;

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
