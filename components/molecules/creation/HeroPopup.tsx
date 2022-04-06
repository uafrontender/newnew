import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import Image from 'next/image';

import Text from '../../atoms/Text';
import Modal from '../../organisms/Modal';
import Headline from '../../atoms/Headline';
import preventParentClick from '../../../utils/preventParentClick';

import dcImage from '../../../public/images/creation/Decision-creation.webp';
import Button from '../../atoms/Button';

const IMAGES: any = {
  DC: dcImage,
};

interface IHeroPopup {
  isPopupVisible: boolean;
  postType: string;
  closeModal: () => void;
}

const HeroPopup: React.FC<IHeroPopup> = ({ isPopupVisible, postType, closeModal }) => {
  const { t } = useTranslation('creation');
  return (
    <Modal show={isPopupVisible} onClose={closeModal} additionalZ={99999}>
      <SContainer>
        <SModal onClick={preventParentClick()}>
          <SImageWrapper>
            <Image src={IMAGES[postType]} alt="Post type image" width={400} height={274} objectFit="contain" priority />
          </SImageWrapper>
          <STitle variant={4}>{t(`heroPopup${postType}.title`)}</STitle>
          <SText variant={2}>{t(`heroPopup${postType}.description`)}</SText>
          <SButton view="primary" onClick={closeModal}>
            {t('heroPopupCommon.btnText')}
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
  border-top: 1px solid ${(props) => props.theme.colorsThemed.background.outlines1};
  text-align: center;
`;

const SModal = styled.div`
  background: ${(props) =>
    props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.secondary};
  color: ${(props) =>
    props.theme.name === 'light' ? props.theme.colorsThemed.text.primary : props.theme.colors.white};
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
  width: 400px;
  height: 274px;
  margin: 0 auto 24px;
`;

const STitle = styled(Headline)`
  margin-bottom: 16px;
`;

const SText = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.primary};
  margin-bottom: 24px;
`;

const SButton = styled(Button)`
  margin: 0 auto;
`;
