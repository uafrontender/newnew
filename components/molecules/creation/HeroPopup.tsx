import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import Image from 'next/image';

import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import Headline from '../../atoms/Headline';
import preventParentClick from '../../../utils/preventParentClick';

import acImage from '../../../public/images/creation/AC.webp';
import mcImage from '../../../public/images/creation/MC.webp';
import cfImage from '../../../public/images/creation/CF.webp';
import Button from '../../atoms/Button';

const IMAGES: any = {
  AC: acImage,
  CF: cfImage,
  MC: mcImage,
};

interface IHeroPopup {
  isPopupVisible: boolean;
  postType: string;
  closeModal: () => void;
}

const HeroPopup: React.FC<IHeroPopup> = ({
  isPopupVisible,
  postType,
  closeModal,
}) => {
  const { t } = useTranslation('creation');

  return (
    <Modal show={isPopupVisible} onClose={closeModal} additionalZ={99999}>
      <SContainer>
        <SModal onClick={preventParentClick()}>
          <SImageWrapper>
            <Image
              src={IMAGES[postType]}
              alt='Post type image'
              width={150}
              height={130}
              objectFit='contain'
              priority
            />
          </SImageWrapper>
          <STitle variant={4}>
            {t(`tutorials.heroPopup${postType}.title`)}
          </STitle>
          <SText variant={2}>{t(`tutorials.heroPopup${postType}.line1`)}</SText>
          <SText variant={2}>{t(`tutorials.heroPopup${postType}.line2`)}</SText>
          <SText variant={2}>{t(`tutorials.heroPopup${postType}.line3`)}</SText>
          <SButton view='primary' onClick={closeModal}>
            {t('tutorials.heroPopupCommon.heroBtnText')}
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
