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
}

const CardEllipseModal: React.FunctionComponent<ICardEllipseModal> = ({
  isOpen,
  zIndex,
  isPrimary,
  onClose,
}) => {
  const { t } = useTranslation('page-Profile');

  return (
    <Modal show={isOpen} overlaydim additionalz={zIndex} onClose={onClose}>
      <SWrapper>
        <SContentContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Button view='danger' style={{ marginBottom: '16px' }}>
            {t('Settings.sections.cards.ellipse.removeCard')}
          </Button>
          {!isPrimary && (
            <Button view='primary'>
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
