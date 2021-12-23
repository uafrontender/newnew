import React from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Modal from '../../organisms/Modal';
import Video from '../../atoms/creation/Video';
import Button from '../../atoms/Button';
import Headline from '../../atoms/Headline';
import InlineSVG from '../../atoms/InlineSVG';

import chevronLeft from '../../../public/images/svg/icons/outlined/ChevronLeft.svg';
import closeIcon from '../../../public/images/svg/icons/outlined/Close.svg';

import { useAppSelector } from '../../../redux-store/store';

interface IFullPreview {
  open: boolean;
  value: any;
  handleClose: () => void;
}

export const FullPreview: React.FC<IFullPreview> = (props) => {
  const {
    open,
    value,
    handleClose,
  } = props;
  const theme = useTheme();
  const { t } = useTranslation('creation');
  const { resizeMode } = useAppSelector((state) => state.ui);
  const isMobile = ['mobile', 'mobileS', 'mobileM'].includes(resizeMode);

  const preventCLick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Modal
      show={open}
      onClose={handleClose}
    >
      <SMobileContainer onClick={preventCLick}>
        {!isMobile && (
          <SModalTopLine>
            <SModalTopLineTitleTablet variant={6}>
              {t('secondStep.video.full.title')}
            </SModalTopLineTitleTablet>
            <InlineSVG
              clickable
              svg={closeIcon}
              fill={theme.colorsThemed.text.primary}
              width="24px"
              height="24px"
              onClick={handleClose}
            />
          </SModalTopLine>
        )}
        <SModalVideoWrapper>
          <Video
            muted
            src={value}
            play={open}
          />
        </SModalVideoWrapper>
        {isMobile ? (
          <SModalCloseIcon>
            <Button
              iconOnly
              view="transparent"
              onClick={handleClose}
            >
              <InlineSVG
                svg={chevronLeft}
                fill={theme.colors.white}
                width="20px"
                height="20px"
              />
            </Button>
          </SModalCloseIcon>
        ) : (
          <SButtonsWrapper>
            <Button
              view="secondary"
              onClick={handleClose}
            >
              {t('secondStep.button.cancel')}
            </Button>
          </SButtonsWrapper>
        )}
      </SMobileContainer>
    </Modal>
  );
};

export default FullPreview;

const SMobileContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  min-height: 100vh;
  background: ${(props) => props.theme.colorsThemed.background.primary};

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
  position: relative;
  transform: translateY(-50%);

  ${({ theme }) => theme.media.mobileL} {
    top: unset;
    width: calc(100% - 58px);
    margin: 0 29px;
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
  color: ${(props) => props.theme.colorsThemed.text.primary};
`;

const SButtonsWrapper = styled.div`
  display: flex;
  margin-top: 30px;
  align-items: center;
  justify-content: space-between;
`;
