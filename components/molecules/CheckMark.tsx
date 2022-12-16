import React, { useCallback } from 'react';
import styled, { css, useTheme } from 'styled-components';
import InlineSvg from '../atoms/InlineSVG';

import Text from '../atoms/Text';

import CheckmarkIcon from '../../public/images/svg/icons/outlined/Checkmark.svg';

interface ICheckMark {
  id?: string;
  className?: string;
  label?: string;
  selected?: boolean;
  disabled?: boolean;
  handleChange?: (e: any, id?: string) => void;
  variant?: 1 | 2;
  size?: 'small' | 'default';
}

const CheckMark: React.FC<ICheckMark> = (props) => {
  const {
    id,
    className,
    label,
    selected,
    disabled,
    handleChange,
    variant,
    size,
    ...rest
  } = props;
  const theme = useTheme();

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      handleChange?.(e, id);
    },
    [id, handleChange, disabled]
  );

  return (
    <SWrapper
      className={className}
      onClick={onClick}
      style={{
        ...(disabled
          ? {
              cursor: 'default',
            }
          : {}),
      }}
      {...rest}
    >
      <SAnimation>
        <SCheckmark
          id={id}
          selected={selected ?? false}
          disabled={disabled}
          variant={variant}
          size={size}
          type='button'
          style={{
            ...(disabled
              ? {
                  borderColor: theme.colorsThemed.background.outlines1,
                  cursor: 'default',
                }
              : {}),
          }}
        >
          {selected && (
            <InlineSvg
              svg={CheckmarkIcon}
              width={size === 'small' ? '10px' : '12px'}
              height={size === 'small' ? '8px' : '10px'}
            />
          )}
        </SCheckmark>
      </SAnimation>
      <SLabel variant={3} weight={600}>
        {label}
      </SLabel>
    </SWrapper>
  );
};

export default CheckMark;

CheckMark.defaultProps = {
  id: '',
  className: undefined,
  selected: false,
  disabled: false,
  handleChange: undefined,
  variant: 1,
  size: 'default',
};

const SWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: flex-start;
`;

const SAnimation = styled.div`
  margin-right: 11px;
`;

const SCheckmark = styled.button<{
  selected: boolean;
  variant?: 1 | 2;
  size?: 'small' | 'default';
}>`
  position: relative;
  display: block;

  width: 24px;
  height: 24px;
  padding: 0;

  background: transparent;
  border: none;

  border-style: solid;
  border-width: 2px;
  border-radius: 14.5%;
  border-color: ${({ selected, theme }) =>
    !selected ? theme.colorsThemed.background.outlines2 : 'transparent'};

  ${({ size }) =>
    size === 'small'
      ? css`
          width: 18px;
          height: 18px;
        `
      : css`
          width: 24px;
          height: 24px;
        `}

  ${({ selected, variant }) => {
    switch (variant) {
      case 1: {
        return css`
          border-color: ${({ theme }) =>
            !selected
              ? theme.colorsThemed.background.outlines2
              : 'transparent'};
        `;
      }
      case 2: {
        return css`
          border-color: ${({ theme }) =>
            !selected
              ? theme.colorsThemed.background.outlines1
              : 'transparent'};
        `;
      }
      default: {
        return css`
          border-color: ${({ theme }) =>
            !selected
              ? theme.colorsThemed.background.outlines2
              : 'transparent'};
        `;
      }
    }
  }}

  ${({ selected, variant }) =>
    selected
      ? css`
          border: none;
          border-radius: 26.5%;

          background: ${({ theme }) => {
            switch (variant) {
              case 1: {
                return theme.colorsThemed.button.background.primary;
              }
              case 2: {
                return theme.name === 'dark'
                  ? theme.colors.darkGray
                  : theme.colorsThemed.background.outlines1;
              }
              default: {
                return theme.colorsThemed.button.background.primary;
              }
            }
          }};
        `
      : css`
          &:focus {
            border-color: ${({ theme }) => theme.colorsThemed.text.secondary};
          }
          &:hover {
            border-color: ${({ theme }) => theme.colorsThemed.text.secondary};
          }
        `};

  transition: 0.2s linear;
  cursor: pointer;

  &:focus {
    outline: none;
  }

  div {
    position: absolute;
    top: -4px;
    left: -4px;

    ${({ size }) =>
      size === 'small'
        ? css`
            width: 26px;
            height: 26px;
          `
        : css`
            width: 32px;
            height: 32px;
          `}

    animation: emerge 0.2s forwards;
  }

  svg {
    ${({ size }) =>
      size === 'small'
        ? css`
            width: 10px;
            height: 8px;
          `
        : css`
            width: 12px;
            height: 10px;
          `}

    ${({ variant }) => {
      switch (variant) {
        case 1: {
          return css`
            color: ${({ theme }) => theme.colors.white};
          `;
        }
        case 2: {
          return css`
            color: ${({ theme }) => theme.colorsThemed.text.secondary};
          `;
        }
        default: {
          return css`
            color: ${({ theme }) => theme.colors.white};
          `;
        }
      }
    }}
  }

  @keyframes emerge {
    from {
      transform: scale(1.2);
    }
    to {
      transform: scale(1);
    }
  }
`;

const SLabel = styled(Text)``;
