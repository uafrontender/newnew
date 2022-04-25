import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Button from '../../../../atoms/Button';
import Modal from '../../../../organisms/Modal';

interface IAcOptionCardModerationEllipseModal {
  isOpen: boolean;
  zIndex: number;
  canDeleteOption: boolean;
  onClose: () => void;
  handleOpenReportOptionModal: () => void;
  handleOpenBlockUserModal: () => void;
  handleOpenRemoveOptionModal: () => void;
}

const AcOptionCardModerationEllipseModal: React.FunctionComponent<IAcOptionCardModerationEllipseModal> = ({
  isOpen,
  zIndex,
  canDeleteOption,
  onClose,
  handleOpenReportOptionModal,
  handleOpenBlockUserModal,
  handleOpenRemoveOptionModal,
}) => {
  const { t } = useTranslation('decision');

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
          <SButton
            view="secondary"
            onClick={() => {
              handleOpenReportOptionModal();
              onClose();
            }}
          >
            { t('AcPostModeration.OptionsTab.OptionCard.ellipse.report') }
          </SButton>
          <SButton
            view="secondary"
            onClick={() => {
              handleOpenBlockUserModal();
              onClose();
            }}
          >
            { t('AcPostModeration.OptionsTab.OptionCard.ellipse.block') }
          </SButton>
          <SButton
            view="secondary"
            disabled={!canDeleteOption}
            onClick={() => {
              handleOpenRemoveOptionModal();
              onClose();
            }}
          >
            { t('AcPostModeration.OptionsTab.OptionCard.ellipse.remove') }
          </SButton>
        </SContentContainer>
        <Button
          view="secondary"
          style={{
            height: '56px',
            width: 'calc(100% - 32px)',
          }}
        >
          { t('ellipse.cancel') }
        </Button>
      </SWrapper>
    </Modal>
  );
};

export default AcOptionCardModerationEllipseModal;

const SWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 16px;
`;

const SContentContainer = styled.div`
  width: calc(100% - 32px);
  display: flex;
  flex-direction: column;
  gap: 6px;

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: 480px;
    margin: auto;
  }
`;


const SButton = styled(Button)`
  border: transparent;

  text-align: center;

  cursor: pointer;

  height: 56px;

  &:focus, &:hover {
    outline: none;
  }

  &:focus:enabled, &:hover:enabled {
    outline: none;
    background-color: ${({ theme }) => theme.colorsThemed.background.quinary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
