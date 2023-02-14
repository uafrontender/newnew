import React from 'react';
import styled from 'styled-components';

import Modal, { ModalType } from '../../../organisms/Modal';

interface IOptionActionMobileModal {
  show: boolean;
  type?: ModalType;
  zIndex: number;
  children: React.ReactNode;
  onClose: () => void;
}

const OptionActionMobileModal: React.FunctionComponent<
  IOptionActionMobileModal
> = ({ show, type, zIndex, children, onClose }) => (
  <Modal show={show} type={type} additionalz={zIndex} onClose={onClose}>
    <SWrapper>
      <SContentContainer
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {children}
      </SContentContainer>
    </SWrapper>
  </Modal>
);

export default OptionActionMobileModal;

const SWrapper = styled.div``;

const SContentContainer = styled.div`
  position: absolute;
  bottom: 0;

  width: 100%;
  max-height: calc(100% - 116px);

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  border-top-left-radius: ${({ theme }) => theme.borderRadius.medium};
  border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
`;
