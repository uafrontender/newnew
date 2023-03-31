import React from 'react';
import dynamic from 'next/dynamic';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Modal from '../../../organisms/Modal';
import Button from '../../../atoms/Button';
import Headline from '../../../atoms/Headline';
import InlineSVG from '../../../atoms/InlineSVG';

import chevronLeft from '../../../../public/images/svg/icons/outlined/ChevronLeft.svg';

import { useAppState } from '../../../../contexts/appStateContext';

const VideojsPlayer = dynamic(() => import('../../../atoms/VideojsPlayer'), {
  ssr: false,
});

interface IPostVideoResponsePreviewModal {
  open: boolean;
  value: newnewapi.IVideoUrls;
  handleClose: () => void;
  handleConfirm: () => void;
}

export const PostVideoResponsePreviewModal: React.FC<
  IPostVideoResponsePreviewModal
> = ({ open, value, handleClose, handleConfirm }) => {
  const theme = useTheme();
  const { t } = useTranslation('page-Post');
  const { resizeMode } = useAppState();
  const isMobile = ['mobile', 'mobileS', 'mobileM'].includes(resizeMode);

  const preventCLick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Modal show={open} additionalz={15} onClose={handleClose}>
      <SMobileContainer onClick={preventCLick}>
        {!isMobile && (
          <SModalTopLine>
            <SModalTopLineTitleTablet variant={6}>
              {t('postVideo.uploadResponseForm.video.full.title')}
            </SModalTopLineTitleTablet>
          </SModalTopLine>
        )}
        <SModalVideoWrapper>
          {open && (
            <VideojsPlayer
              withMuteControl
              id='full-preview'
              resources={value}
              borderRadius={isMobile ? '0' : '16px'}
            />
          )}
        </SModalVideoWrapper>
        <SControlsContainer>
          {!isMobile && (
            <SCancelButton view='modalSecondary' onClick={handleClose}>
              {t('postVideo.uploadResponseForm.video.full.cancelButton')}
            </SCancelButton>
          )}
          <SPublishButton view='primaryGrad' onClick={handleConfirm}>
            {t('postVideo.uploadResponseForm.video.full.publishButton')}
          </SPublishButton>
        </SControlsContainer>
        {isMobile && (
          <SModalCloseIcon>
            <Button iconOnly view='transparent' onClick={handleClose}>
              <InlineSVG
                svg={chevronLeft}
                fill={theme.colors.white}
                width='20px'
                height='20px'
              />
            </Button>
          </SModalCloseIcon>
        )}
      </SMobileContainer>
    </Modal>
  );
};

export default PostVideoResponsePreviewModal;

const SMobileContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  min-height: 100vh;

  ${({ theme }) => theme.media.mobileL} {
    top: 50%;
    height: unset;
    margin: 0 auto;
    overflow: hidden;
    max-width: 464px;
    transform: translateY(-50%);
    min-height: unset;
    background: ${(props) => props.theme.colorsThemed.background.secondary};
    border-radius: 16px;
  }

  ${({ theme }) => theme.media.tablet} {
    padding: 24px;
  }

  ${({ theme }) => theme.media.laptop} {
    max-width: 480px;
  }
`;

const SModalVideoWrapper = styled.div`
  top: 50%;
  width: 100%;
  height: 100%;
  position: relative;
  transform: translateY(-50%);

  ${({ theme }) => theme.media.mobileL} {
    top: unset;
    width: 284px;
    height: 500px;
    margin: 0 auto 20px auto;
    transform: unset;
  }
`;

const SModalCloseIcon = styled.div`
  top: 16px;
  left: 16px;
  position: absolute;

  button {
    width: 36px;
    height: 36px;
    border-radius: 12px;
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
    justify-content: space-between;
  }
`;

const SModalTopLineTitleTablet = styled(Headline)`
  width: 100%;

  text-align: center;
  color: ${(props) => props.theme.colorsThemed.text.primary};
`;

const SControlsContainer = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;

  width: calc(100% - 32px);

  display: flex;

  @media (min-width: 425px) {
    position: initial;

    width: 100%;

    justify-content: space-between;
  }
`;

const SCancelButton = styled(Button)``;

const SPublishButton = styled(Button)`
  width: 100%;
  height: 56px;

  @media (min-width: 425px) {
    width: initial;
    height: initial;
  }
`;
