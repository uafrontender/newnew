import React, { ReactElement, useCallback, useState } from 'react';
import { useTranslation } from 'next-i18next';
import styled from 'styled-components';
import isArray from 'lodash/isArray';

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
    <Modal show={show} additionalz={zIndex} onClose={onClose}>
      <SWrapper>
        <SContentContainer
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {listOfChildren.map((child, index) => (
            <React.Fragment
              // eslint-disable-next-line react/no-array-index-key
              key={index}
            >
              {child}
              {index !== listOfChildren.length - 1 && <SSeparator />}
            </React.Fragment>
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
  onClick?: (
    e?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => Promise<void> | void;
  children: string | React.ReactNode;
}

export const EllipseModalButton: React.FC<IEllipseModalButton> = ({
  tone,
  disabled,
  onClick,
  children,
}) => {
  const [busy, setBusy] = useState(false);
  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (onClick) {
        setBusy(true);
        await onClick(e);
        setBusy(false);
      }
    },
    [onClick]
  );

  return (
    <SButton onClick={handleClick} disabled={disabled || busy}>
      <Text variant={3} tone={tone}>
        {children}
      </Text>
    </SButton>
  );
};

const SWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: nowrap;
  gap: 6px;
  padding-top: 16px;
  padding-bottom: 16px;
`;

const SContentContainer = styled.div`
  width: calc(100% - 32px);
  height: fit-content;

  display: flex;
  flex-direction: column;

  margin-bottom: 14px;

  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.tertiary};

  border-radius: ${({ theme }) => theme.borderRadius.medium};

  z-index: 1;
  overflow: auto;

  ${({ theme }) => theme.media.tablet} {
    width: 480px;
    height: 480px;
    margin: auto;
  }
`;

const CancelButton = styled(Button)`
  flex-shrink: 0;
  height: 56px;
  width: calc(100% - 32px);

  background: ${(props) =>
    props.theme.name === 'light'
      ? props.theme.colors.white
      : props.theme.colorsThemed.background.tertiary};
`;

const SSeparator = styled.div`
  width: 100%;
  border-bottom: 1px solid
    ${({ theme }) => theme.colorsThemed.background.outlines1};
`;

const SButton = styled.button`
  padding: 18px;
  background: none;
  border: transparent;
  width: 100%;
  text-align: center;
  cursor: pointer;

  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  &:active {
    outline: none;
    background-color: ${({ theme }) => theme.colorsThemed.background.quinary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;
