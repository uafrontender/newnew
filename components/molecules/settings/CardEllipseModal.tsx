import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';

interface ICardEllipseModal {
  isOpen: boolean;
  isPrimary: boolean;
  zIndex?: number;
  top?: string;
  right?: string;
  onClose: () => void;
  onSetPrimaryCard: () => void;
  onDeleteCard: () => void;
}

const CardEllipseModal: React.FunctionComponent<ICardEllipseModal> = ({
  isOpen,
  zIndex,
  isPrimary,
  onClose,
  onSetPrimaryCard,
  onDeleteCard,
}) => {
  const { t } = useTranslation('page-Profile');

  const handleSetPrimaryCard = () => {
    onSetPrimaryCard();
    onClose();
  };

  const handleDeleteCard = () => {
    onDeleteCard();
    onClose();
  };

  return (
    <Modal show={isOpen} additionalz={zIndex} onClose={onClose}>
      <SWrapper>
        <SContentContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Button
            view='danger'
            style={{ marginBottom: '16px' }}
            onClick={handleDeleteCard}
          >
            {t('Settings.sections.cards.ellipse.removeCard')}
          </Button>
          {!isPrimary && (
            <Button view='primary' onClick={handleSetPrimaryCard}>
              {t('Settings.sections.cards.ellipse.makePrimary')}
            </Button>
          )}
        </SContentContainer>
      </SWrapper>
    </Modal>
  );
};

export default CardEllipseModal;

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
  height: fit-content;

  display: flex;
  flex-direction: column;

  z-index: 1;

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: 480px;
    margin: auto;
  }
`;
