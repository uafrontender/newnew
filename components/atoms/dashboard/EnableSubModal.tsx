/* eslint-disable no-unsafe-optional-chaining */
import React from 'react';
import { newnewapi } from 'newnew-api';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import preventParentClick from '../../../utils/preventParentClick';
import Modal from '../../organisms/Modal';
import Button from '../Button';
import CloseModalButton from './CloseModalButton';
import { formatNumber } from '../../../utils/format';

interface IEnableSubModal {
  confirmEnableSub: boolean;
  selectedProduct: newnewapi.ISubscriptionProduct;
  closeModal: () => void;
  subEnabled: () => void;
}

const EnableSubModal: React.FC<IEnableSubModal> = ({
  confirmEnableSub,
  selectedProduct,
  closeModal,
  subEnabled,
}) => {
  const { t } = useTranslation('creator');
  const handleSubmit = () => {
    subEnabled();
  };

  return (
    <Modal show={confirmEnableSub} onClose={closeModal}>
      <SContainer>
        <SModal onClick={preventParentClick()}>
          <SModalHeader>
            <SModalTitle>{t('enableSubModal.title')}</SModalTitle>
            <CloseModalButton handleClick={closeModal} />
          </SModalHeader>
          <SModalContent>
            <SProductInfo>{`${t('enableSubModal.confirmationTextFirstPart')}
            $${formatNumber(
              selectedProduct?.monthlyRate?.usdCents!! / 100 ?? 0,
              true
            )}
            ${t('enableSubModal.confirmationTextSecondPart')}`}</SProductInfo>
            <SNote>{t('enableSubModal.note')}</SNote>
          </SModalContent>
          <SConfirmButton view='primaryGrad' onClick={handleSubmit}>
            {t('enableSubModal.bntText')}
          </SConfirmButton>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default EnableSubModal;

const SContainer = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const SModal = styled.div`
  width: 100%;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.secondary};
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};
  padding: 0 16px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  line-height: 24px;
  height: 100%;
  overflow: auto;

  ${(props) => props.theme.media.tablet} {
    height: auto;
    padding: 24px;
    max-width: 480px;
    border-radius: ${(props) => props.theme.borderRadius.medium};
  }
`;

const SModalHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  justify-content: space-between;
`;

const SModalTitle = styled.strong`
  font-size: 20px;
  margin: 0;
  font-weight: 600;
`;

const SModalContent = styled.div`
  padding: 0 22px;
`;

const SProductInfo = styled.div`
  border-radius: 16px;
  padding: 16px;
  margin: 0 0 6px;
  background: ${(props) => props.theme.colorsThemed.background.quaternary};
  text-align: center;
`;

const SNote = styled.p`
  font-size: 12px;
  margin-bottom: 20px;
  color: ${(props) => props.theme.colorsThemed.text.tertiary};
`;

const SConfirmButton = styled(Button)`
  padding: 16px 10px;
  line-height: 24px;
  font-size: 16px;
  width: 100%;

  &:disabled {
    cursor: default;
    opacity: 1;
    outline: none;

    :after {
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: '';
      opacity: 1;
      z-index: 6;
      position: absolute;
      background: ${(props) => props.theme.colorsThemed.button.disabled};
    }
  }
  ${(props) => props.theme.media.tablet} {
    width: auto;
    flex-shrink: 0;
    padding: 16px 24px;
  }
`;
