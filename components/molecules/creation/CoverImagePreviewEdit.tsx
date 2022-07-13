import React, { useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'next-i18next';

import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import InlineSVG from '../../atoms/InlineSVG';
import Headline from '../../atoms/Headline';
import CoverImageUpload from './CoverImageUpload';

import { useAppSelector } from '../../../redux-store/store';

import chevronLeft from '../../../public/images/svg/icons/outlined/ChevronLeft.svg';

interface ICoverImagePreviewEdit {
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
}

const CoverImagePreviewEdit: React.FunctionComponent<ICoverImagePreviewEdit> =
  ({ open, handleClose, handleSubmit }) => {
    const theme = useTheme();
    const { t } = useTranslation('page-Creation');
    const { resizeMode } = useAppSelector((state) => state.ui);
    const isMobile = ['mobile', 'mobileS', 'mobileM'].includes(resizeMode);

    const preventCLick = useCallback((e: any) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const onSubmit = useCallback(() => {
      handleSubmit();
    }, [handleSubmit]);

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
            <CoverImageUpload />
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
              <Button view='primaryGrad' onClick={onSubmit}>
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
