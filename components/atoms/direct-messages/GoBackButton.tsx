import React from 'react';
import styled from 'styled-components';
// Icons
import BackButtonIcon from '../../../public/images/svg/auth/icon-back.svg';
import InlineSvg from '../InlineSVG';

interface IGoBackButton {
  onClick: () => void;
}

const GoBackButton: React.FunctionComponent<IGoBackButton> = ({ onClick }) => (
  <SGoBackButton onClick={onClick}>
    <InlineSvg svg={BackButtonIcon} width='24px' height='24px' />
  </SGoBackButton>
);

export default GoBackButton;

const SGoBackButton = styled.button`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  font-weight: bold;
  font-size: 15px;
  line-height: 20px;

  color: ${({ theme }) => theme.colorsThemed.text.secondary};
  background-color: transparent;
  border: transparent;

  cursor: pointer;

  & div {
    margin-right: 8px;
  }
  & path {
    fill: ${({ theme }) => theme.colorsThemed.text.secondary};
  }

  &:hover,
  &:focus {
    outline: none;
    color: ${({ theme }) => theme.colorsThemed.text.primary};

    & path {
      fill: ${({ theme }) => theme.colorsThemed.text.primary};
      transition: 0.2s ease;
    }

    transition: 0.2s ease;
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;
