import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Modal from '../../../organisms/Modal';
import ModalPaper from '../../../organisms/ModalPaper';
import Button from '../../../atoms/Button';
import logo from '../../../../public/images/dashboard/logo-modal.png';
import Headline from '../../../atoms/Headline';
import Text from '../../../atoms/Text';
import assets from '../../../../constants/assets';
import AnimatedBackground from '../../../atoms/AnimationBackground';

interface IFunction {
  show: boolean;
  isBundlesEnabled: boolean | undefined;
  zIndex?: number;
  onClose: () => void;
}

const SuccessBundleModal: React.FC<IFunction> = React.memo(
  ({ show, isBundlesEnabled, zIndex, onClose }) => {
    const { t } = useTranslation('page-Creator');
    return (
      <>
        <Modal show={show} additionalz={zIndex} onClose={onClose} overlaydim>
          {isBundlesEnabled ? (
            <AnimatedBackground src={assets.common.vote} alt='vote' />
          ) : null}
          <SModalPaper onClose={onClose}>
            <Content id='success-bundle-modal'>
              <SImgHolder>
                <img src={logo.src} alt={t('dashboard.aboutBundles.title')} />
              </SImgHolder>
              <STitle variant={4}>
                {isBundlesEnabled === true
                  ? t('myBundles.modals.activated.title')
                  : t('myBundles.modals.deactivated.title')}
              </STitle>
              <SText variant={2}>
                {isBundlesEnabled === true
                  ? t('myBundles.modals.activated.text')
                  : t('myBundles.modals.deactivated.text')}
              </SText>
              <SDoneButton onClick={onClose}>
                {t('myBundles.modals.button')}
              </SDoneButton>
            </Content>
          </SModalPaper>
        </Modal>
      </>
    );
  }
);

export default SuccessBundleModal;

const SModalPaper = styled(ModalPaper)`
  width: 100%;
  padding: 24px;
  margin: 16px;

  ${({ theme }) => theme.media.tablet} {
    padding: 32px;
    max-width: 500px;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SDoneButton = styled(Button)`
  width: fit-content;
  min-width: 140px;

  margin-left: auto;
  margin-right: auto;
`;

const SImgHolder = styled.div``;

const STitle = styled(Headline)`
  margin-bottom: 16px;
`;
const SText = styled(Text)`
  margin-bottom: 30px;
`;
