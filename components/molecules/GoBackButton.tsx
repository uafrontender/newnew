import React from 'react';
import styled from 'styled-components';

// Components
import InlineSvg from '../atoms/InlineSVG';

// Icons
import BackButtonIcon from '../../public/images/svg/auth/icon-back.svg';

interface IGoBackButton {
  children?: React.ReactNode;
  onClick: () => void;
}

const GoBackButton: React.FunctionComponent<IGoBackButton> = ({
  children,
  onClick,
  ...rest
}) => (
  <SGoBackButton
    onClick={onClick}
    {...rest}
  >
    <InlineSvg
      svg={BackButtonIcon}
      width="24px"
      height="24px"
    />
    { children }
  </SGoBackButton>
);

GoBackButton.defaultProps = {
  children: undefined,
};

export default GoBackButton;

const SGoBackButton = styled.button`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  font-weight: bold;
  font-size: 15px;
  line-height: 20px;

  color: ${({ theme }) => theme.colorsThemed.text.quaternary};
  background-color: transparent;
  border: transparent;

  cursor: pointer;

  & div {
    margin-right: 8px;
  }
  & path {
    fill: ${({ theme }) => theme.colorsThemed.text.quaternary};
  }

  &:hover, &:focus {
    outline: none;
    color: ${({ theme }) => theme.colorsThemed.text.primary};

    & path {
      fill: ${({ theme }) => theme.colorsThemed.text.primary};
    }

    transition: .2s ease;
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;
