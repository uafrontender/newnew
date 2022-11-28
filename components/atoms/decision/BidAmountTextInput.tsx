import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { formatNumber } from '../../../utils/format';

interface IBidAmountTextInput {
  id?: string;
  value: string;
  minAmount: number;
  disabled?: boolean;
  autofocus?: boolean;
  onChange: (newValue: string) => void;
  inputAlign: 'left' | 'center';
  bottomPlaceholder?: string;
  placeholder?: string;
  style?: React.CSSProperties;
}

const BidAmountTextInput: React.FunctionComponent<IBidAmountTextInput> = ({
  id,
  value,
  minAmount,
  disabled,
  autofocus,
  inputAlign,
  onChange,
  bottomPlaceholder,
  placeholder,
  style,
}) => {
  const inputRef = useRef<HTMLInputElement>();
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue =
      value.length > 0
        ? e.target.value
            .slice(1)
            .split(',')
            .filter((v) => v !== ',')
            .join('')
        : e.target.value;
    if (/[^0-9]/.test(newValue)) return;
    if (newValue.length > 5) return;

    onChange(newValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const currentValue =
      value.length > 0
        ? e.target.value
            .slice(1)
            .split(',')
            .filter((v) => v !== ',')
            .join('')
        : e.target.value;
    if (/[^0-9]/.test(currentValue)) return;

    if (currentValue.length > 0 && parseInt(currentValue) < minAmount) {
      onChange(minAmount.toString());
    }
  };

  useEffect(() => {
    if (autofocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [autofocus]);

  return (
    <SWrapper>
      <SInput
        id={id}
        ref={(el) => {
          inputRef.current = el!!;
        }}
        value={value ? `$${formatNumber(parseInt(value), true)}` : value}
        disabled={disabled ?? false}
        align={inputAlign}
        inputMode='numeric'
        placeholder={placeholder ?? `$${minAmount.toString()}`}
        onChange={handleOnChange}
        onBlur={handleBlur}
        style={style ?? {}}
      />
      {bottomPlaceholder && (
        <SBottomPlaceholder>{bottomPlaceholder}</SBottomPlaceholder>
      )}
    </SWrapper>
  );
};

BidAmountTextInput.defaultProps = {
  disabled: undefined,
  autofocus: undefined,
  bottomPlaceholder: undefined,
  placeholder: undefined,
  style: {},
};

export default BidAmountTextInput;

const SWrapper = styled.div`
  position: relative;

  display: flex;
  justify-content: center;

  ${({ theme }) => theme.media.tablet} {
    display: block;
  }
`;

const SInput = styled.input<{
  align: string;
}>`
  font-weight: 600;
  font-size: 32px;
  line-height: 40px;

  height: 48px;

  color: ${({ theme }) => theme.colorsThemed.text.primary};
  text-align: left;

  padding-left: calc(50% - 0.2em);
  width: 100%;

  background-color: transparent;
  border: 1.5px solid transparent;
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  ::placeholder {
    color: ${(props) => props.theme.colorsThemed.text.quaternary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colorsThemed.background.outlines2};
  }

  ${({ theme }) => theme.media.tablet} {
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    padding: 12.5px 2px;
    min-width: 80px;

    color: ${({ theme }) => theme.colorsThemed.text.primary};
    text-align: ${({ align }) => align};

    background-color: ${({ theme }) => theme.colorsThemed.background.tertiary};
  }
`;

const SBottomPlaceholder = styled.div``;
