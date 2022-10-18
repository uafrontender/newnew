/* eslint-disable default-case */
import React from 'react';
import styled, { css } from 'styled-components';
import Button from './Button';

interface IFilterButton {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

export const FilterButton: React.FC<IFilterButton> = ({
  active,
  children,
  onClick,
}) => (
  <STab size='sm' view='secondary' active={active} onClick={onClick}>
    {children}
  </STab>
);

export default FilterButton;

interface ISButton {
  active: boolean;
}

const STab = styled(Button)<ISButton>`
  min-width: 96px;
  padding: 8px;
  cursor: pointer;
  margin-right: 16px;
  border-radius: 12px !important;
  ${(props) => {
    if (props.active) {
      return css`
        color: ${props.theme.colorsThemed.background.tertiary} !important;
        background: ${props.theme.colorsThemed.text.primary} !important;
      `;
    }
    return css`
      color: ${props.theme.colorsThemed.text.primary};
      background: ${props.theme.colorsThemed.background.secondary};
    `;
  }}
`;
