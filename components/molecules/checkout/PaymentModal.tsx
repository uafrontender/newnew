/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '../../atoms/Button';
import Caption from '../../atoms/Caption';
import Text from '../../atoms/Text';

import Modal from '../../organisms/Modal';

interface IPaymentModal {
  isOpen: boolean;
  zIndex: number;
  onClose: () => void;
  handlePayWithWallet?: () => void;
  handlePayWithCardStripeRedirect?: () => void;
}

const PaymentModal: React.FunctionComponent<IPaymentModal> = ({
  isOpen,
  zIndex,
  onClose,
  handlePayWithWallet,
  handlePayWithCardStripeRedirect,
  children,
}) => {
  const { t } = useTranslation('payment-modal');

  const [selectedOption, setSelectedOption] = useState<'wallet' | 'card'>('card');

  return (
    <Modal
      show={isOpen}
      overlayDim
      additionalZ={zIndex}
      onClose={onClose}
    >
      <SWrapper>
        <SContentContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <SHeaderContainer>
            { children }
          </SHeaderContainer>
          <SPaymentMethodTitle
            variant={3}
          >
            { t('paymentMethodTitle') }
          </SPaymentMethodTitle>
          <Button
            view="primaryGrad"
            onClick={() => {
              if (selectedOption === 'card') {
                handlePayWithCardStripeRedirect?.();
              } else {
                handlePayWithWallet?.();
              }
            }}
          >
            Pay
          </Button>
        </SContentContainer>
      </SWrapper>
    </Modal>
  );
};

PaymentModal.defaultProps = {
  handlePayWithWallet: () => {},
  handlePayWithCardStripeRedirect: () => {},
};

export default PaymentModal;

const SWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const SContentContainer = styled.div`
  width: 100%;
  height: 100%;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: 480px;
    margin: auto;
  }
`;

const SHeaderContainer = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colorsThemed.background.outlines1};
`;

const SPaymentMethodTitle = styled(Text)`
  color: ${({ theme }) => theme.colorsThemed.text.tertiary};
`;
