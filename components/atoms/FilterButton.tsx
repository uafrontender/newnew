/* eslint-disable default-case */
import React from 'react';
import styled, { css } from 'styled-components';
import Button from './Button';

interface IFilterButton {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  view: 'primary' | 'secondary';
}

export const FilterButton: React.FC<IFilterButton> = ({
  active,
  children,
  view,
  onClick,
}) => (
  <SButton
    size='sm'
    view='secondary'
    filterView={view}
    active={active}
    onClick={onClick}
  >
    {children}
  </SButton>
);

export default FilterButton;

interface ISButton {
  active: boolean;
  filterView: 'primary' | 'secondary';
}

const SButton = styled(Button)<ISButton>`
  min-width: 96px;
  padding: 8px;
  cursor: pointer;
  margin-right: 16px;
  border-radius: 12px !important;
  ${(props) => {
    if (props.active) {
      return css`
        color: ${({ theme }) =>
          props.filterView === 'primary'
            ? theme.colorsThemed.background.tertiary
            : theme.colors.white};

        background: ${({ theme }) =>
          props.filterView === 'primary'
            ? theme.colorsThemed.text.primary
            : theme.colorsThemed.button.background.primaryGrad} !important;
      `;
    }

    return css`
      color: ${props.theme.colorsThemed.text.primary};
      background: ${props.theme.colorsThemed.background.secondary};
    `;
  }}
`;
