import React from 'react';
import styled from 'styled-components';

import Modal from '../../organisms/Modal';

interface IPaymentModal {
  isOpen: boolean;
  zIndex: number;
  onClose: () => void;
}

const PaymentModal: React.FunctionComponent<IPaymentModal> = ({
  isOpen,
  zIndex,
  onClose,
  children,
}) => (
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
        { children }
      </SContentContainer>
    </SWrapper>
  </Modal>
);

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
