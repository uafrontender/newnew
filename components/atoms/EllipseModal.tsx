import React, { ReactElement } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import { isArray } from 'lodash';

import Modal from '../organisms/Modal';
import Button from './Button';
import Text from './Text';

interface IEllipseModal {
  show: boolean;
  zIndex?: number;
  onClose: () => void;
  children: ReactElement | (ReactElement | undefined | null | false)[];
}

const EllipseModal: React.FunctionComponent<IEllipseModal> = ({
  show,
  zIndex,
  onClose,
  children,
}) => {
  const { t } = useTranslation('common');

  const listOfChildren: ReactElement[] = isArray(children)
    ? (children.filter((child) => child) as ReactElement[])
    : [children];

  return (
    <Modal show={show} overlaydim additionalz={zIndex} onClose={onClose}>
      <SWrapper>
        <SContentContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {listOfChildren.map((child, index) => (
            <>
              {child}
              {index !== listOfChildren.length - 1 && <SSeparator />}
            </>
          ))}
        </SContentContainer>
        <CancelButton
          view='secondary'
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          {t('ellipse.cancel')}
        </CancelButton>
      </SWrapper>
    </Modal>
  );
};

EllipseModal.defaultProps = {
  zIndex: undefined,
};

export default EllipseModal;

interface IEllipseModalButton {
  tone?: 'neutral' | 'error';
  disabled?: boolean;
  onClick: () => void;
  children: string;
}

export const EllipseModalButton: React.FC<IEllipseModalButton> = ({
  tone,
  disabled,
  onClick,
  children,
}) => (
  <SButton onClick={onClick} disabled={disabled}>
    <Text variant={3} tone={tone}>
      {children}
    </Text>
  </SButton>
);

const SButton = styled.button`
  padding: 18px;
  background: none;
  border: transparent;

  text-align: center;

  cursor: pointer;

  &:focus {
    outline: none;
  }
`;

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

  margin-bottom: 14px;

  background-color: ${({ theme }) => theme.colorsThemed.background.secondary};

  border-radius: ${({ theme }) => theme.borderRadius.medium};

  z-index: 1;

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: 480px;
    margin: auto;
  }
`;

const CancelButton = styled(Button)`
  height: 56px;
  width: calc(100% - 32px);
`;

const SSeparator = styled.div`
  width: 100%;
  border-bottom: 1px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};
`;
