import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Button from '../../../../atoms/Button';
import Modal from '../../../../organisms/Modal';
import Text from '../../../../atoms/Text';

interface IMcOptionCardModerationEllipseModal {
  isOpen: boolean;
  zIndex: number;
  onClose: () => void;
  isBySubscriber: boolean;
  canBeDeleted: boolean;
  handleOpenReportOptionModal: () => void;
  handleOpenBlockUserModal: () => void;
  handleOpenRemoveOptionModal: () => void;
}

const McOptionCardModerationEllipseModal: React.FunctionComponent<IMcOptionCardModerationEllipseModal> = ({
  isOpen,
  zIndex,
  onClose,
  isBySubscriber,
  canBeDeleted,
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
          {isBySubscriber ? (
            <>
              <SButton
                view="secondary"
                onClick={() => {
                  handleOpenReportOptionModal();
                  onClose();
                }}
              >
                <Text variant={2} tone='error'>{ t('McPostModeration.OptionsTab.OptionCard.ellipse.report') }</Text>
              </SButton>
              <SButton
                view="secondary"
                onClick={() => {
                  handleOpenBlockUserModal();
                  onClose();
                }}
              >
                 <Text variant={2}>{ t('McPostModeration.OptionsTab.OptionCard.ellipse.block') }</Text>
              </SButton>
            </>
          ) : null}
          <SButton
            view="secondary"
            disabled={!canBeDeleted}
            onClick={() => {
              handleOpenRemoveOptionModal();
              onClose();
            }}
          >
            <Text variant={2}>{ t('McPostModeration.OptionsTab.OptionCard.ellipse.remove') }</Text>
          </SButton>
        </SContentContainer>
        <Button
          view="secondary"
          style={{
            height: '56px',
            width: 'calc(100% - 32px)',
          }}
        >
           <Text variant={2}>{ t('ellipse.cancel') }</Text>
        </Button>
      </SWrapper>
    </Modal>
  );
};

export default McOptionCardModerationEllipseModal;

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
