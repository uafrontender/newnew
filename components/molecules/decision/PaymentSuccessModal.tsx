import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import Image from 'next/image';

import Button from '../../atoms/Button';
import Modal from '../../organisms/Modal';
import Headline from '../../atoms/Headline';

import PaymentSuccesIcon from '../../../public/images/decision/payment-success.png';

interface IPaymentSuccessModal {
  isVisible: boolean,
  closeModal: () => void;
}

const PaymentSuccessModal: React.FC<IPaymentSuccessModal> = ({
  isVisible,
  closeModal,
  children,
}) => {
  const { t } = useTranslation('decision');

  return (
    <Modal
      show={isVisible}
      additionalZ={14}
      onClose={closeModal}
    >
      <SContainer
        onClick={(e) => e.stopPropagation()}
      >
        <SModal>
          <Image
            src={PaymentSuccesIcon}
            height={140}
            objectFit="contain"
          />
          <SModalTitle
            variant={6}
          >
            {t('PaymentSuccessModal.title')}
          </SModalTitle>
          <SModalMessage>
            {children}
          </SModalMessage>
          <SDoneButton
            onClick={closeModal}
          >
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
  max-width: 480px;
  width: 100%;
  background: ${(props) =>
    props.theme.name === 'light' ? props.theme.colors.white : props.theme.colorsThemed.background.secondary};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  color: ${(props) =>
    props.theme.name === 'light' ? props.theme.colorsThemed.text.primary : props.theme.colors.white};
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
  font-size: 16px;
  margin-bottom: 24px;
`;

const SDoneButton = styled(Button)`
  width: 100%;
`;
