import React from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';

import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import Headline from '../../atoms/Headline';
import preventParentClick from '../../../utils/preventParentClick';

import Button from '../../atoms/Button';
import assets from '../../../constants/assets';

const DARK_IMAGES: Record<string, () => string> = {
  AC: assets.creation.darkAcAnimated,
  CF: assets.creation.darkCfAnimated,
  MC: assets.creation.darkMcAnimated,
};

const LIGHT_IMAGES: Record<string, () => string> = {
  AC: assets.creation.lightAcAnimated,
  CF: assets.creation.lightCfAnimated,
  MC: assets.creation.lightMcAnimated,
};

interface IHeroPopup {
  isPopupVisible: boolean;
  postType: 'AC' | 'MC' | 'CF';
  closeModal: () => void;
}

const HeroPopup: React.FC<IHeroPopup> = ({
  isPopupVisible,
  postType,
  closeModal,
}) => {
  const { t } = useTranslation('page-Creation');
  const theme = useTheme();

  return (
    <Modal show={isPopupVisible} onClose={closeModal} additionalz={99999}>
      <SContainer>
        <SModal onClick={preventParentClick()}>
          <SImageWrapper>
            <img
              src={
                theme.name === 'light'
                  ? LIGHT_IMAGES[postType]()
                  : DARK_IMAGES[postType]()
              }
              alt='Post type'
              width={150}
              height={130}
              style={{ objectFit: 'contain' }}
            />
          </SImageWrapper>
          <STitle variant={4}>
            {t(`tutorials.heroPopup${postType}.title`)}
          </STitle>
          <SText variant={2}>{t(`tutorials.heroPopup${postType}.line1`)}</SText>
          <SText variant={2}>{t(`tutorials.heroPopup${postType}.line2`)}</SText>
          <SText variant={2}>{t(`tutorials.heroPopup${postType}.line3`)}</SText>
          <SButton view='primary' onClick={closeModal}>
            {t('tutorials.heroPopupCommon.heroButtonText')}
          </SButton>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default HeroPopup;

const SContainer = styled.div`
  display: flex;
  padding: 16px 0;
  align-items: center;
  justify-content: center;
  height: 100%;
  border-top: 1px solid
    ${(props) => props.theme.colorsThemed.background.outlines1};
  text-align: center;
`;

const SModal = styled.div`
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.secondary};
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};
  display: flex;
  flex-direction: column;
  height: auto;
  padding: 24px;
  max-width: 480px;
  border-radius: ${(props) => props.theme.borderRadius.medium};
  overflow: auto;
  margin: 0 16px;

  ${(props) => props.theme.media.tablet} {
    padding: 40px;
  }
`;

const SImageWrapper = styled.div`
  width: 150px;
  height: 130px;
  margin: 0 auto 24px;
`;

const STitle = styled(Headline)`
  margin-bottom: 16px;
`;

const SText = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  margin-bottom: 24px;
  white-space: pre-line;
`;

const SButton = styled(Button)`
  margin: 0 auto;
`;
