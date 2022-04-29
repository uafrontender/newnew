import React from 'react';
import { useTranslation } from 'next-i18next';
import styled, { useTheme } from 'styled-components';
import Image from 'next/image';

import Button from '../../atoms/Button';
import Modal from '../../organisms/Modal';
import Headline from '../../atoms/Headline';

import PaymentSuccesIcon from '../../../public/images/decision/payment-success.png';
import CloseIcon from '../../../public/images/svg/icons/outlined/Close.svg';
import InlineSvg from '../../atoms/InlineSVG';

interface IPaymentSuccessModal {
  isVisible: boolean;
  closeModal: () => void;
}

const PaymentSuccessModal: React.FC<IPaymentSuccessModal> = ({
  isVisible,
  closeModal,
  children,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('decision');

  return (
    <Modal show={isVisible} additionalZ={14} onClose={closeModal}>
      <SContainer onClick={(e) => e.stopPropagation()}>
        <SModal>
          <SInlineSVG
            clickable
            scaleOnClick
            svg={CloseIcon}
            fill={theme.colorsThemed.text.primary}
            width='24px'
            height='24px'
            onClick={closeModal}
          />
          <Image src={PaymentSuccesIcon} height={140} objectFit='contain' />
          <SModalTitle variant={6}>
            {t('PaymentSuccessModal.title')}
          </SModalTitle>
          <SModalMessage>{children}</SModalMessage>
          <SDoneButton onClick={closeModal}>
            {t('PaymentSuccessModal.doneBtn')}
          </SDoneButton>
        </SModal>
      </SContainer>
    </Modal>
  );
};

export default PaymentSuccessModal;

const SContainer = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const SModal = styled.div`
  position: relative;

  max-width: 480px;
  width: 100%;
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.secondary};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  color: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colorsThemed.text.primary
      : props.theme.colors.white};
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  line-height: 24px;
`;

const SModalTitle = styled(Headline)`
  margin-bottom: 16px;
  text-align: center;
`;

const SModalMessage = styled.p`
  text-align: center;
  font-size: 16px;
  margin-bottom: 24px;
`;

const SDoneButton = styled(Button)`
  width: 100%;
`;

const SInlineSVG = styled(InlineSvg)`
  position: absolute;
  right: 24px;
  top: 24px;

  z-index: 1;
  cursor: pointer;
`;
