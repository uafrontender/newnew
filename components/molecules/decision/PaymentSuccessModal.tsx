import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Button from '../../atoms/Button';
import Modal from '../../organisms/Modal';
import Headline from '../../atoms/Headline';

import { TPostType } from '../../../utils/switchPostType';

interface IPaymentSuccessModal {
  postType: TPostType;
  isVisible: boolean;
  closeModal: () => void;
}

const PaymentSuccessModal: React.FC<IPaymentSuccessModal> = ({
  postType,
  isVisible,
  closeModal,
  children,
}) => {
  const { t } = useTranslation('decision');

  return (
    <Modal show={isVisible} additionalZ={14} onClose={closeModal}>
      <SContainer onClick={(e) => e.stopPropagation()}>
        <SModal>
          <SModalTitle variant={6}>
            {t(`PaymentSuccessModal.title.${postType}`)}
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
  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 24px;
`;

const SDoneButton = styled(Button)`
  width: 100%;
`;
