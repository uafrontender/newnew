import React from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';

import Modal from '../../organisms/Modal';
import Button from '../../atoms/Button';
import Text from '../../atoms/Text';

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
  const { t: tCommon } = useTranslation('common');

  return (
    <Modal show={isOpen} overlaydim additionalz={zIndex} onClose={onClose}>
      <SWrapper>
        <SContentContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {!isPrimary && (
            <SButton>
              <Text variant={2}>
                {t('Settings.sections.cards.ellipse.makePrimary')}
              </Text>
            </SButton>
          )}
          <SButton>
            <Text variant={2} tone='error'>
              {t('Settings.sections.cards.ellipse.removeCard')}
            </Text>
          </SButton>
        </SContentContainer>
        <Button
          view='modalSecondary'
          style={{
            height: '56px',
            width: 'calc(100% - 32px)',
          }}
          onClick={onClose}
        >
          {tCommon('ellipse.cancel')}
        </Button>
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
  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.tertiary};

  border-radius: ${({ theme }) => theme.borderRadius.medium};

  z-index: 1;

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: 480px;
    margin: auto;
  }
`;

const SButton = styled.button`
  background: none;
  border: transparent;
  text-align: center;
  cursor: pointer;
  padding: 16px;
  &:focus {
    outline: none;
  }
`;
