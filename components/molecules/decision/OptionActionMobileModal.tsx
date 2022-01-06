import React from 'react';
import styled from 'styled-components';

import Modal from '../../organisms/Modal';

interface IOptionActionMobileModal {
  isOpen: boolean;
  zIndex: number;
  onClose: () => void;
}

const OptionActionMobileModal: React.FunctionComponent<
  IOptionActionMobileModal
> = ({
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

export default OptionActionMobileModal;

const SWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: flex-end;
`;

const SContentContainer = styled.div`
  width: 100%;
  max-height: calc(100% - 116px);

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  border-top-left-radius: ${({ theme }) => theme.borderRadius.medium};
  border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
`;
