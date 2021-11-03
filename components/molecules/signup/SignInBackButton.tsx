import React from 'react';
import styled from 'styled-components';

// Components
import InlineSvg from '../../atoms/InlineSVG';

// Icons
import BackButtonIcon from '../../../public/images/svg/auth/icon-back.svg';

interface ISignInBackButton {
  children: React.ReactNode;
  onClick: () => void;
}

const SignInBackButton: React.FunctionComponent<ISignInBackButton> = ({
  children,
  onClick,
  ...rest
}) => (
  <SBackButton
    onClick={onClick}
    {...rest}
  >
    <InlineSvg
      svg={BackButtonIcon}
      width="24px"
      height="24px"
    />
    { children }
  </SBackButton>
);

export default SignInBackButton;

const SBackButton = styled.button`
  display: flex;
  justify-content: flex-start;
  align-items: center;

  font-weight: bold;
  font-size: 15px;
  line-height: 20px;

  color: ${({ theme }) => (theme.name === 'light' ? theme.colorsThemed.text.secondary : theme.colorsThemed.text.primary)};
  background-color: transparent;
  border: transparent;

  cursor: pointer;

  & div {
    margin-right: 8px;
  }
  & path {
    fill: ${({ theme }) => (theme.name === 'light' ? theme.colorsThemed.text.secondary : theme.colorsThemed.text.primary)};
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;
