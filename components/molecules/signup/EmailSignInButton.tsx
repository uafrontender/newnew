import React, { useMemo, useState } from 'react';
import { debounce } from 'lodash';
import styled from 'styled-components';

type TEmailSignInButton = React.ComponentPropsWithoutRef<'button'> & {};

const EmailSignInButton: React.FunctionComponent<TEmailSignInButton> = ({
  id,
  disabled,
  onClick,
  children,
}) => {
  const [mousePosition, setMousePosition] = useState<{
    x?: number;
    y?: number;
  }>({
    x: 0,
    y: 0,
  });
  const handleClick = useMemo(() => debounce(onClick!!, 300), [onClick]);

  return (
    <SEmailSignInButton
      id={id}
      x={mousePosition.x}
      y={mousePosition.y}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (disabled) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.round((rect.width / e.clientX) * 100);
        const y = Math.round((rect.height / e.clientY) * 100);
        const newMP = {
          x,
          y,
        };

        setMousePosition(newMP);
      }}
      onMouseMove={(e) => {
        if (disabled) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.round((rect.width / e.clientX) * 100);
        const y = Math.round((rect.height / e.clientY) * 100);
        const newMP = {
          x,
          y,
        };

        setMousePosition(newMP);
      }}
      onMouseLeave={() => {
        setMousePosition({
          x: 0,
          y: 0,
        });
      }}
      onClick={handleClick}
    >
      {children}
    </SEmailSignInButton>
  );
};

export default EmailSignInButton;

interface ISEmailSignInButton {
  x?: number;
  y?: number;
}

const SEmailSignInButton = styled.button<ISEmailSignInButton>`
  position: relative;
  z-index: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  height: 56px;

  font-weight: bold;
  font-size: 14px;
  line-height: 24px;

  border-radius: ${(props) => props.theme.borderRadius.medium};
  border: transparent;

  cursor: pointer;
  transition: 0.2s linear;
  /* No select */
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  color: ${(props) => props.theme.colorsThemed.button.color.primary};
  background: linear-gradient(
      300deg,
      rgba(29, 180, 255, 0.85) 0%,
      rgba(29, 180, 255, 0) 50%
    ),
    #1d6aff;

  span {
    z-index: 1;
  }

  &:after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    transition: 0.5s ease;
    background: linear-gradient(
        140deg,
        rgba(29, 180, 255, 0.85) 0%,
        rgba(29, 180, 255, 0) 50%
      ),
      #1d6aff;

    border-radius: ${(props) => props.theme.borderRadius.medium};
    border: transparent;
    opacity: 0;
  }

  &:hover:enabled {
    &:after {
      opacity: 1;
    }
  }

  &:focus:enabled {
    outline: none;

    box-shadow: ${(props) => props.theme.shadows.mediumBlue};
  }

  &:hover:enabled {
    box-shadow: ${(props) => props.theme.shadows.intenseBlue};
  }

  &:active:enabled {
    box-shadow: ${(props) => props.theme.shadows.mediumBlue};
  }

  &:active {
    background: ${(props) => props.theme.colorsThemed.button.ripple.primary};
    transform: scale(0.9);

    &:after {
      background: ${(props) => props.theme.colorsThemed.button.ripple.primary};
    }
  }

  &:disabled {
    opacity: 0.5;
  }

  ${({ theme }) => theme.media.tablet} {
    font-size: 16px;
    line-height: 24px;
  }
`;
